
import { useState, useEffect, useRef } from "react";
import { Search, Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import AuthStatus from "../auth/AuthStatus";

interface VendorNavbarProps {
  onSearch?: (query: string) => void;
}


export default function VendorNavbar({ onSearch }: VendorNavbarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationCount] = useState(3);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  const mockNotifications = [
    { id: 1, title: "New Order Received", message: "You have a new order for Logo Design", time: "2 mins ago", unread: true },
    { id: 2, title: "Payment Received", message: "$299 payment confirmed for Order #1234", time: "1 hour ago", unread: true },
    { id: 3, title: "Review Posted", message: "Customer left a 5-star review", time: "3 hours ago", unread: false },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center gap-4 px-4">
          <SidebarTrigger className="lg:hidden" />
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search listings, orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </form>

          {/* Right side actions */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Dark mode toggle */}
   
            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative h-9 w-9"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell className="h-4 w-4" />
                {notificationCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                  >
                    {notificationCount}
                  </Badge>
                )}
              </Button>

              {/* Notifications Panel */}
              {showNotifications && (
                <div className="absolute right-0 top-12 z-50">
                  <Card className="w-80 shadow-lg">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Notifications</CardTitle>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => setShowNotifications(false)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="max-h-96 overflow-y-auto">
                        {mockNotifications.map((notification, index) => (
                          <div key={notification.id}>
                            <div className={`p-4 hover:bg-muted/50 cursor-pointer ${notification.unread ? 'bg-primary/5' : ''}`}>
                              <div className="flex items-start gap-3">
                                <div className={`w-2 h-2 rounded-full mt-2 ${notification.unread ? 'bg-primary' : 'bg-muted'}`} />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium">{notification.title}</p>
                                  <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                                  <p className="text-xs text-muted-foreground mt-2">{notification.time}</p>
                                </div>
                              </div>
                            </div>
                            {index < mockNotifications.length - 1 && <Separator />}
                          </div>
                        ))}
                      </div>
                      <div className="p-3 border-t">
                        <Button variant="ghost" className="w-full text-sm">
                          View All Notifications
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>

            {/* User Avatar Dropdown */}
            {/* <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src="/placeholder.svg" alt="Vendor" />
                    <AvatarFallback>VD</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">John Vendor</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      john@vendor.com
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Billing</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu> */}

             <AuthStatus />
          </div>
        </div>
      </header>

    </>
  );
}