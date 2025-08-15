import { Menu, Bell, User, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
// import { Link } from "react-router-dom";
// import { Badge } from "@/components/ui/badge";

export const FindaHeader = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <span className="text-lg font-bold text-primary-foreground">F</span>
          </div>
         <span className="text-xl font-bold text-gray-900">Finda</span>
              <Sparkles className="h-4 w-4 text-blue-600" />
          {/* <Badge variant="secondary" className="text-xs">AI</Badge> */}
        </div>

        {/* Quick Actions */}
        <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="h-10 w-24 border-2 cursor-pointer bg-transparent text-black hover:bg-accent rounded-lg p-0" onClick={() => window.location.href = '/'}>
              {/* <Link to={'/'}> */}
            Home
            {/* </Link> */}
          </Button>
          <Button variant="ghost" size="icon" className="hidden md:flex">
            <Bell className="h-4 w-4" />
          </Button>
          
          <Button variant="ghost" size="icon">
            <User className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};