import { NavLink, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  User,
  Settings,
  LogOut,
  Store
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const navigationItems = [
  { title: "Dashboard", url: "/vendor/dashboard", icon: LayoutDashboard },
  { title: "My Listings", url: "/vendor/listings", icon: Package },
  { title: "Orders", url: "/vendor/orders", icon: ShoppingCart },
  { title: "Analytics", url: "/vendor/analytics", icon: BarChart3 },
  { title: "Profile", url: "/vendor/profile", icon: User },
  { title: "Settings", url: "/vendor/settings", icon: Settings },
];

export default function VendorSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const { logout, isLoading } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const isActive = (path: string) => {
    if (path === "/vendor") {
      return currentPath === "/vendor" || currentPath === "/vendor/";
    }
    return currentPath.startsWith(path);
  };

  const getNavClasses = (path: string) => {
    return isActive(path)
      ? "bg-primary text-primary-foreground font-medium"
      : "hover:bg-muted/50 text-muted-foreground hover:text-foreground";
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = async () => {
    try {
      await logout();
      toast.success("Successfully logged out");
      setShowLogoutModal(false);
    } catch (error) {
      console.error('Logout error:', error);
      toast.error("Failed to logout. Please try again.");
    }
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  return (
    <>
      <Sidebar className="border-r">
        <SidebarHeader className="border-b px-6 py-4">
          <div className="flex items-center gap-2">
            <Store className="h-6 w-6 text-primary" />
            {state === "expanded" && (
              <span className="font-semibold text-lg">Vendor Hub</span>
            )}
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} className={getNavClasses(item.url)}>
                        <item.icon className="h-4 w-4" />
                        {state === "expanded" && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup className="mt-auto">
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={handleLogoutClick}
                    className="text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    disabled={isLoading}
                  >
                    <LogOut className="h-4 w-4" />
                    {state === "expanded" && (
                      <span>{isLoading ? 'Logging out...' : 'Logout'}</span>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <AlertDialog open={showLogoutModal} onOpenChange={setShowLogoutModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to logout? You will need to sign in again to access your vendor dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleLogoutCancel}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleLogoutConfirm}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? 'Logging out...' : 'Logout'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}