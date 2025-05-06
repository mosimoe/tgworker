import { Bool, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext, User } from "../../types";

// 定义 UserCreate 类，继承 OpenAPIRoute
export class UserCreate extends OpenAPIRoute {
  schema = {
    tags: ["Users"],
    summary: "Create a new User",
    request: {
      body: {
        content: {
          "application/json": {
            schema: User.omit({ id: true, created_at: true, updated_at: true }), // 请求体中不包含 id、created_at 和 updated_at
          },
        },
      },
    },
    responses: {
      "200": {
        description: "Returns the created User",
        content: {
          "application/json": {
            schema: z.object({
              success: Bool(),
              result: z.object({
                User: User, // 返回完整的 User，包括 id
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
      const UserToCreate = data.body;

      // 插入数据到 D1 数据库
      const { meta: { last_row_id: User_id } } = await c.env.DB.prepare(
        "INSERT INTO users (name, email, balance, role) VALUES (?, ?, ?, ?)"
      )
        .bind(
          UserToCreate.name,
          UserToCreate.email || null, // 如果 description 是 undefined，则存入 null
          UserToCreate.balance,
          UserToCreate.role || 0 // 如果 stock 是 undefined，使用默认值 0
        )
        .run();

      // 查询刚插入的商品（包含自动生成的字段如 id、created_at 和 updated_at）
      const { results } = await c.env.DB.prepare("SELECT * FROM users WHERE id = ?")
        .bind(User_id)
        .all();

      if (!results || results.length === 0) {
        return {
          success: false,
          error: "Failed to retrieve created User",
        };
      }

      const createdUser = results[0];

      // 返回创建的商品
      return {
        success: true,
        result: {
          User: {
            id: createdUser.id, // 返回数据库生成的 id
            name: createdUser.name,
            created_at: createdUser.created_at,
            updated_at: createdUser.updated_at,
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