"use client";

import { AppSidebar } from "./app-sidebar";
import { PageContainer } from "./page-container";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <PageContainer>{children}</PageContainer>
    </div>
  );
}
