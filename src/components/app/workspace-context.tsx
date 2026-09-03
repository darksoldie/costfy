import { useQuery } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import {
  readActiveWorkspaceId,
  workspacesQuery,
  writeActiveWorkspaceId,
  type MembershipWorkspace,
} from "@/lib/workspaces";

export interface WorkspaceContextValue {
  memberships: MembershipWorkspace[];
  active: MembershipWorkspace | null;
  setActiveId: (id: string) => void;
  loading: boolean;
  error: Error | null;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const query = useQuery(workspacesQuery());
  const [activeId, setActiveIdState] = useState<string | null>(null);

  // A preferência só pode ser lida após a hidratação (localStorage).
  useEffect(() => {
    setActiveIdState(readActiveWorkspaceId());
  }, []);

  const memberships = useMemo(() => query.data ?? [], [query.data]);

  const active = useMemo(() => {
    if (memberships.length === 0) return null;
    return memberships.find((m) => m.workspace.id === activeId) ?? memberships[0] ?? null;
  }, [memberships, activeId]);

  const value = useMemo<WorkspaceContextValue>(
    () => ({
      memberships,
      active,
      loading: query.isPending,
      error: query.error instanceof Error ? query.error : null,
      setActiveId: (id: string) => {
        writeActiveWorkspaceId(id);
        setActiveIdState(id);
      },
    }),
    [memberships, active, query.isPending, query.error],
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace(): WorkspaceContextValue {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace precisa estar dentro de WorkspaceProvider.");
  return ctx;
}
