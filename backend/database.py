from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv
from pathlib import Path
import os
from sqlalchemy import inspect, text

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent
raw_db_url = os.getenv("DATABASE_URL")

if raw_db_url:
    if raw_db_url.startswith("sqlite:///"):
        db_path = Path(raw_db_url.replace("sqlite:///", ""))
        if not db_path.is_absolute():
            db_path = BASE_DIR / db_path
        DATABASE_URL = f"sqlite:///{db_path}"
    else:
        DATABASE_URL = raw_db_url
else:
    DATABASE_URL = f"sqlite:///{BASE_DIR / 'observatorio_aguas.db'}"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {},
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    import models  # noqa: F401

    Base.metadata.create_all(bind=engine)
    _ensure_cuerpo_agua_creator_column()


def _ensure_cuerpo_agua_creator_column():
    inspector = inspect(engine)
    columnas = [col["name"] for col in inspector.get_columns("cuerpos_agua")]
    if "creado_por_id" not in columnas:
        with engine.begin() as connection:
            connection.execute(text("ALTER TABLE cuerpos_agua ADD COLUMN creado_por_id INTEGER"))


def init_sample_data():
    from models import CuerpoDeAguaDB, Role

    db = SessionLocal()
    try:
        if db.query(CuerpoDeAguaDB).count() == 0:
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
                    oxigeno_disuelto=7.2,
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
                    oxigeno_disuelto=6.5,
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
                    oxigeno_disuelto=8.1,
                ),
            ]
            db.add_all(sample_data)

        if db.query(Role).count() == 0:
            roles = [
                Role(nombre="admin", descripcion="Acceso completo a la plataforma"),
                Role(nombre="analista", descripcion="Puede cargar datos y generar reportes"),
                Role(nombre="visualizador", descripcion="Acceso de solo lectura"),
            ]
            db.add_all(roles)

        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()
