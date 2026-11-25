# Food Store

Trabajo Práctico Integrador - Programación 4 - Tecnicatura Universitaria en Programación a Distancia - UTN.

Aplicación web para un negocio de comidas donde los clientes se registran, recorren el catálogo, arman un carrito y confirman un pedido; el administrador gestiona categorías, productos, stock, pedidos y usuarios.

- **Backend:** FastAPI + SQLModel, arquitectura en capas (Router → Service → Unit of Work → Repository → Model), JWT en cookie HttpOnly, roles `user` / `admin`.
- **Frontend:** React + TypeScript (Vite, Tailwind CSS 4), TanStack Query / Form / Table, Zustand, Axios, React Router.

> **Repositorio:** [`¡Ir al repositorio!`](https://github.com/JuampiRibero/TPI-Programacion-4)

> **Video de demostración:** [`¡Ir al video!`](https://github.com/JuampiRibero/TPI-Programacion-4)

## Estructura

```
food-store/
├── backend/    API REST (FastAPI)
├── frontend/   Aplicación web (React)
└── README.md
```

## Requisitos

| Herramienta | Versión                                                            |
| ----------- | ------------------------------------------------------------------ |
| Python      | 3.11 a 3.13 (SQLModel 0.0.22 no funciona con 3.14)                 |
| Node.js     | 20.19 o superior                                                   |
| pnpm        | 9 o superior (`npm i -g pnpm`)                                     |
| PostgreSQL  | 15 o superior (**opcional**: para desarrollo se puede usar SQLite) |

## Backend

```bash
cd backend
python -m venv venv
# Linux / macOS:
source venv/bin/activate
# Windows (PowerShell):
venv\Scripts\Activate.ps1

pip install -r requirements.txt
cp .env.example .env            # Windows: copy .env.example .env
python -m app.db.seed           # crea el admin, categorías y productos (idempotente)
uvicorn app.main:app --reload
```

La API queda en <http://localhost:8000>. Documentación: **/docs** (Swagger) y **/redoc**.

### Variables de entorno (`backend/.env`)

| Variable                      | Descripción                          | Ejemplo                                        |
| ----------------------------- | ------------------------------------ | ---------------------------------------------- |
| `DATABASE_URL`                | Conexión a la base                   | `sqlite:///./foodstore.db`                     |
| `SECRET_KEY`                  | Firma del JWT (mínimo 32 caracteres) | `cambiar-esta-clave-de-al-menos-32-caracteres` |
| `ALGORITHM`                   | Algoritmo del JWT                    | `HS256`                                        |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Expiración de la cookie y del token  | `30`                                           |
| `FRONTEND_ORIGIN`             | Origen permitido en CORS             | `http://localhost:5173`                        |

El `.env.example` usa **SQLite** para que funcione sin instalar nada. Las tablas se crean automáticamente al iniciar la API (y al correr el seed).

### Usuario del seed

| Usuario | Contraseña   | Rol     |
| ------- | ------------ | ------- |
| `admin` | `Admin1234!` | `admin` |

El seed también carga 4 categorías y 8 productos con stock. Los clientes se crean desde **Crear cuenta** en el frontend.

## Frontend

```bash
cd frontend
cp .env.example .env            # Windows: copy .env.example .env
pnpm install
pnpm build                      # verifica los tipos (tsc estricto) y compila
pnpm dev
```

La aplicación queda en <http://localhost:5173> (el backend debe estar corriendo).

### Variables de entorno (`frontend/.env`)

| Variable       | Descripción                            | Ejemplo                        |
| -------------- | -------------------------------------- | ------------------------------ |
| `VITE_API_URL` | URL base de la API (incluye `/api/v1`) | `http://localhost:8000/api/v1` |

## Decisiones de diseño

- **Cookie HttpOnly:** el JWT viaja solo en la cookie `access_token`; el login responde `{"message": "Login exitoso"}` sin el token y el frontend nunca lo lee ni lo guarda. `authStore` persiste únicamente el usuario (`partialize`).
- **Unit of Work:** el `commit`/`rollback`/`close` ocurre en `__exit__` del Unit of Work. Ningún Service ni Router llama a `session.commit()`. Los Services abren `with self.uow as uow:` y devuelven el schema de salida dentro del bloque.
- **Crear pedido (RN-01):** una sola transacción; se verifica y descuenta el stock y se copian `nombre_producto` y `precio_unitario` en cada línea. Si algo falla, no se persiste nada. Se usa `SELECT … FOR UPDATE` sobre los productos para evitar vender el mismo stock en pedidos simultáneos (PostgreSQL).
- **Máquina de estados (RN-02/03):** diccionario `TRANSICIONES` en `pedidos/service.py`; al cancelar se restituye el stock en la misma transacción.
- **Permisos (RN-04):** el cliente solo ve y cancela sus pedidos y solo desde `PENDIENTE` (403 si el pedido es ajeno); el `admin` ve todos y avanza o cancela cualquier pedido no terminal.
- **Inmutabilidad (RN-05):** no existen endpoints de edición ni borrado de pedidos.
- **Códigos de error:** 404 (no encontrado), 409 (duplicado), 403 (pedido ajeno / rol no permitido), 401 (sin sesión), 400 (reglas de negocio / cuenta desactivada), 422 (validación).

## Estructura del frontend

```
src/
├── shared/      api (axios, handleApiError, queryClient), ui, components, layout, utils
├── features/    auth, categorias, productos, usuarios, pedidos  (pages, components, hooks, api, types)
├── store/       authStore, cartStore (Zustand + persist)
└── routes/      AppRouter, ProtectedRoute
```

## Pantallas

| Ruta                                    | Acceso  | Descripción                                                      |
| --------------------------------------- | ------- | ---------------------------------------------------------------- |
| `/`                                     | Público | Catálogo paginado en el servidor, búsqueda, filtro por categoría |
| `/login`, `/register`                   | Público | Formularios con TanStack Form                                    |
| `/carrito`                              | Público | Carrito persistido en el navegador                               |
| `/checkout`                             | Sesión  | Dirección, forma de pago y notas                                 |
| `/mis-pedidos`                          | Sesión  | Pedidos propios, detalle y cancelación en PENDIENTE              |
| `/admin/resumen`                        | admin   | Indicadores del negocio                                          |
| `/admin/pedidos`                        | admin   | Filtro por estado y cambio de estado                             |
| `/admin/productos`, `/admin/categorias` | admin   | ABM con TanStack Table y Form; cambio de stock y disponibilidad  |
| `/admin/usuarios`                       | admin   | Activar y desactivar usuarios                                    |
