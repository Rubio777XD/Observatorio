from datetime import datetime
from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship

from database import Base


class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(50), unique=True, nullable=False)
    descripcion = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    usuarios = relationship("User", back_populates="role")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=True)

    role = relationship("Role", back_populates="usuarios")
    favoritos = relationship("UserFavorite", back_populates="usuario", cascade="all, delete-orphan")
    reportes = relationship("Report", back_populates="usuario")
    logs_acceso = relationship("AccessLog", back_populates="usuario")
    cuerpos_creados = relationship("CuerpoDeAguaDB", back_populates="creador")


class CuerpoDeAguaDB(Base):
    __tablename__ = "cuerpos_agua"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(255), nullable=False, index=True)
    tipo = Column(String(50), nullable=False, index=True)
    latitud = Column(Float, nullable=False)
    longitud = Column(Float, nullable=False)
    contaminacion = Column(String(50), nullable=False)
    biodiversidad = Column(String(50), nullable=False)
    descripcion = Column(Text, nullable=True)
    temperatura = Column(Float, nullable=True)
    ph = Column(Float, nullable=True)
    oxigeno_disuelto = Column(Float, nullable=True)
    fecha_creacion = Column(DateTime, default=datetime.utcnow)
    fecha_actualizacion = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    creado_por_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    sensores = relationship("Sensor", back_populates="cuerpo_agua")
    lecturas = relationship("SensorReading", back_populates="cuerpo_agua")
    alertas = relationship("Alert", back_populates="cuerpo_agua")
    reportes = relationship("Report", back_populates="cuerpo_agua")
    favoritos = relationship("UserFavorite", back_populates="cuerpo_agua")
    zonas = relationship("ProtectedZone", back_populates="cuerpo_agua")
    parametros_configurados = relationship("WaterBodyParameter", back_populates="cuerpo_agua")
    creador = relationship("User", back_populates="cuerpos_creados")


class Sensor(Base):
    __tablename__ = "sensores"

    id = Column(Integer, primary_key=True)
    nombre = Column(String(255), nullable=False)
    tipo = Column(String(100), nullable=False)
    cuerpo_agua_id = Column(Integer, ForeignKey("cuerpos_agua.id"), nullable=False)
    latitud = Column(Float, nullable=True)
    longitud = Column(Float, nullable=True)
    descripcion = Column(Text, nullable=True)
    instalado_en = Column(Date, nullable=True)
    activo = Column(Boolean, default=True)

    cuerpo_agua = relationship("CuerpoDeAguaDB", back_populates="sensores")
    lecturas = relationship("SensorReading", back_populates="sensor")


class EnvironmentalParameter(Base):
    __tablename__ = "parametros_ambientales"

    id = Column(Integer, primary_key=True)
    nombre = Column(String(100), nullable=False, unique=True)
    unidad = Column(String(50), nullable=False)
    valor_minimo = Column(Float, nullable=True)
    valor_maximo = Column(Float, nullable=True)
    descripcion = Column(Text, nullable=True)

    lecturas = relationship("SensorReading", back_populates="parametro")
    alertas = relationship("Alert", back_populates="parametro")
    configuraciones = relationship("WaterBodyParameter", back_populates="parametro")


class SensorReading(Base):
    __tablename__ = "lecturas_sensores"

    id = Column(Integer, primary_key=True)
    sensor_id = Column(Integer, ForeignKey("sensores.id"), nullable=False)
    parametro_id = Column(Integer, ForeignKey("parametros_ambientales.id"), nullable=False)
    cuerpo_agua_id = Column(Integer, ForeignKey("cuerpos_agua.id"), nullable=False)
    valor = Column(Float, nullable=False)
    unidad = Column(String(50), nullable=False)
    tomado_en = Column(DateTime, default=datetime.utcnow)
    observaciones = Column(Text, nullable=True)

    sensor = relationship("Sensor", back_populates="lecturas")
    parametro = relationship("EnvironmentalParameter", back_populates="lecturas")
    cuerpo_agua = relationship("CuerpoDeAguaDB", back_populates="lecturas")
    alertas = relationship("Alert", back_populates="lectura")


class ProtectedZone(Base):
    __tablename__ = "zonas_protegidas"

    id = Column(Integer, primary_key=True)
    cuerpo_agua_id = Column(Integer, ForeignKey("cuerpos_agua.id"), nullable=False)
    nombre = Column(String(255), nullable=False)
    categoria = Column(String(100), nullable=True)
    descripcion = Column(Text, nullable=True)
    area_km2 = Column(Float, nullable=True)
    estado = Column(String(50), default="activa")

    cuerpo_agua = relationship("CuerpoDeAguaDB", back_populates="zonas")


class Alert(Base):
    __tablename__ = "alertas"

    id = Column(Integer, primary_key=True)
    cuerpo_agua_id = Column(Integer, ForeignKey("cuerpos_agua.id"), nullable=False)
    lectura_id = Column(Integer, ForeignKey("lecturas_sensores.id"), nullable=True)
    parametro_id = Column(Integer, ForeignKey("parametros_ambientales.id"), nullable=True)
    nivel = Column(String(50), nullable=False)
    mensaje = Column(Text, nullable=False)
    creada_en = Column(DateTime, default=datetime.utcnow)
    resuelta = Column(Boolean, default=False)

    cuerpo_agua = relationship("CuerpoDeAguaDB", back_populates="alertas")
    lectura = relationship("SensorReading", back_populates="alertas")
    parametro = relationship("EnvironmentalParameter", back_populates="alertas")


class Report(Base):
    __tablename__ = "reportes"

    id = Column(Integer, primary_key=True)
    cuerpo_agua_id = Column(Integer, ForeignKey("cuerpos_agua.id"), nullable=False)
    usuario_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    titulo = Column(String(255), nullable=False)
    contenido = Column(Text, nullable=False)
    formato = Column(String(50), default="texto")
    generado_en = Column(DateTime, default=datetime.utcnow)

    cuerpo_agua = relationship("CuerpoDeAguaDB", back_populates="reportes")
    usuario = relationship("User", back_populates="reportes")


class UserFavorite(Base):
    __tablename__ = "user_favorites"

    id = Column(Integer, primary_key=True)
    usuario_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    cuerpo_agua_id = Column(Integer, ForeignKey("cuerpos_agua.id"), nullable=False)
    creado_en = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (UniqueConstraint("usuario_id", "cuerpo_agua_id", name="uq_usuario_cuerpo"),)

    usuario = relationship("User", back_populates="favoritos")
    cuerpo_agua = relationship("CuerpoDeAguaDB", back_populates="favoritos")


class AccessLog(Base):
    __tablename__ = "logs_acceso"

    id = Column(Integer, primary_key=True)
    usuario_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    endpoint = Column(String(255), nullable=False)
    metodo = Column(String(10), nullable=False)
    codigo_respuesta = Column(Integer, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    ip = Column(String(50), nullable=True)

    usuario = relationship("User", back_populates="logs_acceso")


class WaterBodyParameter(Base):
    __tablename__ = "cuerpo_parametros"

    id = Column(Integer, primary_key=True)
    cuerpo_agua_id = Column(Integer, ForeignKey("cuerpos_agua.id"), nullable=False)
    parametro_id = Column(Integer, ForeignKey("parametros_ambientales.id"), nullable=False)
    valor_objetivo = Column(Float, nullable=True)
    umbral_alerta = Column(Float, nullable=True)

    cuerpo_agua = relationship("CuerpoDeAguaDB", back_populates="parametros_configurados")
    parametro = relationship("EnvironmentalParameter", back_populates="configuraciones")
