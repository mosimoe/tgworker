# Cloudflare Workers OpenAPI 3.1

This is a Cloudflare Worker with OpenAPI 3.1 using [chanfana](https://github.com/cloudflare/chanfana) and [Hono](https://github.com/honojs/hono).

This is an example project made to be used as a quick start into building OpenAPI compliant Workers that generates the
`openapi.json` schema automatically from code and validates the incoming request to the defined parameters or request body.

## Get started

1. Sign up for [Cloudflare Workers](https://workers.dev). The free tier is more than enough for most use cases.
2. Clone this project and install dependencies with `npm install`
3. Run `wrangler login` to login to your Cloudflare account in wrangler
4. Run `wrangler deploy` to publish the API to Cloudflare Workers

## Project structure

1. Your main router is defined in `src/index.ts`.
2. Each endpoint has its own file in `src/endpoints/`.
3. For more information read the [chanfana documentation](https://chanfana.pages.dev/) and [Hono documentation](https://hono.dev/docs).

## Development

1. Run `wrangler dev` to start a local instance of the API.
2. Open `http://localhost:8787/` in your browser to see the Swagger interface where you can try the endpoints.
3. Changes made in the `src/` folder will automatically trigger the server to reload, you only need to refresh the Swagger interface.

## 创建和配置 D1 数据库
Cloudflare Workers 通常使用 D1 作为其 serverless SQL 数据库。以下是创建和绑定 D1 数据库的步骤。

1. 创建 D1 数据库,使用 wrangler 创建一个新的 D1 数据库：`npx wrangler d1 create my-openapi-db`

2. 初始化数据库表,D1 数据库需要通过迁移文件（migration files）来定义表结构。`npx wrangler d1 migrations apply my-openapi-db --local` --local 表示在本地测试环境应用迁移。如果需要应用到远程数据库，移除 --local。