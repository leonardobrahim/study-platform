import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(
        os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440")
    )
    CORS_ORIGINS: list[str] = [
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5173,https://study-platform-wheat.vercel.app",
        ).split(",")
        if origin.strip()
    ]

    def validate(self) -> None:
        if not self.DATABASE_URL:
            raise ValueError("Variável de ambiente DATABASE_URL não definida.")
        if not self.SECRET_KEY or self.SECRET_KEY == "chave_fallback":
            raise ValueError(
                "Variável de ambiente SECRET_KEY não definida ou insegura."
            )


settings = Settings()
settings.validate()