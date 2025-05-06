import { DateTime, Str } from "chanfana";
import type { Context } from "hono";
import { z } from "zod";

export type AppContext = Context<{ Bindings: Env }>;

export const Task = z.object({
  name: Str({ example: "lorem" }),
  slug: Str(),
  description: Str({ required: false }),
  completed: z.boolean().default(false),
  due_date: DateTime(),
});

export const Product = z.object({
  id: z.number(),
  name: Str(), // 商品名称，必填
  description: Str({ required: false }), // 商品描述，可选
  price: z.number().int().min(0).openapi({ example: 20 }), // 价格，单位：分
  stock: z.number().int().min(0).openapi({ example: 100 }), // 库存，默认 0
  created_at: z.string().optional(), // 创建时间，可选
  updated_at: z.string().optional(), // 更新时间，可选
});

// 定义 User 模式
export const User = z.object({
	id: z.number(), // 用户 ID
	email: Str({ example: "user@example.com" }), // 用户邮箱，必填
	// password_hash: z.string().optional(), // 密码
	name: Str({ example: "John Doe" }), // 用户名，必填
	balance: z.number().min(0), // 账户余额，默认为 0
	role: Str({ example: "customer" }), // 角色，必填
	created_at: z.string().optional(), // 创建时间，可选
	updated_at: z.string().optional(), // 更新时间，可选
  });
  
  // 定义 Order 模式
  export const Order = z.object({
	id: z.number(), // 订单 ID
	user_id: z.number(), // 关联用户 ID
	total_amount: z.number().int().min(0).openapi({ example: 2000 }), // 总金额，单位：分
	status: Str({ example: "pending" }), // 订单状态，必填
	created_at: z.string().optional(), // 创建时间，可选
	updated_at: z.string().optional(), // 更新时间，可选
  });