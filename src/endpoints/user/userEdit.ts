import { Bool, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext, User } from "../../types";

// 定义 UserEdit 类，继承 OpenAPIRoute
export class UserEdit extends OpenAPIRoute {
  schema = {
    tags: ["Users"],
    summary: "Update an existing User",
    request: {
      params: z.object({
        id: z.string().regex(/^\d+$/, "ID must be a number").transform(Number), // 路径参数：商品 ID
      }),
      body: {
        content: {
          "application/json": {
            schema: User.omit({ id:true, created_at: true, updated_at: true }).partial(), // 请求体：部分字段可选
          },
        },
      },
    },
    responses: {
      "200": {
        description: "Returns the updated User",
        content: {
          "application/json": {
            schema: z.object({
              success: Bool(),
              result: z.object({
                User: User, // 返回完整的 User
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
      // 获取经过验证的请求数据
      const data = await this.getValidatedData<typeof this.schema>();

      // 提取路径参数和请求体
      const UserId = data.params.id;
      const UserUpdates = data.body;

      // 检查商品是否存在
      const { results: existingUsers } = await c.env.DB.prepare("SELECT * FROM Users WHERE id = ?")
        .bind(UserId)
        .all();

      if (!existingUsers || existingUsers.length === 0) {
        return {
          success: false,
          error: "User not found",
        };
      }

      // 准备更新数据（只更新提供的字段）
      const existingUser = existingUsers[0];
      const updatedFields = {
        name: UserUpdates.name ?? existingUser.name,
        email: UserUpdates.email ?? existingUser.email ?? null,
        balance: UserUpdates.balance ?? existingUser.balance,
        role: UserUpdates.role ?? existingUser.role,
      };

      // 更新数据库中的商品
      await c.env.DB.prepare(
        "UPDATE Users SET name = ?, email = ?, balance = ?, role = ? WHERE id = ?"
      )
        .bind(
          updatedFields.name,
          updatedFields.email,
          updatedFields.balance,
          updatedFields.role,
          UserId
        )
        .run();

      // 查询更新后的商品
      const { results } = await c.env.DB.prepare("SELECT * FROM Users WHERE id = ?")
        .bind(UserId)
        .all();

      if (!results || results.length === 0) {
        return {
          success: false,
          error: "Failed to retrieve updated User",
        };
      }

      const updatedUser = results[0];

      // 返回更新后的商品
      return {
        success: true,
        result: {
          User: {
            name: updatedUser.name,
            created_at: updatedUser.created_at,
            updated_at: updatedUser.updated_at,
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