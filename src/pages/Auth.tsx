import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { User, Building, Mail, Lock, ArrowLeft, Upload, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import Layout from '@/components/Layout';
import SEO from '@/components/SEO';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const authType = searchParams.get('type') || 'login';
  const userType = searchParams.get('userType') || 'customer';
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    businessName: '',
    businessDescription: '',
    businessImage: null as File | null,
    phone: ''
  });

  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);

  const handleGenerateDescription = async () => {
    if (!formData.businessName) {
      toast.error("Business name required", {
        description: "Please enter a business name first.",
      });
      return;
    }
    
    setIsGeneratingDescription(true);
    try {
      // Mock AI description generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      const aiDescription = `${formData.businessName} is a professional business that specializes in providing high-quality products and services to customers. We are committed to excellence and customer satisfaction, offering innovative solutions tailored to meet your specific needs.`;
      
      setFormData(prev => ({ ...prev, businessDescription: aiDescription }));
      toast.success("Description generated!", {
        description: "AI has generated a business description for you.",
      });
    } catch (error) {
      toast.error("Error", {
        description: "Failed to generate description. Please try again.",
      });
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, businessImage: file }));
      toast.success("Image uploaded", {
        description: `${file.name} has been selected.`,
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSignup && formData.password !== formData.confirmPassword) {
      toast.error("Passwords don't match", {
        description: "Please make sure both passwords are identical.",
      });
      return;
    }

    // Mock authentication logic
    console.log('Auth form submitted:', { authType, userType, formData });
    
    if (isSignup) {
      toast.success("Account created successfully!", {
        description: "Please check your email to verify your account.",
      });
    } else {
      toast.success("Login successful!", {
        description: "Welcome back to Finda!",
      });
    }
  };

  const isSignup = authType === 'signup';
  const isVendor = userType === 'vendor';

  const getPageTitle = () => {
    if (isSignup) {
      return isVendor ? "Vendor Registration - Join Finda" : "Create Account - Join Finda";
    }
    return "Login to Finda - AI Marketplace";
  };

  const getPageDescription = () => {
    if (isSignup) {
      return isVendor 
        ? "Join Finda as a vendor and start selling your products with AI-powered tools and analytics."
        : "Create your Finda account to discover amazing products with AI recommendations.";
    }
    return "Login to your Finda account to access personalized AI recommendations and your marketplace.";
  };

  return (
    <Layout>
      <SEO title={getPageTitle()} description={getPageDescription()} />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-lg mx-auto px-4">
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
                    <div>
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>

                    {isVendor && (
                      <>
                        <div>
                          <Label htmlFor="businessName">Business Name</Label>
                          <Input
                            id="businessName"
                            value={formData.businessName}
                            onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                            placeholder="Enter your business name"
                            required
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label htmlFor="businessDescription">Business Description</Label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleGenerateDescription}
                              disabled={!formData.businessName || isGeneratingDescription}
                              className="flex items-center gap-2"
                            >
                              <Sparkles className="h-4 w-4" />
                              {isGeneratingDescription ? 'Generating...' : 'AI Generate'}
                            </Button>
                          </div>
                          <Textarea
                            id="businessDescription"
                            value={formData.businessDescription}
                            onChange={(e) => setFormData(prev => ({ ...prev, businessDescription: e.target.value }))}
                            placeholder="Describe your business..."
                            rows={3}
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="businessImage">Business Image</Label>
                          <div className="mt-2">
                            <div className="flex items-center justify-center w-full">
                              <label
                                htmlFor="businessImage"
                                className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                              >
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                  <Upload className="w-8 h-8 mb-4 text-gray-500" />
                                  <p className="mb-2 text-sm text-gray-500">
                                    <span className="font-semibold">Click to upload</span> or drag and drop
                                  </p>
                                  <p className="text-xs text-gray-500">PNG, JPG or JPEG (MAX. 2MB)</p>
                                  {formData.businessImage && (
                                    <p className="text-xs text-blue-600 mt-2">
                                      {formData.businessImage.name}
                                    </p>
                                  )}
                                </div>
                                <input
                                  id="businessImage"
                                  type="file"
                                  className="hidden"
                                  accept="image/*"
                                  onChange={handleImageUpload}
                                />
                              </label>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="Enter your phone number"
                        required
                      />
                    </div>
                  </>
                )}

                <div>
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="pl-10"
                      placeholder="Enter your email"
                      required
                    />
                    <Mail className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      className="pl-10"
                      placeholder="Enter your password"
                      required
                    />
                    <Lock className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                {isSignup && (
                  <div>
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="pl-10"
                        placeholder="Confirm your password"
                        required
                      />
                      <Lock className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>
                )}

                {!isSignup && (
                  <div className="text-right">
                    <Link 
                      to="/forgot-password" 
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Forgot password?
                    </Link>
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