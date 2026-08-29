import { Outlet } from "react-router";

import { SidebarProvider, SidebarTrigger } from "#ui/sidebar";

import { AppSidebar } from "../../components/AppSidebar";
import { ClockAndTime } from "#components/ClockAndTime";

export function AppLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />

      <main className="flex min-h-svh flex-1 flex-col">
        <header className="sticky top-0 z-50 flex h-14 items-center border-b bg-background px-4">
          <SidebarTrigger />
          <ClockAndTime />
        </header>

        <main className="flex min-w-0 flex-1 flex-col p-4">
          <Outlet />
        </main>
      </main>
    </SidebarProvider>
  );
}
