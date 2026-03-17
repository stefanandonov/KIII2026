import os
from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import func

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

from database import get_db
from models import Product

router = APIRouter(prefix="/visualizations", tags=["visualizations"])

CHARTS_DIR = "charts"


@router.post("/products-per-category", status_code=201)
def products_per_category(db: Session = Depends(get_db)):
    rows = (
        db.query(Product.category, func.count(Product.id).label("count"))
        .group_by(Product.category)
        .order_by(func.count(Product.id).desc())
        .all()
    )

    categories = [r.category or "Uncategorized" for r in rows]
    counts = [r.count for r in rows]

    fig, ax = plt.subplots(figsize=(10, 6))
    ax.bar(categories, counts)
    ax.set_xlabel("Category")
    ax.set_ylabel("Number of Products")
    ax.set_title("Number of Products per Category")
    plt.xticks(rotation=45, ha="right")
    plt.tight_layout()

    os.makedirs(CHARTS_DIR, exist_ok=True)
    filepath = os.path.join(CHARTS_DIR, "products_per_category.png")
    fig.savefig(filepath)
    plt.close(fig)

    return JSONResponse({"message": "Chart saved", "path": filepath})