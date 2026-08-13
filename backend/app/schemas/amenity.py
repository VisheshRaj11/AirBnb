from pydantic import BaseModel

class AmenityBase(BaseModel):
    name: str
    icon_key: str

class AmenityResponse(AmenityBase):
    id: int

    class Config:
        from_attributes = True
