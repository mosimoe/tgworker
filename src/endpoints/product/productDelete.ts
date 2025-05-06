import { Bool, OpenAPIRoute, Str } from "chanfana";
import { z } from "zod";
import { type AppContext, Product } from "../../types";

export class ProductDelete extends OpenAPIRoute {
  schema = {
    tags: ["Products"],
    summary: "Delete a Product",
    request: {
      params: z.object({
        id: Str({ description: "Product id" }),
      }),
    },
    responses: {
      "200": {
        description: "Returns if the product was deleted successfully",
        content: {
          "application/json": {
            schema: z.object({
              success: Bool(),
              result: z.object({
                product: Product, // 返回删除的商品信息
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
      // 获取经过验证的请求参数
      const data = await this.getValidatedData<typeof this.schema>();
      const { id } = data.params;

      // 查询商品是否存在
      const { results } = await c.env.DB.prepare(
        "SELECT * FROM products WHERE id = ?"
      )
        .bind(id)
        .all();

      if (!results || results.length === 0) {
        return {
          success: false,
          error: `Product with slug '${id}' not found`,
        };
      }

      const productToDelete = results[0];

      // 从数据库中删除商品
      await c.env.DB.prepare("DELETE FROM products WHERE id = ?")
        .bind(id)
        .run();

      // 返回删除的商品信息
      return {
        success: true,
        result: {},
      };
    } catch (error: any) {
      // 处理数据库或其他错误
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
