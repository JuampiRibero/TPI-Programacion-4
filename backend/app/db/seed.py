from sqlmodel import select

from app.core.database import create_all_tables, session_factory
from app.core.security import hash_password
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto
from app.modules.usuarios.models import Usuario

ADMIN = {
    "username": "admin",
    "full_name": "Administrador",
    "email": "admin@foodstore.com",
    "password": "Admin1234!",
}

CATEGORIAS = [
    ("Pizzas", "Pizzas a la piedra"),
    ("Hamburguesas", "Carne smash con pan de papa"),
    ("Bebidas", "Para acompañar"),
    ("Postres", "Para cerrar bien"),
]


def _img(texto: str) -> str:
    return f"https://placehold.co/600x400/F0B429/1E2B24?text={texto.replace(' ', '+')}"


# (categoria, nombre, descripcion, precio, stock)
PRODUCTOS = [
    ("Pizzas", "Pizza Muzzarella", "Salsa de tomate, muzzarella y orégano", 9500.0, 20),
    ("Pizzas", "Pizza Napolitana", "Muzzarella, tomate en rodajas, ajo y albahaca", 10800.0, 15),
    ("Hamburguesas", "Hamburguesa Clásica", "Medallón de 150 g, lechuga, tomate y mayonesa", 7200.0, 25),
    ("Hamburguesas", "Hamburguesa Doble Cheddar", "Dos medallones, doble cheddar y panceta", 9900.0, 18),
    ("Bebidas", "Gaseosa Cola 500 ml", "Bien fría", 1800.0, 60),
    ("Bebidas", "Limonada con menta", "Exprimida en el momento", 2400.0, 30),
    ("Postres", "Flan casero", "Con dulce de leche y crema", 3500.0, 12),
    ("Postres", "Brownie con helado", "Chocolate semiamargo y helado de crema", 4200.0, 10),
]


def run() -> None:
    create_all_tables()
    with session_factory() as session:
        if session.exec(select(Usuario).where(Usuario.username == ADMIN["username"])).first() is None:
            session.add(
                Usuario(
                    username=ADMIN["username"],
                    full_name=ADMIN["full_name"],
                    email=ADMIN["email"],
                    hashed_password=hash_password(ADMIN["password"]),
                    role="admin",
                )
            )
            print("✔ Usuario admin creado")

        categorias: dict[str, Categoria] = {}
        for nombre, descripcion in CATEGORIAS:
            cat = session.exec(select(Categoria).where(Categoria.nombre == nombre)).first()
            if cat is None:
                cat = Categoria(nombre=nombre, descripcion=descripcion)
                session.add(cat)
                print(f"✔ Categoría creada: {nombre}")
            categorias[nombre] = cat
        session.flush()

        for cat_nombre, nombre, descripcion, precio, stock in PRODUCTOS:
            if session.exec(select(Producto).where(Producto.nombre == nombre)).first() is None:
                assert categorias[cat_nombre].id is not None
                session.add(
                    Producto(
                        categoria_id=categorias[cat_nombre].id,
                        nombre=nombre,
                        descripcion=descripcion,
                        precio_base=precio,
                        imagen_url=_img(nombre),
                        stock=stock,
                    )
                )
                print(f"✔ Producto creado: {nombre}")

        session.commit()
    print("Seed finalizado.")


if __name__ == "__main__":
    run()
