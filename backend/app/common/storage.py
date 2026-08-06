import uuid
from pathlib import Path
from app.common.exceptions import (
    InvalidFileTypeError,
    FileTooLargeError,
)

from fastapi import UploadFile

class StorageService:

    BASE_PATH = Path("storage")

    ALLOWED_IMAGES_TYPES = {
        "image/jpeg",
        "image/png",
        "image/webp",
    }

    MAX_IMAGE_SIZE = 2 * 1024 * 1024

    async def save_image(
        self,
        file: UploadFile,
        folder: str
    ) -> str:

        print("filename:", file.filename)
        print("content_type:", file.content_type)
        
        if file.content_type not in self.ALLOWED_IMAGES_TYPES:
            raise InvalidFileTypeError()

        content = await file.read()

        if len(content) > self.MAX_IMAGE_SIZE:
            raise FileTooLargeError()

        extension = Path(file.filename or "").suffix.lower()

        filename = f"{uuid.uuid4().hex}{extension}"

        directory = self.BASE_PATH / folder
        directory.mkdir(
            parents=True,
            exist_ok=True
        )

        file_path = directory / filename

        file_path.write_bytes(content)

        return str(file_path)

    def delete_file(
        self,
        file_path: str | None,
    ) -> None:

        if not file_path:
            return

        path = Path(file_path)

        if path.exists() and path.is_file():
            path.unlink()