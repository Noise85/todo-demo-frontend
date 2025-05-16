declare global {
  interface Window {
    __APP_CONFIG__?: {
      apiBaseUrl?: string;
    };
  }
}

// Export default configuration using window-based config
export const config = {
  useRealApi: true,

  // Read from runtime-injected config, fallback to localhost
  apiBaseUrl: typeof window !== "undefined" && window.__APP_CONFIG__?.apiBaseUrl
      ? window.__APP_CONFIG__.apiBaseUrl
      : "http://localhost:8080/api",

  defaultPageSize: 10,
  defaultSortField: "dueDate",
  defaultSortDirection: "desc" as "asc" | "desc",
};