import io
from fastapi import UploadFile, HTTPException
from PIL import Image

def validate_and_process_image(file: UploadFile, image_bytes: bytes, max_size_bytes: int = 10 * 1024 * 1024) -> str:
    """
    Validates uploaded image byte stream, checks size limits,
    verifies file integrity using Pillow, and resolves exact image MIME type.

    Returns:
        str: Validated MIME type (e.g. 'image/jpeg', 'image/png', 'image/webp')
    """
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image.")

    byte_length = len(image_bytes)
    if byte_length == 0:
        raise HTTPException(status_code=400, detail="Empty file uploaded.")

    if byte_length > max_size_bytes:
        raise HTTPException(
            status_code=413,
            detail=f"Image size ({byte_length / (1024 * 1024):.1f}MB) exceeds maximum limit of {max_size_bytes / (1024 * 1024):.0f}MB."
        )

    try:
        image = Image.open(io.BytesIO(image_bytes))
        image.verify()
        
        # Resolve mime type based on image format
        format_mime_map = {
            "JPEG": "image/jpeg",
            "PNG": "image/png",
            "WEBP": "image/webp",
            "GIF": "image/gif",
        }
        detected_mime = format_mime_map.get(image.format, file.content_type)
        return detected_mime
    except Exception:
        raise HTTPException(status_code=400, detail="Corrupted or invalid image format.")
