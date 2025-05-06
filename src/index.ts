import { fromHono } from "chanfana";
import { Hono } from "hono";
import { ProductCreate, ProductDelete, ProductFetch, ProductEdit, ProductList  } from './endpoints/product';
import { UserCreate, UserDelete, UserFetch, UserList, UserEdit   } from './endpoints/user';

// Start a Hono app
const app = new Hono<{ Bindings: Env }>();

// Setup OpenAPI registry
const openapi = fromHono(app, {
	docs_url: "/",
});

// Register OpenAPI endpoints
openapi.get("/api/products", ProductList);
openapi.post("/api/product", ProductCreate);
openapi.get("/api/product/:id", ProductFetch);
openapi.delete("/api/product/:id", ProductDelete);
openapi.put("/api/product/:id", ProductEdit);

openapi.get("/api/users", UserList);
openapi.post("/api/user", UserCreate);
openapi.get("/api/user/:id", UserFetch);
openapi.delete("/api/user/:id", UserDelete);
openapi.put("/api/user/:id", UserEdit);

// You may also register routes for non OpenAPI directly on Hono
// app.get('/test', (c) => c.text('Hono!'))

// Export the Hono app
export default app;
