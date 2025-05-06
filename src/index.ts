import { fromHono } from "chanfana";
import { Hono } from "hono";
import { ProductCreate } from "./endpoints/productCreate";
import { ProductDelete } from "./endpoints/productDelete";
import { ProductFetch } from "./endpoints/productFetch";
import { ProductEdit } from "./endpoints/productEdit";
import { TaskList } from "./endpoints/productList";

// Start a Hono app
const app = new Hono<{ Bindings: Env }>();

// Setup OpenAPI registry
const openapi = fromHono(app, {
	docs_url: "/",
});

// Register OpenAPI endpoints
openapi.get("/api/products", TaskList);
openapi.post("/api/products", ProductCreate);
openapi.get("/api/products/:id", ProductFetch);
openapi.delete("/api/products/:id", ProductDelete);
openapi.put("/api/products/:id", ProductEdit);

// You may also register routes for non OpenAPI directly on Hono
// app.get('/test', (c) => c.text('Hono!'))

// Export the Hono app
export default app;
