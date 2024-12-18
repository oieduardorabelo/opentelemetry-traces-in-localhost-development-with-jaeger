import { trace } from "@opentelemetry/api";
import { name, version } from "../package.json";

export const tracer = trace.getTracer(name, version);
