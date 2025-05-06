import { Bool, OpenAPIRoute, Str } from "chanfana";
import { z } from "zod";
import { type AppContext, User } from "../../types";

export class UserDelete extends OpenAPIRoute {
  schema = {
    tags: ["Users"],
    summary: "Delete a User",
    request: {
      params: z.object({
        id: Str({ description: "User id" }),
      }),
    },
    responses: {
      "200": {
        description: "Returns if the User was deleted successfully",
        content: {
          "application/json": {
            schema: z.object({
              success: Bool(),
              result: z.object({
                User: User, // 返回删除的商品信息
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
        "SELECT * FROM Users WHERE id = ?"
      )
        .bind(id)
        .all();

      if (!results || results.length === 0) {
        return {
          success: false,
          error: `User with slug '${id}' not found`,
        };
      }

      const UserToDelete = results[0];

      // 从数据库中删除商品
      await c.env.DB.prepare("DELETE FROM Users WHERE id = ?")
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
