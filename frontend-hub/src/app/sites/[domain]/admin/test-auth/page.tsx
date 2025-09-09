'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getAuthHeaders, getAccessToken, isAuthenticated } from '@/lib/security/cookie-auth';
import { useTenant } from '@/providers/tenant-provider';
import { useAuth } from '@/providers/auth-provider';

export default function TestAuthPage() {
  const { tenant } = useTenant();
  const { user, isAuthenticated: authContextAuth } = useAuth();
  const [authInfo, setAuthInfo] = useState<any>({});
  const [cookies, setCookies] = useState<string>('');

  useEffect(() => {
    // Test all auth functions
    const token = getAccessToken();
    const headers = getAuthHeaders();
    const isAuth = isAuthenticated();
    
    // Get all cookies
    const allCookies = document.cookie;
    
    setAuthInfo({
      token,
      headers,
      isAuth,
      authContextAuth,
      user
    });
    
    setCookies(allCookies);
  }, [authContextAuth, user]);

  const testApiCall = async () => {
    try {
      const headers = getAuthHeaders();
      console.log('Headers being sent:', headers);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}/api/auth/me`, {
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      });
      
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      
      alert(`API Response: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      console.error('API Error:', error);
      alert(`API Error: ${error}`);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Test Authentication Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Tenant Info:</h3>
            <pre className="bg-gray-100 p-2 rounded text-xs">
              {JSON.stringify({ id: tenant.id, slug: tenant.slug, name: tenant.name }, null, 2)}
            </pre>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Auth Info:</h3>
            <pre className="bg-gray-100 p-2 rounded text-xs">
              {JSON.stringify(authInfo, null, 2)}
            </pre>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">All Cookies:</h3>
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
              {cookies || 'No cookies found'}
            </pre>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Test API Call:</h3>
            <Button onClick={testApiCall}>
              Test /api/auth/me
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}