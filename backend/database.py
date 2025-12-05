from sqlalchemy import create_engine, Column, Integer, String, Float, Text, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

# Configuración de la base de datos
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./observatorio_aguas.db")

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Modelo de la tabla CuerpoDeAgua
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

# Función para obtener la sesión de la base de datos
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Crear las tablas
def create_tables():
    Base.metadata.create_all(bind=engine)

# Función para inicializar datos de ejemplo
def init_sample_data():
    db = SessionLocal()
    try:
        # Verificar si ya existen datos
        if db.query(CuerpoDeAguaDB).count() > 0:
            return
        
        # Datos de ejemplo
        sample_data = [
            CuerpoDeAguaDB(
                nombre="Río Amazonas",
                tipo="río",
                latitud=-3.4653,
                longitud=-58.38,
                contaminacion="Baja",
                biodiversidad="Alta",
                descripcion="El río más caudaloso del mundo",
                temperatura=26.5,
                ph=6.8,
                oxigeno_disuelto=7.2
            ),
            CuerpoDeAguaDB(
                nombre="Lago Titicaca",
                tipo="lago",
                latitud=-15.9254,
                longitud=-69.3354,
                contaminacion="Media",
                biodiversidad="Media",
                descripcion="Lago navegable más alto del mundo",
                temperatura=12.0,
                ph=8.1,
                oxigeno_disuelto=6.5
            ),
            CuerpoDeAguaDB(
                nombre="Océano Pacífico",
                tipo="océano",
                latitud=0.7893,
                longitud=-109.9796,
                contaminacion="Media",
                biodiversidad="Alta",
                descripcion="El océano más grande del mundo",
                temperatura=15.8,
                ph=8.0,
                oxigeno_disuelto=8.1
            )
        ]
        
        for cuerpo in sample_data:
            db.add(cuerpo)
        
        db.commit()
        print("Datos de ejemplo inicializados correctamente")
        
    except Exception as e:
        print(f"Error al inicializar datos de ejemplo: {e}")
        db.rollback()
    finally:
        db.close()