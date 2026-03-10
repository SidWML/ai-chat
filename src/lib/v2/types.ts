// === Connection Types ===
export type DatabaseType = "postgresql" | "mysql" | "mssql";
export type ConnectionStatus = "active" | "error" | "deleted";

export interface ConnectionConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: boolean;
}

export interface Connection {
  id: string;
  name: string;
  description?: string;
  type: DatabaseType;
  status: ConnectionStatus;
  last_tested_at?: string;
  last_error?: string;
  created_at: string;
  updated_at: string;
}

export interface ConnectionWithConfig extends Connection {
  config: ConnectionConfig;
}

export interface CreateConnectionRequest {
  name: string;
  description?: string;
  type: DatabaseType;
  config: ConnectionConfig;
}

export interface UpdateConnectionRequest {
  name?: string;
  description?: string;
  config?: Partial<ConnectionConfig>;
}

export interface TestConnectionResult {
  success: boolean;
  latency_ms?: number;
  database_version?: string;
  tables_count?: number;
  database_size_mb?: number;
  error?: string;
  error_code?: string;
  suggestions?: string[];
}

export interface PaginatedConnections {
  items: Connection[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// === Thread Types ===
export interface ThreadSummary {
  thread_id: string;
  title?: string | null;
  created_at: string;
  updated_at: string;
  message_count: number;
  values: {
    messages?: Array<{ content: string | { text: string }[] }>;
    connection_id?: string | null;
    connection_name?: string | null;
  };
}

export interface AGMessage {
  role: "human" | "assistant" | "system";
  content: string | Array<{ type: string; text?: string }>;
}

export interface ThreadSnapshotResponse {
  thread_id: string;
  title?: string | null;
  messages: AGMessage[] | string;
  state: unknown;
  values?: {
    final_canvas?: CanvasDocument;
    [key: string]: unknown;
  };
}

// === Canvas Types ===
export interface CanvasDocument {
  id: string;
  title?: string;
  blocks: BackendBlock[];
  metadata?: Record<string, unknown>;
  frontend_document?: FrontendDocument;
}

export interface FrontendDocument {
  blocks: FrontendBlock[];
}

export type BackendBlock =
  | { type: "text"; block_id?: string; content: string }
  | {
      type: "table";
      block_id: string;
      title?: string;
      columns?: string[];
      data?: unknown[];
    }
  | { type: "python"; block_id: string; title?: string; content: string }
  | {
      type: "chart";
      block_id: string;
      title?: string;
      content: string;
      width?: number;
      height?: number;
    }
  | {
      type: "map";
      block_id: string;
      title?: string;
      map_type?: string;
      geo_level?: string;
      data?: Record<string, unknown>;
    };

export type FrontendBlock =
  | { type: "text"; block_id: string; title: string; content: string }
  | {
      type: "table";
      block_id: string;
      title: string;
      base_query: string;
      primary_key: string;
      columns?: string[];
      data?: Record<string, unknown>[];
      row_count?: number;
      error?: string;
    }
  | {
      type: "python";
      block_id: string;
      title: string;
      content: string;
      output?: string;
      error?: string;
    }
  | {
      type: "chart";
      block_id: string;
      title: string;
      image_url?: string;
      image_id?: string;
      code?: string;
      error?: string;
      width?: number;
      height?: number;
    }
  | {
      type: "map";
      block_id: string;
      title: string;
      map_type: string;
      geo_level: string;
      data?: Record<string, unknown>;
      error?: string;
    };

export interface CanvasVersion {
  checkpoint_id: string;
  version_number: number;
  created_at: string;
  title: string;
  user_request?: string | null;
}

export interface CanvasHistoryResponse {
  versions: CanvasVersion[];
}

// === Metadata Types ===
export type TableType = "table" | "view" | "materialized_view";
export type ColumnType =
  | "string"
  | "integer"
  | "float"
  | "decimal"
  | "boolean"
  | "date"
  | "datetime"
  | "time"
  | "json"
  | "binary"
  | "uuid"
  | "array"
  | "unknown";

export interface TableInfo {
  name: string;
  schema_name?: string;
  table_type: TableType;
  row_count_estimate?: number;
  size_bytes?: number;
  comment?: string;
}

export interface ColumnInfo {
  name: string;
  data_type: string;
  normalized_type: ColumnType;
  nullable: boolean;
  default_value?: string;
  is_primary_key: boolean;
  is_foreign_key: boolean;
  comment?: string;
  max_length?: number;
}

export interface TableSchema {
  name: string;
  schema_name?: string;
  table_type: TableType;
  row_count: number;
  size_bytes?: number;
  columns: ColumnInfo[];
  primary_key: string[];
  foreign_keys: ForeignKeyInfo[];
  indexes: IndexInfo[];
  comment?: string;
}

export interface ForeignKeyInfo {
  column: string;
  referenced_table: string;
  referenced_column: string;
  constraint_name?: string;
}

export interface IndexInfo {
  name: string;
  columns: string[];
  is_unique: boolean;
  type?: string;
}

export interface SampleDataResponse {
  table: string;
  columns: string[];
  data: Record<string, unknown>[];
  total_rows: number;
}

export interface TableRelationship {
  from_table: string;
  from_column: string;
  to_table: string;
  to_column: string;
  relationship_type: "explicit_fk" | "inferred" | "possible";
  confidence: number;
  cardinality: "one_to_one" | "one_to_many" | "many_to_many";
}

// === Introspection Types ===
export type IntrospectionStatus =
  | "pending"
  | "running"
  | "pending_input"
  | "completed"
  | "error"
  | "cancelled"
  | "not_started";
export type IntrospectionStage =
  | "initializing"
  | "schema_discovery"
  | "asking_questions"
  | "collecting_statistics"
  | "analyzing_relationships"
  | "generating_output"
  | "completed"
  | "error";

export interface IntrospectionProgress {
  current_step: number;
  total_steps: number;
  percentage: number;
  stage: IntrospectionStage;
  message: string;
  tables_analyzed: number;
  total_tables: number;
}

export interface ClarifyingQuestion {
  id: string;
  question: string;
  type: "single_select" | "multi_select" | "text" | "boolean";
  options?: string[];
  default_value?: string;
}

export interface IntrospectionResult {
  id: number;
  connection_id: string;
  status: IntrospectionStatus;
  schema_name: string;
  progress: IntrospectionProgress;
  discovered_tables: Array<{ name: string; row_count?: number }> | null;
  pending_questions: ClarifyingQuestion[] | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

// === Dashboard Types ===
export interface Dashboard {
  id: string;
  title: string;
  description?: string;
  connection_id?: string;
  is_public?: boolean;
  created_at: string;
  updated_at: string;
  widgets?: DashboardWidget[];
}

export interface DashboardWidget {
  id: string;
  dashboard_id: string;
  thread_id: string;
  block_id: string;
  checkpoint_id?: string;
  title?: string;
  position_x: number;
  position_y: number;
  grid_width: number;
  grid_height: number;
  block_type?: string;
  block_data?: unknown;
}

export interface DashboardCreate {
  title: string;
  description?: string;
  connection_id?: string;
  is_public?: boolean;
}

// === Suggestions ===
export interface Suggestion {
  title: string;
  prompt: string;
  label?: string | null;
}
