import { Bool, OpenAPIRoute, Str } from "chanfana";
import { z } from "zod";
import { type AppContext, User } from "../../types";

export class UserFetch extends OpenAPIRoute {
  schema = {
    tags: ["Users"],
    summary: "Get a single User by slug",
    request: {
      params: z.object({
        id: Str({ description: "User id" }), // 修改参数名为 slug，与商品相关
      }),
    },
    responses: {
      "200": {
        description: "Returns a single User if found",
        content: {
          "application/json": {
            schema: z.object({
              success: Bool(),
              result: z.object({
                User: User, // 返回 User 模式
              }),
            }),
          },
        },
      },
      "404": {
        description: "User not found",
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
      const { results } = await c.env.DB.prepare("SELECT * FROM Users WHERE id = ?")
        .bind(id)
        .all();

      // 检查是否找到商品
      if (!results || results.length === 0) {
        return {
          success: false,
          error: "User not found",
        };
      }

      const User = results[0];

      // 返回查询到的商品
      return {
        success: true,
        result: {
          User: {
            name: User.name,
            created_at: User.created_at,
            updated_at: User.updated_at,
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