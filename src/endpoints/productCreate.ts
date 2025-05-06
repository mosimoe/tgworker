import { Bool, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext, Product } from "../types";

// 定义 ProductCreate 类，继承 OpenAPIRoute
export class ProductCreate extends OpenAPIRoute {
  schema = {
    tags: ["Products"],
    summary: "Create a new Product",
    request: {
      body: {
        content: {
          "application/json": {
            schema: Product.omit({ id: true, created_at: true, updated_at: true }), // 请求体中不包含 id、created_at 和 updated_at
          },
        },
      },
    },
    responses: {
      "200": {
        description: "Returns the created product",
        content: {
          "application/json": {
            schema: z.object({
              success: Bool(),
              result: z.object({
                product: Product, // 返回完整的 Product，包括 id
              }),
            }),
          },
        },
      },
      "400": {
        description: "Invalid request data",
        content: {
          "application/json": {
            schema: z.object({
              success: Bool(),
              error: z.string(),
            }),
          },
        },
      },
      "500": {
        description: "Server error",
        content: {
          "application/json": {
            schema: z.object({
              success: Bool(),
              error: z.string(),
            }),
          },
        },
      },
    },
  };

  async handle(c: AppContext) {
    try {
      // 获取经过验证的请求数据
      const data = await this.getValidatedData<typeof this.schema>();

      // 提取验证后的请求体
      const productToCreate = data.body;

      // 插入数据到 D1 数据库
      const { meta: { last_row_id: product_id } } = await c.env.DB.prepare(
        "INSERT INTO products (name, description, price, stock) VALUES (?, ?, ?, ?)"
      )
        .bind(
          productToCreate.name,
          productToCreate.description || null, // 如果 description 是 undefined，则存入 null
          productToCreate.price,
          productToCreate.stock || 0 // 如果 stock 是 undefined，使用默认值 0
        )
        .run();

      // 查询刚插入的商品（包含自动生成的字段如 id、created_at 和 updated_at）
      const { results } = await c.env.DB.prepare("SELECT * FROM products WHERE id = ?")
        .bind(product_id)
        .all();

      if (!results || results.length === 0) {
        return {
          success: false,
          error: "Failed to retrieve created product",
        };
      }

      const createdProduct = results[0];

      // 返回创建的商品
      return {
        success: true,
        result: {
          product: {
            id: createdProduct.id, // 返回数据库生成的 id
            name: createdProduct.name,
            description: createdProduct.description,
            price: createdProduct.price,
            stock: createdProduct.stock,
            created_at: createdProduct.created_at,
            updated_at: createdProduct.updated_at,
          },
        },
      };
    } catch (error:any) {
      // 处理验证或数据库错误
      return {
        success: false,
        error: error.message,
      };
    }
  }
}