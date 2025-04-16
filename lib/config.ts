// Configuration for the application
export const config = {
  // Set to true to use real API calls, false to use mock data
  useRealApi: true,

  // Base URL for the API
  apiBaseUrl: "http://localhost:8080",

  // Default page size for pagination
  defaultPageSize: 10,

  // Default sort order
  defaultSortField: "dueDate",
  defaultSortDirection: "desc" as "asc" | "desc",
}
