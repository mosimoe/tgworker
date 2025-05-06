import { Bool, Num, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext, Product, Task } from "../types";

export class TaskList extends OpenAPIRoute {
  schema = {
    tags: ["Products"],
    summary: "List Products", // 修正 summary，因为实际返回的是 products
    request: {
      query: z.object({
        page: Num({
          description: "Page number",
          default: 1,
          required: false
        }),
        isCompleted: Bool({
          description: "Filter by completed flag",
          required: false,
        }),
      }),
    },
    responses: {
      "200": {
        description: "Returns a list of products",
        content: {
          "application/json": {
            schema: z.object({
              series: z.object({
                success: Bool(),
                result: z.object({
                  products: Product.array(),
                }),
              }),
            }),
          },
        },
      },
    },
  };

  async handle(c: AppContext) {
    // 获取验证后的查询参数
    const data = await this.getValidatedData<typeof this.schema>();
    const { page, isCompleted } = data.query;

    // 分页参数
    const pageSize = 10; // 每页 10 条记录
    const offset = page * pageSize;

    try {
      // 构建 SQL 查询
      let query = "SELECT * FROM products";
      const params = [];
      
      // 如果需要过滤（假设 products 表有 is_active 字段，类似 completed）
      // 如果没有 is_active 字段，可以跳过此逻辑，或者扩展数据库表
      if (isCompleted !== undefined) {
        query += " WHERE is_active = ?";
        params.push(isCompleted ? 1 : 0);
      }

      // 添加分页
    //   query += " LIMIT ? OFFSET ?";
    //   params.push(pageSize, offset);

      // 执行查询
      const { results } = await c.env.DB.prepare(query).bind(...params).all();

      // 验证和格式化结果
      const products = Product.array().parse(results);

      return {
        series: {
          success: true,
          result: {
            results,
          },
        },
      };
    } catch (error: any) {
      return {
        series: {
          success: false,
          result: {
            error: error.message,
          },
        },
      };
    }
  }
}