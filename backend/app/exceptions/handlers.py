from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse

class APIException(Exception):
    def __init__(self, message: str, status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR, code: str = "INTERNAL_ERROR"):
        self.message = message
        self.status_code = status_code
        self.code = code
        super().__init__(message)

class NotFoundException(APIException):
    def __init__(self, message: str = "Resource not found", code: str = "NOT_FOUND"):
        super().__init__(message, status.HTTP_404_NOT_FOUND, code)

class BadRequestException(APIException):
    def __init__(self, message: str = "Bad request", code: str = "BAD_REQUEST"):
        super().__init__(message, status.HTTP_400_BAD_REQUEST, code)

class UnauthorizedException(APIException):
    def __init__(self, message: str = "Unauthorized access", code: str = "UNAUTHORIZED"):
        super().__init__(message, status.HTTP_401_UNAUTHORIZED, code)

class ForbiddenException(APIException):
    def __init__(self, message: str = "Access forbidden", code: str = "FORBIDDEN"):
        super().__init__(message, status.HTTP_403_FORBIDDEN, code)

def register_exception_handlers(app: FastAPI):
    @app.exception_handler(APIException)
    async def api_exception_handler(request: Request, exc: APIException):
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "success": False,
                "error": {
                    "message": exc.message,
                    "code": exc.code
                }
            }
        )

    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        # In production, log this exception details properly
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "success": False,
                "error": {
                    "message": "An unexpected error occurred. Please try again later.",
                    "code": "INTERNAL_SERVER_ERROR",
                    "details": str(exc) if os.getenv("DEBUG") else None
                }
            }
        )
import os
