import { jsonSchema } from "ai";
import type { z } from "zod";

/**
 * 递归移除 JSON Schema 中的元信息字段（如 `$schema`）。
 *
 * zod v4 的 `toJSONSchema()` 会在生成的 schema 顶层注入
 * `"$schema": "https://json-schema.org/draft/2020-12/schema"`。
 * 部分模型供应商（如阿里云百炼 / 通义千问，错误码 InternalError.Algo）
 * 在解析 function calling 的 parameters 时会递归遍历该对象并对每个值调用
 * `.items()`，而 `$schema` 的值是字符串，导致服务端报
 * `'str' object has no attribute 'items'`。
 *
 * 这里在把 schema 交给模型前剥离这些元字段，避免触发该后端异常。
 */
export function stripSchemaMeta<T>(schema: T): T {
  if (Array.isArray(schema)) {
    return schema.map((item) => stripSchemaMeta(item)) as unknown as T;
  }
  if (schema && typeof schema === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(schema as Record<string, unknown>)) {
      if (key === "$schema") continue;
      result[key] = stripSchemaMeta(value);
    }
    return result as unknown as T;
  }
  return schema;
}

/**
 * 将 zod schema 转换为供应商安全的 function calling 工具入参 schema。
 *
 * 等价于 `jsonSchema(zodSchema.toJSONSchema())`，但会先剥离 `$schema` 等元字段，
 * 兼容对 JSON Schema 元信息敏感的模型后端。
 */
export function toToolSchema<T = unknown>(zodSchema: z.ZodType) {
  const raw = (zodSchema as any).toJSONSchema();
  return jsonSchema<T>(stripSchemaMeta(raw));
}
