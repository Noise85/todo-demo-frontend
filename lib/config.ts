// Configuration for the application
export const config = {
  // Set to true to use real API calls, false to use mock data
  useRealApi: false,

  // Set to true to use real WebSocket for notifications, false to use mock notifications
  useRealWebSocket: false, // Set to true to use real WebSocket, false for mock

  // WebSocket URL for notifications
  websocketUrl: process.env.NEXT_PUBLIC_WEBSOCKET_URL || "ws://localhost:8080",

  // Base URL for the API
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.example.com",

  // Default page size for pagination
  defaultPageSize: 10,

  // Default sort order
  defaultSortField: "dueDate",
  defaultSortDirection: "desc" as "asc" | "desc",
}
