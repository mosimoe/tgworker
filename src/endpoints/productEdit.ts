import { Bool, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext, Product } from "../types";

// 定义 ProductEdit 类，继承 OpenAPIRoute
export class ProductEdit extends OpenAPIRoute {
  schema = {
    tags: ["Products"],
    summary: "Update an existing Product",
    request: {
      params: z.object({
        id: z.string().regex(/^\d+$/, "ID must be a number").transform(Number), // 路径参数：商品 ID
      }),
      body: {
        content: {
          "application/json": {
            schema: Product.omit({ id:true, created_at: true, updated_at: true }).partial(), // 请求体：部分字段可选
          },
        },
      },
    },
    responses: {
      "200": {
        description: "Returns the updated product",
        content: {
          "application/json": {
            schema: z.object({
              success: Bool(),
              result: z.object({
                product: Product, // 返回完整的 Product
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
      // 获取经过验证的请求数据
      const data = await this.getValidatedData<typeof this.schema>();

      // 提取路径参数和请求体
      const productId = data.params.id;
      const productUpdates = data.body;

      // 检查商品是否存在
      const { results: existingProducts } = await c.env.DB.prepare("SELECT * FROM products WHERE id = ?")
        .bind(productId)
        .all();

      if (!existingProducts || existingProducts.length === 0) {
        return {
          success: false,
          error: "Product not found",
        };
      }

      // 准备更新数据（只更新提供的字段）
      const existingProduct = existingProducts[0];
      const updatedFields = {
        name: productUpdates.name ?? existingProduct.name,
        description: productUpdates.description ?? existingProduct.description ?? null,
        price: productUpdates.price ?? existingProduct.price,
        stock: productUpdates.stock ?? existingProduct.stock,
      };

      // 更新数据库中的商品
      await c.env.DB.prepare(
        "UPDATE products SET name = ?, description = ?, price = ?, stock = ? WHERE id = ?"
      )
        .bind(
          updatedFields.name,
          updatedFields.description,
          updatedFields.price,
          updatedFields.stock,
          productId
        )
        .run();

      // 查询更新后的商品
      const { results } = await c.env.DB.prepare("SELECT * FROM products WHERE id = ?")
        .bind(productId)
        .all();

      if (!results || results.length === 0) {
        return {
          success: false,
          error: "Failed to retrieve updated product",
        };
      }

      const updatedProduct = results[0];

      // 返回更新后的商品
      return {
        success: true,
        result: {
          product: {
            name: updatedProduct.name,
            description: updatedProduct.description,
            price: updatedProduct.price,
            stock: updatedProduct.stock,
            created_at: updatedProduct.created_at,
            updated_at: updatedProduct.updated_at,
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