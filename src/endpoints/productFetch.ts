import { Bool, OpenAPIRoute, Str } from "chanfana";
import { z } from "zod";
import { type AppContext, Product } from "../types";

export class ProductFetch extends OpenAPIRoute {
  schema = {
    tags: ["Products"],
    summary: "Get a single Product by slug",
    request: {
      params: z.object({
        id: Str({ description: "Product id" }), // 修改参数名为 slug，与商品相关
      }),
    },
    responses: {
      "200": {
        description: "Returns a single product if found",
        content: {
          "application/json": {
            schema: z.object({
              success: Bool(),
              result: z.object({
                product: Product, // 返回 Product 模式
              }),
            }),
          },
        },
      },
      "404": {
        description: "Product not found",
        content: {
          "application/json": {
            schema: z.object({
              success: Bool(),
              error: Str(),
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
              error: Str(),
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

      // 提取验证后的 slug 参数
      const { id } = data.params;

      // 从 D1 数据库查询商品
      const { results } = await c.env.DB.prepare("SELECT * FROM products WHERE id = ?")
        .bind(id)
        .all();

      // 检查是否找到商品
      if (!results || results.length === 0) {
        return {
          success: false,
          error: "Product not found",
        };
      }

      const product = results[0];

      // 返回查询到的商品
      return {
        success: true,
        result: {
          product: {
            name: product.name,
            slug: product.slug,
            description: product.description,
            price: product.price,
            stock: product.stock,
            created_at: product.created_at,
            updated_at: product.updated_at,
          },
        },
      };
    } catch (error:any) {
      // 处理数据库查询错误
      return {
        success: false,
        error: error.message,
      };
    }
  }
}