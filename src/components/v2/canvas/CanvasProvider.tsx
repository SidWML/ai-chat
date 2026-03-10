"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import type { CanvasBlock } from "@/lib/canvas-types";

interface CanvasContextValue {
  isOpen: boolean;
  blocks: CanvasBlock[];
  activeBlockId: string | null;
  history: CanvasBlock[][];
  historyIndex: number;
  openCanvas: () => void;
  closeCanvas: () => void;
  toggleCanvas: () => void;
  setBlocks: (blocks: CanvasBlock[]) => void;
  addBlock: (block: CanvasBlock) => void;
  setActiveBlockId: (id: string | null) => void;
  goToVersion: (index: number) => void;
}

const CanvasContext = createContext<CanvasContextValue | null>(null);

export function CanvasProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [blocks, setBlocksInternal] = useState<CanvasBlock[]>([]);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [history, setHistory] = useState<CanvasBlock[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Use refs to avoid dependency loops in callbacks
  const historyIndexRef = useRef(historyIndex);
  historyIndexRef.current = historyIndex;
  const historyRef = useRef(history);
  historyRef.current = history;

  const openCanvas = useCallback(() => setIsOpen(true), []);
  const closeCanvas = useCallback(() => setIsOpen(false), []);
  const toggleCanvas = useCallback(() => setIsOpen((v) => !v), []);

  // Stable setBlocks — no deps that change, so identity is stable
  const setBlocks = useCallback((newBlocks: CanvasBlock[]) => {
    setBlocksInternal(newBlocks);
    const idx = historyIndexRef.current;
    setHistory((prev) => [...prev.slice(0, idx + 1), newBlocks]);
    setHistoryIndex(idx + 1);
  }, []);

  const addBlock = useCallback((block: CanvasBlock) => {
    setBlocksInternal((prev) => {
      const next = [...prev, block];
      const idx = historyIndexRef.current;
      setHistory((h) => [...h.slice(0, idx + 1), next]);
      setHistoryIndex(idx + 1);
      return next;
    });
  }, []);

  const goToVersion = useCallback((index: number) => {
    const h = historyRef.current;
    if (index >= 0 && index < h.length) {
      setHistoryIndex(index);
      setBlocksInternal(h[index]);
    }
  }, []);

  return (
    <CanvasContext.Provider
      value={{
        isOpen,
        blocks,
        activeBlockId,
        history,
        historyIndex,
        openCanvas,
        closeCanvas,
        toggleCanvas,
        setBlocks,
        addBlock,
        setActiveBlockId,
        goToVersion,
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
}

export function useCanvas(): CanvasContextValue {
  const ctx = useContext(CanvasContext);
  if (!ctx) {
    throw new Error("useCanvas must be used within a CanvasProvider");
  }
  return ctx;
}
