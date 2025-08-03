import type { ReactNode } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import VendorSidebar from "@/components/vendor/VendorSidebar";
import VendorNavbar  from "@/components/vendor/VendorNavbar";

interface VendorLayoutProps {
  children: ReactNode;
}

export default function VendorLayout({ children }: VendorLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <VendorSidebar />
        <SidebarInset className="flex-1">
          <VendorNavbar  />
          <main className="flex-1 p-6">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}