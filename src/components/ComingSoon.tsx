import { Construction, Clock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

interface ComingSoonProps {
  title?: string;
  description?: string;
  showBackButton?: boolean;
}

export default function ComingSoon({ 
  title = "Coming Soon", 
  description = "This page is under construction. We're working hard to bring you something amazing!",
  showBackButton = true 
}: ComingSoonProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="p-8">
          <div className="mb-6">
            <div className="relative mx-auto w-20 h-20 mb-4">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-primary/10 animate-pulse"></div>
              <div className="absolute inset-2 rounded-full bg-background flex items-center justify-center">
                <Construction className="h-8 w-8 text-primary" />
              </div>
            </div>
          </div>
          
          <h1 className="text-2xl font-bold mb-3 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            {title}
          </h1>
          
          <p className="text-muted-foreground mb-6 leading-relaxed">
            {description}
          </p>
          
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-6">
            <Clock className="h-4 w-4" />
            <span>Expected completion: Soon</span>
          </div>
          
          {showBackButton && (
            <Button 
              onClick={() => navigate(-1)} 
              variant="outline" 
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}