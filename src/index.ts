import { Hono } from "hono";
import { SpanStatusCode, trace, context } from "@opentelemetry/api";
import { HTTPException } from "hono/http-exception";

import { tracer } from "./env";
import { getUsers } from "./db";

const app = new Hono();

app.onError(async (err, c) => {
	const spanContext = c.get("spanContext");
	const span = tracer.startSpan("app.onError", undefined, spanContext);
	span.setAttributes({
		"exception.message": err.message,
		"exception.stacktrace": err.stack,
	});
	span.setStatus({ code: SpanStatusCode.ERROR });

	await new Promise((resolve) => setTimeout(resolve, 2000));
	span.end();

	if (err instanceof HTTPException) {
		return c.json({ ok: false, error: err.message }, err.status);
	}

	return c.json({ ok: false, error: "Try again later" }, 500);
});

app.use(async (c, next) => {
	const span = tracer.startSpan("http-request");
	const spanContext = trace.setSpan(context.active(), span);

	c.set("spanContext", spanContext);

	await new Promise((resolve) => setTimeout(resolve, 1000));

	await next();

	span.setStatus({
		code: c.res.ok ? SpanStatusCode.OK : SpanStatusCode.ERROR,
	});

	span.setAttributes({
		"http.request.method": c.req.method,
		"http.response.status_code": c.res.status,
		"url.full": c.req.url,
	});

	await new Promise((resolve) => setTimeout(resolve, 1000));
	span.end();
});

app.get("/users", async (c) => {
	const spanContext = c.get("spanContext");
	const users = await context.with(spanContext, getUsers);

	return c.json({ ok: true, payload: users });
});

app.get("/users/:name", async (c) => {
	const name = c.req.param("name");
	const spanContext = c.get("spanContext");
	const user = await context.with(spanContext, getUsers, undefined, name);

	if (user.length === 0) {
		throw new HTTPException(404, { message: "User not found" });
	}

	return c.json({ ok: true, payload: user });
});

export default app;
