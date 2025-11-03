// Stub types for artifact - not used in simplified POC

export type ArtifactKind = "text" | "code" | "image" | "sheet";

export interface UIArtifact {
  id: string;
  kind: ArtifactKind;
  title: string;
  content: string;
  isVisible?: boolean;
  documentId?: string;
  status?: string;
}

export const artifactDefinitions = {};

// Stub component
export function Artifact() {
  return null;
}
