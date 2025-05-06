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
	price: z.number().int().min(0).openapi({ example: 1000 }), // 价格，单位：分
	stock: z.number().int().min(0).default(0).openapi({ example: 100 }), // 库存，默认 0
	created_at: z.string().optional(), // 创建时间，可选
	updated_at: z.string().optional(), // 更新时间，可选
  });
