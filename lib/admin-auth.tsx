'use client';

import { createContext, useContext } from 'react';

export interface AdminAuthContextType {
  token: string;
  headers: () => Record<string, string>;
}

export const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within admin layout');
  return ctx;
}
