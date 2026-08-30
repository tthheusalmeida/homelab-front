import {
  Gauge,
  Home,
  Kanban,
  MessageSquare,
  StepForward,
  Workflow,
} from "lucide-react";

import { useLocation, useNavigate } from "react-router";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "#ui/sidebar";

const navigation = [
  {
    label: "HomeLab",
    items: [
      {
        title: "Início",
        url: "/",
        icon: Home,
      },
    ],
  },
  {
    label: "AI",
    items: [
      {
        title: "Chat",
        url: "ai/chat",
        icon: MessageSquare,
      },
      {
        title: "Uso",
        url: "ai/usage",
        icon: Gauge,
      },
    ],
  },
  {
    label: "Jobs",
    items: [
      {
        title: "Inspeção",
        url: "jobs/track",
        icon: StepForward,
      },
    ],
  },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Sidebar>
      <SidebarContent>
        {navigation.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>

            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = location.pathname === item.url;

                  return (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton
                        isActive={isActive}
                        onClick={() => navigate(item.url)}
                        className="select-none"
                      >
                        <item.icon />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
