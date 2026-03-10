export type DatabaseType = "postgresql" | "mysql" | "mongodb" | "sqlite" | "other";
export type DatabaseStatus = "connected" | "disconnected" | "error";

export interface Database {
  id: string;
  name: string;
  type: DatabaseType;
  status: DatabaseStatus;
  description?: string;
  tables?: string[];
}

export interface Collection {
  id: string;
  name: string;
  databaseIds: string[];
  description?: string;
  icon?: string;
}

export interface ChatSummary {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  databaseId?: string;
  collectionId?: string;
}

export interface QueryResult {
  columns: string[];
  rows: Record<string, unknown>[];
  rowCount: number;
}

export interface GeoFeature {
  type: "Feature";
  geometry: {
    type: "Point" | "Polygon" | "LineString";
    coordinates: number[] | number[][] | number[][][];
  };
  properties: Record<string, unknown>;
}

export interface GeoResult {
  type: "FeatureCollection";
  features: GeoFeature[];
}

export interface MessageMetadata {
  databaseId?: string;
  databaseName?: string;
  agentName?: string;
  queryExecuted?: string;
  executionTimeMs?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}
