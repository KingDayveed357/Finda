import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { User, Building, Mail, Lock, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs,  TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import Layout from '@/components/Layout';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const authType = searchParams.get('type') || 'login';
  const userType = searchParams.get('userType') || 'customer';
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    companyName: '',
    phone: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock authentication logic
    console.log('Auth form submitted:', { authType, userType, formData });
    alert(`${authType === 'login' ? 'Login' : 'Signup'} successful! (Mock)`);
  };

  const isSignup = authType === 'signup';
  const isVendor = userType === 'vendor';

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-md mx-auto px-4">
          {/* Back Button */}
          <Button variant="ghost" asChild className="mb-6">
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>

          <Card>
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                {isVendor ? <Building className="h-6 w-6 text-white" /> : <User className="h-6 w-6 text-white" />}
              </div>
              <CardTitle className="text-2xl">
                {isSignup ? 'Create Account' : 'Welcome Back'}
              </CardTitle>
              <p className="text-gray-600">
                {isSignup 
                  ? `Sign up as a ${isVendor ? 'vendor' : 'customer'} to get started`
                  : 'Sign in to your account'
                }
              </p>
            </CardHeader>
            <CardContent>
              {isSignup && (
                <Tabs value={userType} className="mb-6">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="customer" asChild>
                      <Link to="/auth?type=signup&userType=customer">Customer</Link>
                    </TabsTrigger>
                    <TabsTrigger value="vendor" asChild>
                      <Link to="/auth?type=signup&userType=vendor">Vendor</Link>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignup && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName" className='mb-2 block'>First Name</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName" className='mb-2 block'>Last Name</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                          required
                        />
                      </div>
                    </div>

                    {isVendor && (
                      <div>
                        <Label htmlFor="companyName" className='mb-2 block'>Company Name</Label>
                        <Input
                          id="companyName"
                          value={formData.companyName}
                          onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                          required
                        />
                      </div>
                    )}

                    <div>
                      <Label htmlFor="phone" className='mb-2 block'>Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        required
                      />
                    </div>
                  </>
                )}

                <div>
                  <Label htmlFor="email" className='mb-2 block'>Email</Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="pl-10"
                      required
                    />
                    <Mail className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="password" className='mb-2 block'>Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      className="pl-10"
                      required
                    />
                    <Lock className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                {isSignup && (
                  <div>
                    <Label htmlFor="confirmPassword" className='mb-2 block'>Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="pl-10"
                        required
                      />
                      <Lock className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>
                )}

                <Button type="submit" className="w-full">
                  {isSignup ? 'Create Account' : 'Sign In'}
                </Button>
              </form>

              <div className="mt-6">
                <Separator className="my-4" />
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    {isSignup ? 'Already have an account?' : "Don't have an account?"}
                    <Link 
                      to={isSignup ? '/auth?type=login' : '/auth?type=signup'} 
                      className="ml-1 text-blue-600 hover:underline"
                    >
                      {isSignup ? 'Sign in' : 'Sign up'}
                    </Link>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Auth;