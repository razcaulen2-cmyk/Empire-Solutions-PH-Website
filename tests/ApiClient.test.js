import assert from "node:assert/strict";
import test from "node:test";
import { ApiClient, ApiError } from "../src/services/ApiClient.js";

test("API client posts JSON to the configured endpoint", async () => {
  let requestUrl;
  let requestOptions;
  const client = new ApiClient({
    baseUrl: "https://api.example.test/v1/",
    fetchImpl: async (url, options) => {
      requestUrl = url;
      requestOptions = options;
      return new Response('{"received":true}', {
        headers: { "content-type": "application/json" },
      });
    },
  });

  const result = await client.request("/contact", {
    method: "POST",
    body: { name: "Alex" },
  });

  assert.equal(requestUrl.href, "https://api.example.test/v1/contact");
  assert.equal(requestOptions.method, "POST");
  assert.equal(requestOptions.headers.get("content-type"), "application/json");
  assert.deepEqual(JSON.parse(requestOptions.body), { name: "Alex" });
  assert.deepEqual(result, { received: true });
});

test("API client reports unsuccessful HTTP responses", async () => {
  const client = new ApiClient({
    baseUrl: "https://api.example.test",
    fetchImpl: async () => new Response("Unavailable", { status: 503 }),
  });

  await assert.rejects(client.request("/contact"), (error) => {
    assert.ok(error instanceof ApiError);
    assert.equal(error.status, 503);
    return true;
  });
});

test("API client cannot send when no endpoint has been configured", async () => {
  let requested = false;
  const client = new ApiClient({
    fetchImpl: async () => {
      requested = true;
      return new Response();
    },
  });

  assert.equal(client.isConfigured, false);
  await assert.rejects(client.request("/contact"), /API is not configured/);
  assert.equal(requested, false);
});

test("API client rejects non-HTTP endpoint schemes", () => {
  assert.throws(() => new ApiClient({ baseUrl: "file:///private/api" }), /must use HTTP or HTTPS/);
});
