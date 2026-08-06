from datetime import datetime
from pydantic import BaseModel

class ProgressCreate(BaseModel):
    weight: float
    note: str | None = None

class ProgressEntry(BaseModel):
    id: str
    weight: float
    note: str | None
    logged_at: datetime

    class Config:
        from_attributes = True