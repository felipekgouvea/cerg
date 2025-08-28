// Server Component
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { RQProvider } from "../_providers/rq-provider";
import { AppSidebar } from "./components/app-sidebar";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // O provider precisa envolver TUDO que usa useQuery (menu/sidebar inclusive)
    <RQProvider>
      <SidebarProvider>
        <AppSidebar />
        <main>
          <SidebarTrigger />
          {children}
        </main>
      </SidebarProvider>
    </RQProvider>
  );
}
