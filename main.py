from fastapi import FastAPI
from database import Base, engine
from routers import products

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Product Catalog API", version="1.0.0")

app.include_router(products.router)



# This is also a healthcheck besides default endpoints
@app.get("/", tags=["health"])
def health_check():
    return {"status": "ok"}
