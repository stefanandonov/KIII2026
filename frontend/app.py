import streamlit as st
import requests
from PIL import Image
import io

API_URL = "http://backend:8000"

st.set_page_config(page_title="Product Catalog", layout="wide")
st.title("Product Catalog")

# ── helpers ──────────────────────────────────────────────────────────────────

def fetch_products():
    r = requests.get(f"{API_URL}/products/")
    r.raise_for_status()
    return r.json()


def get_product(product_id: int):
    r = requests.get(f"{API_URL}/products/{product_id}")
    r.raise_for_status()
    return r.json()


# ── sidebar nav ──────────────────────────────────────────────────────────────

page = st.sidebar.radio(
    "Navigation",
    ["Browse Products", "Add Product", "Edit / Delete Product", "Visualizations"],
)

# ── Browse ────────────────────────────────────────────────────────────────────

if page == "Browse Products":
    st.header("All Products")
    try:
        products = fetch_products()
    except Exception as e:
        st.error(f"Could not load products: {e}")
        st.stop()

    if not products:
        st.info("No products found.")
    else:
        for p in products:
            with st.expander(f"#{p['id']} — {p['name']}  |  ${p['price']:.2f}"):
                col1, col2 = st.columns(2)
                col1.write(f"**Category:** {p['category'] or '—'}")
                col1.write(f"**Stock:** {p['stock']}")
                col1.write(f"**Active:** {'Yes' if p['is_active'] else 'No'}")
                col2.write(f"**Description:** {p['description'] or '—'}")

# ── Add ───────────────────────────────────────────────────────────────────────

elif page == "Add Product":
    st.header("Add New Product")
    with st.form("add_form"):
        name = st.text_input("Name")
        description = st.text_area("Description")
        price = st.number_input("Price", min_value=0.01, step=0.01)
        stock = st.number_input("Stock", min_value=0, step=1)
        category = st.text_input("Category")
        is_active = st.checkbox("Active", value=True)
        submitted = st.form_submit_button("Create")

    if submitted:
        payload = {
            "name": name,
            "description": description or None,
            "price": price,
            "stock": int(stock),
            "category": category or None,
            "is_active": is_active,
        }
        try:
            r = requests.post(f"{API_URL}/products/", json=payload)
            r.raise_for_status()
            st.success(f"Product created with id={r.json()['id']}")
        except Exception as e:
            st.error(f"Failed to create product: {e}")

# ── Edit / Delete ─────────────────────────────────────────────────────────────

elif page == "Edit / Delete Product":
    st.header("Edit or Delete a Product")
    product_id = st.number_input("Product ID", min_value=1, step=1)

    if st.button("Load"):
        try:
            p = get_product(int(product_id))
            st.session_state["loaded_product"] = p
        except Exception as e:
            st.error(f"Product not found: {e}")
            st.session_state.pop("loaded_product", None)

    if "loaded_product" in st.session_state:
        p = st.session_state["loaded_product"]
        st.subheader(f"Editing: {p['name']}")

        with st.form("edit_form"):
            name = st.text_input("Name", value=p["name"])
            description = st.text_area("Description", value=p["description"] or "")
            price = st.number_input("Price", min_value=0.01, step=0.01, value=p["price"])
            stock = st.number_input("Stock", min_value=0, step=1, value=p["stock"])
            category = st.text_input("Category", value=p["category"] or "")
            is_active = st.checkbox("Active", value=p["is_active"])
            save = st.form_submit_button("Save Changes")

        if save:
            payload = {
                "name": name,
                "description": description or None,
                "price": price,
                "stock": int(stock),
                "category": category or None,
                "is_active": is_active,
            }
            try:
                r = requests.put(f"{API_URL}/products/{p['id']}", json=payload)
                r.raise_for_status()
                st.success("Product updated.")
                st.session_state["loaded_product"] = r.json()
            except Exception as e:
                st.error(f"Update failed: {e}")

        st.divider()
        if st.button("Delete Product", type="primary"):
            try:
                r = requests.delete(f"{API_URL}/products/{p['id']}")
                r.raise_for_status()
                st.success("Product deleted.")
                del st.session_state["loaded_product"]
            except Exception as e:
                st.error(f"Delete failed: {e}")

# ── Visualizations ────────────────────────────────────────────────────────────

elif page == "Visualizations":
    st.header("Visualizations")

    if st.button("Generate: Products per Category"):
        try:
            r = requests.post(f"{API_URL}/visualizations/products-per-category")
            r.raise_for_status()
            st.success(r.json()["message"])
        except Exception as e:
            st.error(f"Failed to generate chart: {e}")

    chart_path = "/app/charts/products_per_category.png"
    try:
        with open(chart_path, "rb") as f:
            img = Image.open(io.BytesIO(f.read()))
        st.image(img, caption="Products per Category", use_container_width=True)
    except FileNotFoundError:
        st.info("No chart generated yet. Click the button above.")