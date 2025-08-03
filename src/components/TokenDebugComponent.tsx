// TokenDebugComponent.tsx - Add this temporarily to debug token issues
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TokenDebugComponent = () => {
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const checkTokenStatus = async () => {
    try {
      // Import auth service
      const { authService } = await import("@/service/authService");
      
      // Get token info
      const token = authService.getToken();
      const isAuth = authService.isAuthenticated();
      const storedUser = authService.getStoredUser();
      
      // Check localStorage directly
      const tokenFromStorage = localStorage.getItem('authToken');
      const userFromStorage = localStorage.getItem('user');
      
      const info = {
        tokenExists: !!token,
        tokenLength: token?.length || 0,
        tokenStart: token?.substring(0, 20) + '...',
        isAuthenticated: isAuth,
        storedUserExists: !!storedUser,
        storedUserEmail: storedUser?.email,
        tokenFromStorageExists: !!tokenFromStorage,
        userFromStorageExists: !!userFromStorage,
        tokenFromStorageLength: tokenFromStorage?.length || 0,
      };
      
      setDebugInfo(info);
      console.log('Token Debug Info:', info);
    } catch (error) {
      console.error('Debug error:', error);
      setDebugInfo({ error: typeof error === "object" && error !== null && "message" in error ? (error as any).message : String(error) });
    }
  };

  const testApiCall = async () => {
    try {
      const { authService } = await import("@/service/authService");
      const user = await authService.getCurrentUser();
      console.log('API call successful:', user);
      alert('API call successful!');
    } catch (error) {
      console.error('API call failed:', error);
      alert(`API call failed: ${typeof error === "object" && error !== null && "message" in error ? (error as any).message : String(error)}`);
    }
  };

  return (
    <Card className="m-4">
      <CardHeader>
        <CardTitle>Token Debug Component</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <Button onClick={checkTokenStatus}>Check Token Status</Button>
          <Button onClick={testApiCall} variant="outline">Test API Call</Button>
        </div>
        
        {debugInfo && (
          <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        )}
      </CardContent>
    </Card>
  );
};

export default TokenDebugComponent;