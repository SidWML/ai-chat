import { Database, Collection, ChatSummary, User } from "./types";

export const MOCK_USER: User = {
  id: "user-1",
  name: "Alex Johnson",
  email: "alex@company.com",
};

export const MOCK_DATABASES: Database[] = [
  {
    id: "db-1",
    name: "Production Analytics",
    type: "postgresql",
    status: "connected",
    description: "Main analytics database with user events and metrics",
    tables: ["users", "events", "sessions", "page_views", "conversions"],
  },
  {
    id: "db-2",
    name: "Customer CRM",
    type: "mysql",
    status: "connected",
    description: "Customer relationship management data",
    tables: ["customers", "deals", "contacts", "activities", "pipelines"],
  },
  {
    id: "db-3",
    name: "Inventory System",
    type: "postgresql",
    status: "connected",
    description: "Product inventory and warehouse data",
    tables: ["products", "warehouses", "stock_levels", "shipments", "suppliers"],
  },
  {
    id: "db-4",
    name: "Geo Locations",
    type: "mongodb",
    status: "connected",
    description: "Geographic and location-based data",
    tables: ["locations", "regions", "store_locations", "delivery_zones"],
  },
  {
    id: "db-5",
    name: "Legacy Orders",
    type: "sqlite",
    status: "disconnected",
    description: "Historical order data (read-only)",
    tables: ["orders", "order_items", "returns"],
  },
];

export const MOCK_COLLECTIONS: Collection[] = [
  {
    id: "col-1",
    name: "Sales Overview",
    databaseIds: ["db-1", "db-2"],
    description: "Combined analytics and CRM data for sales insights",
  },
  {
    id: "col-2",
    name: "Supply Chain",
    databaseIds: ["db-3", "db-4"],
    description: "Inventory and location data for logistics",
  },
];

export const MOCK_CHATS: ChatSummary[] = [
  {
    id: "chat-1",
    title: "Monthly revenue breakdown by region",
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    databaseId: "db-1",
  },
  {
    id: "chat-2",
    title: "Top customers by lifetime value",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    databaseId: "db-2",
  },
  {
    id: "chat-3",
    title: "Warehouse stock levels analysis",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    databaseId: "db-3",
  },
  {
    id: "chat-4",
    title: "Store locations near high-demand areas",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    collectionId: "col-2",
  },
  {
    id: "chat-5",
    title: "Q4 conversion funnel deep dive",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    databaseId: "db-1",
  },
  {
    id: "chat-6",
    title: "Customer churn prediction factors",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
    collectionId: "col-1",
  },
];
