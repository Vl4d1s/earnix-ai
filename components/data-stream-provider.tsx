"use client";

import { createContext, useContext, type ReactNode } from "react";

// Stub provider - not needed for simplified POC
const DataStreamContext = createContext<any>(null);

export function DataStreamProvider({ children }: { children: ReactNode }) {
  return (
    <DataStreamContext.Provider value={null}>
      {children}
    </DataStreamContext.Provider>
  );
}

export function useDataStream() {
  return { dataStream: [], setDataStream: () => {} };
}
