
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Home, LogIn, ArrowLeft } from "lucide-react";
import Layout from "@/components/Layout";

const Unauthorized = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center shadow-lg">
          <CardContent className="p-8">
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <Shield className="h-10 w-10 text-red-600" />
              </div>
              <h1 className="text-6xl font-bold text-red-600 mb-2">403</h1>
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">Access Denied</h2>
              <p className="text-gray-600 mb-6">
                You don't have permission to access this page. This area is restricted to users with specific roles or permissions.
              </p>
            </div>
            
            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link to="/">
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Link>
              </Button>
              
              <Button variant="outline" asChild className="w-full">
                <Link to="/auth">
                  <LogIn className="h-4 w-4 mr-2" />
                  Login with Different Account
                </Link>
              </Button>
              
              <Button variant="ghost" onClick={() => window.history.back()} className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Need access? <Link to="/contact" className="text-blue-600 hover:underline">Request Permission</Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Unauthorized;
