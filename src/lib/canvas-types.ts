export type BlockType = "text" | "table" | "chart" | "code" | "map";

export interface CanvasBlock {
  id: string;
  type: BlockType;
  title: string;
  content?: string;
  data?: Record<string, unknown> | Record<string, unknown>[] | unknown;
  status: "loading" | "ready" | "error";
  error?: string;
}

export type ProcessingStep =
  | "thinking"
  | "selecting-database"
  | "generating-query"
  | "executing"
  | "rendering"
  | "complete"
  | "error";

export interface ProcessingState {
  step: ProcessingStep;
  message: string;
  progress?: number;
}
