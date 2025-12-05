from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, validator
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import func, text
import uvicorn
import logging
from datetime import datetime

from database import get_db, create_tables, init_sample_data, CuerpoDeAguaDB

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Observatorio de Aguas API", version="1.0.0")

# Configurar CORS para permitir conexiones desde el frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # URL del frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modelos Pydantic para la API
class CuerpoDeAgua(BaseModel):
    id: int
    nombre: str = Field(..., min_length=1, max_length=255, description="Nombre del cuerpo de agua")
    tipo: str = Field(..., description="Tipo de cuerpo de agua (río, lago, océano, etc.)")
    latitud: float = Field(..., ge=-90, le=90, description="Latitud en grados decimales")
    longitud: float = Field(..., ge=-180, le=180, description="Longitud en grados decimales")
    contaminacion: str = Field(..., description="Nivel de contaminación")
    biodiversidad: str = Field(..., description="Nivel de biodiversidad")
    descripcion: Optional[str] = Field(None, max_length=1000, description="Descripción del cuerpo de agua")
    temperatura: Optional[float] = Field(None, ge=-10, le=50, description="Temperatura en grados Celsius")
    ph: Optional[float] = Field(None, ge=0, le=14, description="Nivel de pH")
    oxigeno_disuelto: Optional[float] = Field(None, ge=0, le=20, description="Oxígeno disuelto en mg/L")

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "nombre": "Río Amazonas",
                "tipo": "río",
                "latitud": -3.4653,
                "longitud": -58.38,
                "contaminacion": "Baja",
                "biodiversidad": "Alta",
                "descripcion": "El río más caudaloso del mundo",
                "temperatura": 26.5,
                "ph": 6.8,
                "oxigeno_disuelto": 7.2
            }
        }

class CuerpoDeAguaCreate(BaseModel):
    nombre: str = Field(..., min_length=1, max_length=255, description="Nombre del cuerpo de agua")
    tipo: str = Field(..., description="Tipo de cuerpo de agua")
    latitud: float = Field(..., ge=-90, le=90, description="Latitud en grados decimales")
    longitud: float = Field(..., ge=-180, le=180, description="Longitud en grados decimales")
    contaminacion: str = Field(..., description="Nivel de contaminación")
    biodiversidad: str = Field(..., description="Nivel de biodiversidad")
    descripcion: Optional[str] = Field(None, max_length=1000, description="Descripción del cuerpo de agua")
    temperatura: Optional[float] = Field(None, ge=-10, le=50, description="Temperatura en grados Celsius")
    ph: Optional[float] = Field(None, ge=0, le=14, description="Nivel de pH")
    oxigeno_disuelto: Optional[float] = Field(None, ge=0, le=20, description="Oxígeno disuelto en mg/L")

    @validator('tipo')
    def validate_tipo(cls, v):
        tipos_validos = ['río', 'lago', 'océano', 'mar', 'laguna', 'embalse', 'arroyo']
        if v.lower() not in [t.lower() for t in tipos_validos]:
            raise ValueError(f'Tipo debe ser uno de: {", ".join(tipos_validos)}')
        return v

    @validator('contaminacion')
    def validate_contaminacion(cls, v):
        niveles_validos = ['Baja', 'Media', 'Alta', 'Crítica']
        if v not in niveles_validos:
            raise ValueError(f'Contaminación debe ser uno de: {", ".join(niveles_validos)}')
        return v

    @validator('biodiversidad')
    def validate_biodiversidad(cls, v):
        niveles_validos = ['Baja', 'Media', 'Alta']
        if v not in niveles_validos:
            raise ValueError(f'Biodiversidad debe ser uno de: {", ".join(niveles_validos)}')
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "nombre": "Lago Nuevo",
                "tipo": "lago",
                "latitud": -12.0464,
                "longitud": -77.0428,
                "contaminacion": "Media",
                "biodiversidad": "Alta",
                "descripcion": "Un hermoso lago en los Andes",
                "temperatura": 15.0,
                "ph": 7.2,
                "oxigeno_disuelto": 8.5
            }
        }

# Evento de inicio para crear tablas e inicializar datos
@app.on_event("startup")
async def startup_event():
    create_tables()
    init_sample_data()

# Rutas de la API
@app.get("/")
async def root():
    return {"message": "Bienvenido a la API del Observatorio de Aguas"}

@app.get("/cuerpos-agua", 
         response_model=List[CuerpoDeAgua],
         summary="Obtener todos los cuerpos de agua",
         description="Retorna una lista completa de todos los cuerpos de agua registrados en el sistema")
async def obtener_cuerpos_agua(db: Session = Depends(get_db)):
    try:
        cuerpos = db.query(CuerpoDeAguaDB).all()
        logger.info(f"Se obtuvieron {len(cuerpos)} cuerpos de agua")
        return cuerpos
    except SQLAlchemyError as e:
        logger.error(f"Error de base de datos: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor al obtener los datos"
        )

@app.get("/cuerpos-agua/{cuerpo_id}", 
         response_model=CuerpoDeAgua,
         summary="Obtener cuerpo de agua por ID",
         description="Retorna la información detallada de un cuerpo de agua específico")
