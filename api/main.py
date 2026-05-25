from fastapi import FastAPI

from api.routes.catch_stragglers import router as catch_stragglers_router

app = FastAPI()
app.include_router(catch_stragglers_router)

