import { Resource } from "@opentelemetry/resources";
import {
	ATTR_SERVICE_NAME,
	ATTR_SERVICE_VERSION,
} from "@opentelemetry/semantic-conventions";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";

import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-node";

import { name, version } from "./package.json";

const resource = new Resource({
	[ATTR_SERVICE_NAME]: name,
	[ATTR_SERVICE_VERSION]: version,
});

const otlpBatchSpanProcessor = new BatchSpanProcessor(
	new OTLPTraceExporter({
		url: "http://localhost:4318/v1/traces",
	}),
);

const sdk = new NodeSDK({
	resource,
	spanProcessors: [otlpBatchSpanProcessor],
});

sdk.start();
