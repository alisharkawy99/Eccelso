from pydantic_settings import BaseSettings, SettingsConfigDict
import cloudinary


class Settings(BaseSettings):
    database_url: str
    host: str = "0.0.0.0"
    port: int = 8000
    frontend_url: str = "http://localhost:3000"
    # Cloudinary settings
    cloudinary_cloud_name: str
    cloudinary_api_key: str
    cloudinary_api_secret: str

    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()


# Configure cloudinary once at startup
cloudinary.config(
    cloud_name=settings.cloudinary_cloud_name,
    api_key=settings.cloudinary_api_key,
    api_secret=settings.cloudinary_api_secret,
)
