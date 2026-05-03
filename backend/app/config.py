from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    openai_api_key: str = ""
    ark_api_key: str = ""
    tripo_api_key: str = ""
    upload_post_api_key: str = ""
    database_url: str = "sqlite+aiosqlite:///./tinfoil.db"
    instagram_user: str = ""
    tiktok_user: str = ""
    storage_path: str = "./storage"
    cors_origins: str = "http://localhost:5173,http://localhost:3000"
    cloudinary_cloud_name: str = ""
    cloudinary_api_key: str = ""
    cloudinary_api_secret: str = ""

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",")]


VERA_DEFAULTS = {
    "visual_prompt": (
        "Vera, a hyper-realistic AI talent, dark studio lighting, "
        "fashion editorial style, sharp features, dark hair, contemporary wardrobe — "
    ),
    "motion_prompt": (
        "smooth cinematic motion, slow push-in, social-native pacing, "
        "vertical 9:16, high contrast, platform-optimised — "
    ),
    "caption_template": "✨ {topic} ✨\n\n{hashtags}",
    "hashtag_set": {
        "instagram": "#aiavatar #veraai #contentcreator #aiart #digitalcreator",
        "tiktok": "#aiavatar #veraai #fyp #aiart #contentcreator",
        "youtube": "#aiavatar #veraai #aiart #contentcreator",
    },
}


@lru_cache
def get_settings() -> Settings:
    return Settings()
