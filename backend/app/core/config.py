from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings"""
    
    # Application
    APP_NAME: str = "GeoVisor"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    # Database
    DATABASE_URL: str
    
    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # CORS
    ALLOWED_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]
    
    # File Upload
    MAX_UPLOAD_SIZE: int = 524288000  # 500MB
    UPLOAD_DIR: str = "../data/uploads"
    PROCESSED_DIR: str = "../data/processed"
    TEMP_DIR: str = "../data/temp"
    
    # GDAL
    GDAL_DATA: str = "/usr/share/gdal"
    PROJ_LIB: str = "/usr/share/proj"
    
    # Email (Optional)
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    EMAILS_FROM_EMAIL: str = ""
    EMAILS_FROM_NAME: str = ""
    
    # Cesium Ion
    CESIUM_ION_TOKEN: str = ""
    
    # Admin
    FIRST_SUPERUSER_EMAIL: str = "admin@geovisor.com"
    FIRST_SUPERUSER_PASSWORD: str = "admin123"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
