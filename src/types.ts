import type { Context } from "@opentelemetry/api";

declare module "hono" {
	interface ContextVariableMap {
		spanContext: Context;
	}
}
