from datetime import datetime, timedelta
import logging
import os
from typing import List, Optional

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
import base64
import hashlib
import hmac
import json
import secrets
from pydantic import BaseModel, Field
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from database import create_tables, get_db, init_sample_data
from models import (
    AccessLog,
    Alert,
    CuerpoDeAguaDB,
    EnvironmentalParameter,
    ProtectedZone,
    Report,
    Role,
    Sensor,
    SensorReading,
    User,
    UserFavorite,
    WaterBodyParameter,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

SECRET_KEY = os.getenv("SECRET_KEY", "super-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
PBKDF2_ITERATIONS = 600_000
SALT_BYTES = 16
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

app = FastAPI(title="Observatorio de Aguas API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        os.getenv("FRONTEND_URL", "http://localhost:5173"),
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Utilidades de autenticación
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserCreate(BaseModel):
    email: str = Field(pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    password: str = Field(min_length=8)
    full_name: str
    role: Optional[str] = Field(default=None, description="Nombre del rol a asignar")


class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    role: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class RoleOut(BaseModel):
    id: int
    nombre: str
    descripcion: Optional[str]

    class Config:
        from_attributes = True


class CuerpoDeAgua(BaseModel):
    id: int
    nombre: str
    tipo: str
    latitud: float
    longitud: float
    contaminacion: str
    biodiversidad: str
    descripcion: Optional[str]
    temperatura: Optional[float]
    ph: Optional[float]
    oxigeno_disuelto: Optional[float]

    class Config:
        from_attributes = True


class CuerpoDeAguaCreate(BaseModel):
    nombre: str
    tipo: str
    latitud: float
    longitud: float
    contaminacion: str
    biodiversidad: str
    descripcion: Optional[str] = None
    temperatura: Optional[float] = None
    ph: Optional[float] = None
    oxigeno_disuelto: Optional[float] = None


class SensorCreate(BaseModel):
    nombre: str
    tipo: str
    cuerpo_agua_id: int
    latitud: Optional[float] = None
    longitud: Optional[float] = None
    descripcion: Optional[str] = None
    instalado_en: Optional[datetime] = None
    activo: bool = True


class SensorOut(BaseModel):
    id: int
    nombre: str
    tipo: str
    cuerpo_agua_id: int
    latitud: Optional[float]
    longitud: Optional[float]
    descripcion: Optional[str]
    activo: bool

    class Config:
        from_attributes = True


class ParameterCreate(BaseModel):
    nombre: str
    unidad: str
    valor_minimo: Optional[float] = None
    valor_maximo: Optional[float] = None
    descripcion: Optional[str] = None


class ParameterOut(BaseModel):
    id: int
    nombre: str
    unidad: str
    valor_minimo: Optional[float]
    valor_maximo: Optional[float]
    descripcion: Optional[str]

    class Config:
        from_attributes = True


class ReadingCreate(BaseModel):
    sensor_id: int
    parametro_id: int
    cuerpo_agua_id: int
    valor: float
    unidad: str
    observaciones: Optional[str] = None


class ReadingOut(BaseModel):
    id: int
    sensor_id: int
    parametro_id: int
    cuerpo_agua_id: int
    valor: float
    unidad: str
    tomado_en: datetime
    observaciones: Optional[str]

    class Config:
        from_attributes = True


class AlertCreate(BaseModel):
    cuerpo_agua_id: int
    nivel: str
    mensaje: str
    lectura_id: Optional[int] = None
    parametro_id: Optional[int] = None


class AlertOut(BaseModel):
    id: int
    cuerpo_agua_id: int
    nivel: str
    mensaje: str
    lectura_id: Optional[int]
    parametro_id: Optional[int]
    creada_en: datetime
    resuelta: bool

    class Config:
        from_attributes = True


class ProtectedZoneCreate(BaseModel):
    cuerpo_agua_id: int
    nombre: str
    categoria: Optional[str] = None
    descripcion: Optional[str] = None
    area_km2: Optional[float] = None
    estado: str = "activa"


class ProtectedZoneOut(BaseModel):
    id: int
    cuerpo_agua_id: int
    nombre: str
    categoria: Optional[str]
    descripcion: Optional[str]
    area_km2: Optional[float]
    estado: str

    class Config:
        from_attributes = True


class ReportCreate(BaseModel):
    cuerpo_agua_id: int
    titulo: str
    contenido: str
    formato: str = "texto"


class ReportOut(BaseModel):
    id: int
    cuerpo_agua_id: int
    usuario_id: Optional[int]
    titulo: str
    contenido: str
    formato: str
    generado_en: datetime

    class Config:
        from_attributes = True


class FavoriteCreate(BaseModel):
    cuerpo_agua_id: int


class FavoriteOut(BaseModel):
    id: int
    usuario_id: int
    cuerpo_agua_id: int
    creado_en: datetime

    class Config:
        from_attributes = True


class WaterBodyParameterCreate(BaseModel):
    cuerpo_agua_id: int
    parametro_id: int
    valor_objetivo: Optional[float] = None
    umbral_alerta: Optional[float] = None


class WaterBodyParameterOut(BaseModel):
    id: int
    cuerpo_agua_id: int
    parametro_id: int
    valor_objetivo: Optional[float]
    umbral_alerta: Optional[float]

    class Config:
        from_attributes = True


# Helpers


def _encode_bytes(raw: bytes) -> str:
    return base64.b64encode(raw).decode("utf-8")


def _decode_bytes(raw: str) -> bytes:
    return base64.b64decode(raw.encode("utf-8"))


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        algorithm, iterations, salt_b64, hash_b64 = hashed_password.split("$")
    except ValueError:
        return False

    if algorithm != "pbkdf2_sha256":
        return False

    salt = _decode_bytes(salt_b64)
    stored_hash = _decode_bytes(hash_b64)
    new_hash = hashlib.pbkdf2_hmac(
        "sha256", plain_password.encode("utf-8"), salt, int(iterations)
    )
    return hmac.compare_digest(stored_hash, new_hash)


def get_password_hash(password: str) -> str:
    salt = secrets.token_bytes(SALT_BYTES)
    derived = hashlib.pbkdf2_hmac(
        "sha256", password.encode("utf-8"), salt, PBKDF2_ITERATIONS
    )
    return f"pbkdf2_sha256${PBKDF2_ITERATIONS}${_encode_bytes(salt)}${_encode_bytes(derived)}"


def _b64url_encode(raw: bytes) -> str:
    return base64.urlsafe_b64encode(raw).rstrip(b"=").decode("utf-8")


def _b64url_decode(raw: str) -> bytes:
    padding = "=" * (-len(raw) % 4)
    return base64.urlsafe_b64decode(raw + padding)


def _encode_jwt(payload: dict) -> str:
    header = {"alg": ALGORITHM, "typ": "JWT"}
    header_segment = _b64url_encode(json.dumps(header, separators=(",", ":")).encode())
    payload_segment = _b64url_encode(
        json.dumps(payload, separators=(",", ":"), default=str).encode()
    )
    signing_input = f"{header_segment}.{payload_segment}".encode()
    signature = hmac.new(SECRET_KEY.encode(), signing_input, hashlib.sha256).digest()
    signature_segment = _b64url_encode(signature)
    return f"{header_segment}.{payload_segment}.{signature_segment}"


class TokenValidationError(Exception):
    pass


def decode_access_token(token: str) -> dict:
    try:
        header_segment, payload_segment, signature_segment = token.split(".")
    except ValueError:
        raise TokenValidationError("Formato de token inválido")

    signing_input = f"{header_segment}.{payload_segment}".encode()
    expected_signature = hmac.new(SECRET_KEY.encode(), signing_input, hashlib.sha256).digest()
    if not hmac.compare_digest(_b64url_encode(expected_signature), signature_segment):
        raise TokenValidationError("Firma inválida")

    payload_bytes = _b64url_decode(payload_segment)
    payload = json.loads(payload_bytes)

    exp = payload.get("exp")
    if exp is not None and datetime.utcnow().timestamp() > float(exp):
        raise TokenValidationError("Token expirado")

    return payload


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": int(expire.timestamp())})
    return _encode_jwt(to_encode)


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()


def log_access(db: Session, user: Optional[User], endpoint: str, method: str, status_code: int):
    registro = AccessLog(
        usuario_id=user.id if user else None,
        endpoint=endpoint,
        metodo=method,
        codigo_respuesta=status_code,
        ip="0.0.0.0",
    )
    db.add(registro)
    db.commit()


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudo validar el token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_access_token(token)
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except TokenValidationError:
        raise credentials_exception

    user = get_user_by_email(db, email=email)
    if user is None:
        raise credentials_exception
    return user


@app.on_event("startup")
async def startup_event():
    create_tables()
    init_sample_data()


@app.get("/")
async def root():
    return {"message": "Bienvenido a la API del Observatorio de Aguas"}


# Autenticación
@app.post("/auth/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register_user(payload: UserCreate, db: Session = Depends(get_db)):
    if get_user_by_email(db, payload.email):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="El correo ya está registrado")

    role = None
    if payload.role:
        role = db.query(Role).filter(Role.nombre == payload.role).first()
        if role is None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El rol especificado no existe")

    hashed_password = get_password_hash(payload.password)
    usuario = User(
        email=payload.email,
        full_name=payload.full_name,
        password_hash=hashed_password,
        role_id=role.id if role else None,
    )
    db.add(usuario)
    db.commit()
    db.refresh(usuario)
    return UserOut(
        id=usuario.id,
        email=usuario.email,
        full_name=usuario.full_name,
        role=role.nombre if role else None,
        created_at=usuario.created_at,
    )


@app.post("/auth/login", response_model=TokenResponse)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = get_user_by_email(db, form_data.username)
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales inválidas")

    access_token = create_access_token({"sub": user.email})
    user.last_login = datetime.utcnow()
    db.add(user)
    db.commit()
    return TokenResponse(access_token=access_token)


@app.get("/auth/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return UserOut(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        role=current_user.role.nombre if current_user.role else None,
        created_at=current_user.created_at,
    )


@app.get("/roles", response_model=List[RoleOut])
def list_roles(db: Session = Depends(get_db)):
    return db.query(Role).all()


# Cuerpos de agua
@app.get("/cuerpos-agua", response_model=List[CuerpoDeAgua])
async def obtener_cuerpos_agua(db: Session = Depends(get_db)):
    cuerpos = db.query(CuerpoDeAguaDB).all()
    return cuerpos


@app.get("/cuerpos-agua/{cuerpo_id}", response_model=CuerpoDeAgua)
async def obtener_cuerpo_agua(cuerpo_id: int, db: Session = Depends(get_db)):
    cuerpo = db.query(CuerpoDeAguaDB).filter(CuerpoDeAguaDB.id == cuerpo_id).first()
    if not cuerpo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cuerpo de agua no encontrado")
    return cuerpo


@app.post("/cuerpos-agua", response_model=CuerpoDeAgua, status_code=status.HTTP_201_CREATED)
async def crear_cuerpo_agua(cuerpo: CuerpoDeAguaCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    existente = db.query(CuerpoDeAguaDB).filter(CuerpoDeAguaDB.nombre.ilike(cuerpo.nombre)).first()
    if existente:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="El cuerpo de agua ya existe")

    db_cuerpo = CuerpoDeAguaDB(**cuerpo.dict())
    db.add(db_cuerpo)
    db.commit()
    db.refresh(db_cuerpo)
    return db_cuerpo


# Sensores
@app.get("/sensores", response_model=List[SensorOut])
def listar_sensores(db: Session = Depends(get_db)):
    return db.query(Sensor).all()


@app.post("/sensores", response_model=SensorOut, status_code=status.HTTP_201_CREATED)
def crear_sensor(payload: SensorCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    cuerpo = db.query(CuerpoDeAguaDB).filter(CuerpoDeAguaDB.id == payload.cuerpo_agua_id).first()
    if not cuerpo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cuerpo de agua no encontrado")
    sensor = Sensor(**payload.dict())
    db.add(sensor)
    db.commit()
    db.refresh(sensor)
    return sensor


@app.get("/sensores/{sensor_id}", response_model=SensorOut)
def obtener_sensor(sensor_id: int, db: Session = Depends(get_db)):
    sensor = db.query(Sensor).filter(Sensor.id == sensor_id).first()
    if not sensor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sensor no encontrado")
    return sensor


# Parámetros ambientales
@app.get("/parametros", response_model=List[ParameterOut])
def listar_parametros(db: Session = Depends(get_db)):
    return db.query(EnvironmentalParameter).all()


@app.post("/parametros", response_model=ParameterOut, status_code=status.HTTP_201_CREATED)
def crear_parametro(payload: ParameterCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    existente = db.query(EnvironmentalParameter).filter(EnvironmentalParameter.nombre == payload.nombre).first()
    if existente:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="El parámetro ya existe")
    parametro = EnvironmentalParameter(**payload.dict())
    db.add(parametro)
    db.commit()
    db.refresh(parametro)
    return parametro


# Lecturas de sensores
@app.get("/lecturas", response_model=List[ReadingOut])
def listar_lecturas(db: Session = Depends(get_db)):
    return db.query(SensorReading).all()


@app.post("/lecturas", response_model=ReadingOut, status_code=status.HTTP_201_CREATED)
def crear_lectura(payload: ReadingCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    sensor = db.query(Sensor).filter(Sensor.id == payload.sensor_id).first()
    parametro = db.query(EnvironmentalParameter).filter(EnvironmentalParameter.id == payload.parametro_id).first()
    cuerpo = db.query(CuerpoDeAguaDB).filter(CuerpoDeAguaDB.id == payload.cuerpo_agua_id).first()
    if not (sensor and parametro and cuerpo):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Sensor, parámetro o cuerpo de agua no válido")
    lectura = SensorReading(**payload.dict())
    db.add(lectura)
    db.commit()
    db.refresh(lectura)
    return lectura


# Alertas
@app.get("/alertas", response_model=List[AlertOut])
def listar_alertas(db: Session = Depends(get_db)):
    return db.query(Alert).all()


@app.post("/alertas", response_model=AlertOut, status_code=status.HTTP_201_CREATED)
def crear_alerta(payload: AlertCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    cuerpo = db.query(CuerpoDeAguaDB).filter(CuerpoDeAguaDB.id == payload.cuerpo_agua_id).first()
    if not cuerpo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cuerpo de agua no encontrado")
    alerta = Alert(**payload.dict())
    db.add(alerta)
    db.commit()
    db.refresh(alerta)
    return alerta


# Zonas protegidas
@app.get("/zonas-protegidas", response_model=List[ProtectedZoneOut])
def listar_zonas(db: Session = Depends(get_db)):
    return db.query(ProtectedZone).all()


@app.post("/zonas-protegidas", response_model=ProtectedZoneOut, status_code=status.HTTP_201_CREATED)
def crear_zona(payload: ProtectedZoneCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    cuerpo = db.query(CuerpoDeAguaDB).filter(CuerpoDeAguaDB.id == payload.cuerpo_agua_id).first()
    if not cuerpo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cuerpo de agua no encontrado")
    zona = ProtectedZone(**payload.dict())
    db.add(zona)
    db.commit()
    db.refresh(zona)
    return zona


# Reportes
@app.get("/reportes", response_model=List[ReportOut])
def listar_reportes(db: Session = Depends(get_db)):
    return db.query(Report).all()


@app.post("/reportes", response_model=ReportOut, status_code=status.HTTP_201_CREATED)
def crear_reporte(payload: ReportCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    cuerpo = db.query(CuerpoDeAguaDB).filter(CuerpoDeAguaDB.id == payload.cuerpo_agua_id).first()
    if not cuerpo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cuerpo de agua no encontrado")
    reporte = Report(**payload.dict(), usuario_id=current_user.id)
    db.add(reporte)
    db.commit()
    db.refresh(reporte)
    return reporte


# Favoritos
@app.get("/favoritos", response_model=List[FavoriteOut])
def listar_favoritos(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(UserFavorite).filter(UserFavorite.usuario_id == current_user.id).all()


@app.post("/favoritos", response_model=FavoriteOut, status_code=status.HTTP_201_CREATED)
def crear_favorito(payload: FavoriteCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cuerpo = db.query(CuerpoDeAguaDB).filter(CuerpoDeAguaDB.id == payload.cuerpo_agua_id).first()
    if not cuerpo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cuerpo de agua no encontrado")
    existente = (
        db.query(UserFavorite)
        .filter(UserFavorite.usuario_id == current_user.id, UserFavorite.cuerpo_agua_id == payload.cuerpo_agua_id)
        .first()
    )
    if existente:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="El favorito ya existe")
    favorito = UserFavorite(usuario_id=current_user.id, cuerpo_agua_id=payload.cuerpo_agua_id)
    db.add(favorito)
    db.commit()
    db.refresh(favorito)
    return favorito


# Configuración de parámetros por cuerpo de agua
@app.get("/cuerpo-parametros", response_model=List[WaterBodyParameterOut])
def listar_parametros_cuerpo(db: Session = Depends(get_db)):
    return db.query(WaterBodyParameter).all()


@app.post("/cuerpo-parametros", response_model=WaterBodyParameterOut, status_code=status.HTTP_201_CREATED)
def crear_parametro_cuerpo(payload: WaterBodyParameterCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    cuerpo = db.query(CuerpoDeAguaDB).filter(CuerpoDeAguaDB.id == payload.cuerpo_agua_id).first()
    parametro = db.query(EnvironmentalParameter).filter(EnvironmentalParameter.id == payload.parametro_id).first()
    if not (cuerpo and parametro):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cuerpo de agua o parámetro no válido")
    config = WaterBodyParameter(**payload.dict())
    db.add(config)
    db.commit()
    db.refresh(config)
    return config


# Estadísticas y salud
@app.get("/estadisticas")
async def obtener_estadisticas(db: Session = Depends(get_db)):
    total_cuerpos = db.query(CuerpoDeAguaDB).count()
    total_sensores = db.query(Sensor).count()
    total_alertas = db.query(Alert).count()
    total_parametros = db.query(EnvironmentalParameter).count()
    return {
        "total_cuerpos_agua": total_cuerpos,
        "total_sensores": total_sensores,
        "total_alertas": total_alertas,
        "total_parametros": total_parametros,
        "ultima_actualizacion": datetime.utcnow().isoformat(),
    }


@app.get("/health")
async def health_check(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}
    except SQLAlchemyError:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Base de datos inaccesible")