async def obtener_cuerpo_agua(cuerpo_id: int, db: Session = Depends(get_db)):
    try:
        if cuerpo_id <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El ID debe ser un número positivo"
            )
        
        cuerpo = db.query(CuerpoDeAguaDB).filter(CuerpoDeAguaDB.id == cuerpo_id).first()
        if not cuerpo:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No se encontró el cuerpo de agua con ID {cuerpo_id}"
            )
        
        logger.info(f"Cuerpo de agua obtenido: {cuerpo.nombre}")
        return cuerpo
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        logger.error(f"Error de base de datos: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )

@app.get("/cuerpos-agua/tipo/{tipo}",
         response_model=List[CuerpoDeAgua],
         summary="Filtrar por tipo",
         description="Obtiene cuerpos de agua filtrados por tipo (río, lago, océano, etc.)")
async def obtener_cuerpos_por_tipo(tipo: str, db: Session = Depends(get_db)):
    try:
        if not tipo.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El tipo no puede estar vacío"
            )
        
        cuerpos_filtrados = db.query(CuerpoDeAguaDB).filter(
            CuerpoDeAguaDB.tipo.ilike(f"%{tipo.strip()}%")
        ).all()
        
        logger.info(f"Se encontraron {len(cuerpos_filtrados)} cuerpos de agua del tipo '{tipo}'")
        return cuerpos_filtrados
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        logger.error(f"Error de base de datos: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )

@app.get("/cuerpos-agua/buscar/{termino}",
         response_model=List[CuerpoDeAgua],
         summary="Buscar por nombre",
         description="Busca cuerpos de agua que contengan el término especificado en su nombre")
async def buscar_cuerpos_agua(termino: str, db: Session = Depends(get_db)):
    try:
        if not termino.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El término de búsqueda no puede estar vacío"
            )
        
        if len(termino.strip()) < 2:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El término de búsqueda debe tener al menos 2 caracteres"
            )
        
        cuerpos_encontrados = db.query(CuerpoDeAguaDB).filter(
            CuerpoDeAguaDB.nombre.ilike(f"%{termino.strip()}%")
        ).all()
        
        logger.info(f"Búsqueda '{termino}': {len(cuerpos_encontrados)} resultados")
        return cuerpos_encontrados
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        logger.error(f"Error de base de datos: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )

@app.post("/cuerpos-agua", 
          response_model=CuerpoDeAgua,
          status_code=status.HTTP_201_CREATED,
          summary="Crear nuevo cuerpo de agua",
          description="Crea un nuevo registro de cuerpo de agua en el sistema")
async def crear_cuerpo_agua(cuerpo: CuerpoDeAguaCreate, db: Session = Depends(get_db)):
    try:
        # Verificar si ya existe un cuerpo de agua con el mismo nombre
        cuerpo_existente = db.query(CuerpoDeAguaDB).filter(
            CuerpoDeAguaDB.nombre.ilike(cuerpo.nombre)
        ).first()
        
        if cuerpo_existente:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Ya existe un cuerpo de agua con el nombre '{cuerpo.nombre}'"
            )
        
        db_cuerpo = CuerpoDeAguaDB(**cuerpo.dict())
        db.add(db_cuerpo)
        db.commit()
        db.refresh(db_cuerpo)
        
        logger.info(f"Nuevo cuerpo de agua creado: {db_cuerpo.nombre} (ID: {db_cuerpo.id})")
        return db_cuerpo
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Error al crear cuerpo de agua: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor al crear el registro"
        )

@app.get("/estadisticas",
         summary="Estadísticas del sistema",
         description="Retorna estadísticas generales sobre los cuerpos de agua registrados")
async def obtener_estadisticas(db: Session = Depends(get_db)):
    """Obtener estadísticas generales del sistema"""
    try:
        total_cuerpos = db.query(CuerpoDeAguaDB).count()
        
        # Estadísticas por tipo
        tipos_stats = db.query(
            CuerpoDeAguaDB.tipo,
            func.count(CuerpoDeAguaDB.id).label('cantidad')
        ).group_by(CuerpoDeAguaDB.tipo).all()
        
        # Estadísticas de contaminación
        contaminacion_stats = db.query(
            CuerpoDeAguaDB.contaminacion,
            func.count(CuerpoDeAguaDB.id).label('cantidad')
        ).group_by(CuerpoDeAguaDB.contaminacion).all()
        
        # Promedios de parámetros
        promedios = db.query(
            func.avg(CuerpoDeAguaDB.temperatura).label('temp_promedio'),
            func.avg(CuerpoDeAguaDB.ph).label('ph_promedio'),
            func.avg(CuerpoDeAguaDB.oxigeno_disuelto).label('oxigeno_promedio')
        ).first()
        
        estadisticas = {
            "total_cuerpos_agua": total_cuerpos,
            "distribucion_por_tipo": {tipo: cantidad for tipo, cantidad in tipos_stats},
            "distribucion_contaminacion": {nivel: cantidad for nivel, cantidad in contaminacion_stats},
            "promedios": {
                "temperatura": round(float(promedios.temp_promedio or 0), 2),
                "ph": round(float(promedios.ph_promedio or 0), 2),
                "oxigeno_disuelto": round(float(promedios.oxigeno_promedio or 0), 2)
            },
            "ultima_actualizacion": datetime.now().isoformat()
        }
        
        logger.info("Estadísticas generadas exitosamente")
        return estadisticas
    except SQLAlchemyError as e:
        logger.error(f"Error al generar estadísticas: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor al generar estadísticas"
        )

@app.get("/health",
         summary="Estado de salud del sistema",
         description="Verifica el estado de salud de la API y la base de datos")
async def health_check(db: Session = Depends(get_db)):
    """Endpoint de verificación de salud del sistema"""
    try:
        # Verificar conexión a la base de datos
        db.execute(text("SELECT 1"))
        
        return {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "version": "1.0.0",
            "database": "connected",
            "message": "Sistema operativo correctamente"
        }
    except Exception as e:
        logger.error(f"Health check falló: {str(e)}")
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "status": "unhealthy",
                "timestamp": datetime.now().isoformat(),
                "database": "disconnected",
                "error": "Error de conexión a la base de datos"
            }
        )

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)