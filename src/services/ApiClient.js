export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export class ApiClient {
  constructor({ baseUrl = "", fetchImpl = globalThis.fetch } = {}) {
    this.baseUrl = baseUrl.trim().replace(/\/+$/, "");
    this.fetchImpl = fetchImpl;

    if (this.baseUrl) {
      let parsedUrl;
      try {
        parsedUrl = new URL(this.baseUrl);
      } catch {
        throw new Error("VITE_API_BASE_URL must be an absolute HTTP or HTTPS URL.");
      }

      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        throw new Error("VITE_API_BASE_URL must use HTTP or HTTPS.");
      }
    }
  }

  get isConfigured() {
    return Boolean(this.baseUrl);
  }

  async request(path, { method = "GET", body, headers = {}, signal } = {}) {
    if (!this.isConfigured) {
      throw new Error("The API is not configured. Please use the email contact option.");
    }
    if (typeof path !== "string" || !path.trim() || path.startsWith("//")) {
      throw new Error("The API request path must be a non-empty relative path.");
    }

    const requestHeaders = new Headers(headers);
    const requestOptions = { method, headers: requestHeaders, signal };
    if (body !== undefined) {
      requestHeaders.set("Content-Type", "application/json");
      requestOptions.body = JSON.stringify(body);
    }

    const url = new URL(path.replace(/^\/+/, ""), `${this.baseUrl}/`);
    const response = await this.fetchImpl(url, requestOptions);

    if (!response.ok) {
      throw new ApiError(`The contact service returned HTTP ${response.status}.`, response.status);
    }
    if (response.status === 204) return null;

    const contentType = response.headers.get("content-type") ?? "";
    return contentType.includes("application/json") ? response.json() : response.text();
  }
}
