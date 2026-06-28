from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from starlette.status import (
    HTTP_400_BAD_REQUEST,
    HTTP_401_UNAUTHORIZED,
    HTTP_403_FORBIDDEN,
    HTTP_404_NOT_FOUND,
    HTTP_409_CONFLICT,
)

class CodePilotException(Exception):
    def __init__(self, detail: str = "An error occurred", status_code: int = 500):
        self.detail = detail
        self.status_code = status_code
        super().__init__(detail)

class NotFoundError(CodePilotException):
    def __init__(self, detail: str = "Resource not found"):
        super().__init__(detail, HTTP_404_NOT_FOUND)

class UnauthorizedError(CodePilotException):
    def __init__(self, detail: str = "Unauthorized access"):
        super().__init__(detail, HTTP_401_UNAUTHORIZED)

class ForbiddenError(CodePilotException):
    def __init__(self, detail: str = "Access forbidden"):
        super().__init__(detail, HTTP_403_FORBIDDEN)

class BadRequestError(CodePilotException):
    def __init__(self, detail: str = "Bad request"):
        super().__init__(detail, HTTP_400_BAD_REQUEST)

class ConflictError(CodePilotException):
    def __init__(self, detail: str = "Conflict occurred"):
        super().__init__(detail, HTTP_409_CONFLICT)

def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(CodePilotException)
    async def codepilot_exception_handler(request: Request, exc: CodePilotException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail}
        )
