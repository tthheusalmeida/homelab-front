import { Outlet } from "react-router";

import { SidebarProvider, SidebarTrigger } from "#ui/sidebar";

import { AppSidebar } from "../../components/AppSidebar";

export function AppLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />

      <main className="flex min-h-svh flex-1 flex-col">
        <header className="flex h-14 items-center border-b px-4">
          <SidebarTrigger />
        </header>

        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </main>
    </SidebarProvider>
  );
}
