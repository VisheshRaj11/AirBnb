import os
import uuid
import boto3
from botocore.config import Config
from app.core.config import settings

def get_s3_client():
    if not settings.AWS_ACCESS_KEY_ID or not settings.AWS_SECRET_ACCESS_KEY:
        return None
    return boto3.client(
        "s3",
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_REGION,
        config=Config(signature_version="s3v4")
    )

def generate_presigned_url(file_name: str, file_type: str):
    ext = os.path.splitext(file_name)[1]
    unique_filename = f"{uuid.uuid4()}{ext}"
    
    if settings.STORAGE_DRIVER == "s3":
        s3 = get_s3_client()
        if s3:
            try:
                presigned_url = s3.generate_presigned_url(
                    'put_object',
                    Params={
                        'Bucket': settings.S3_BUCKET_NAME,
                        'Key': unique_filename,
                        'ContentType': file_type
                    },
                    ExpiresIn=3600
                )
                file_url = f"https://{settings.S3_BUCKET_NAME}.s3.{settings.AWS_REGION}.amazonaws.com/{unique_filename}"
                return {
                    "is_s3": True,
                    "upload_url": presigned_url,
                    "file_url": file_url,
                    "key": unique_filename
                }
            except Exception as e:
                print(f"Error generating S3 presigned URL: {e}")
                
    # Local fallback URL
    return {
        "is_s3": False,
        "upload_url": "/api/v1/uploads/local",
        "file_url": f"/uploads/{unique_filename}",
        "key": unique_filename
    }
