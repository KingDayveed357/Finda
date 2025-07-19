import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Mail, Lock, User, Upload, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import type { AuthFormData, UserType } from '@/types/auth';

const RegisterForm = () => {
  const [searchParams] = useSearchParams();
  const userType = (searchParams.get('userType') || 'customer') as UserType;
  
  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    firstName: '',
    lastName: '',
    businessName: '',
    businessDescription: '',
    businessImage: null,
    phone: ''
  });

  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const { register, isLoading } = useAuth();

  const isVendor = userType === 'vendor';

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

  const validateForm = (): boolean => {
    // Check for empty fields
    if (!formData.username.trim()) {
      toast.error("Username required", {
        description: "Please enter a username.",
      });
      return false;
    }

    // Username validation
    if (formData.username.length < 3) {
      toast.error("Username too short", {
        description: "Username must be at least 3 characters long.",
      });
      return false;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      toast.error("Invalid username", {
        description: "Username can only contain letters, numbers, and underscores.",
      });
      return false;
    }

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast.error("Name required", {
        description: "Please enter your first and last name.",
      });
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Invalid email", {
        description: "Please enter a valid email address.",
      });
      return false;
    }

    // Password validation
    if (formData.password.length < 8) {
      toast.error("Password too short", {
        description: "Password must be at least 8 characters long.",
      });
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords don't match", {
        description: "Please make sure both passwords are identical.",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    await register(formData, userType);
  };

  return (
    <>
      <Tabs value={userType} className="mb-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="customer" asChild>
            <Link to="/auth/signup?userType=customer">Customer</Link>
          </TabsTrigger>
          <TabsTrigger value="vendor" asChild>
            <Link to="/auth/signup?userType=vendor">Vendor</Link>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Customer Fields */}
        <div>
          <Label htmlFor="username">Username</Label>
          <div className="relative">
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              className="pl-10"
              placeholder="Enter your username"
              required
            />
            <User className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
              placeholder="Enter your first name"
              required
            />
          </div>
          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
              placeholder="Enter your last name"
              required
            />
          </div>
        </div>

          <div className="grid grid-cols-2 gap-4">
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
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Enter your phone number"
                
              />
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
              minLength={8}
            />
            <Lock className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>

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
              minLength={8}
            />
            <Lock className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Vendor Fields (kept for future use but not functional) */}
        {isVendor && (
          <>
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                <strong>Note:</strong> Vendor registration is not available yet. This feature is coming soon.
              </p>
            </div>
            
            <div>
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                value={formData.businessName}
                onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                placeholder="Enter your business name"
                disabled
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
                disabled
              />
            </div>

            <div>
              <Label htmlFor="businessImage">Business Image</Label>
              <div className="mt-2">
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="businessImage"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 opacity-50"
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
                      disabled
                    />
                  </label>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Enter your phone number"
                disabled
              />
            </div>
          </>
        )}

        <Button type="submit" className="w-full" disabled={isLoading || isVendor}>
          {isLoading ? 'Creating Account...' : isVendor ? 'Coming Soon' : 'Create Account'}
        </Button>
      </form>

      <div className="mt-6">
        <Separator className="my-4" />
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?
            <Link 
              to="/auth/login" 
              className="ml-1 text-blue-600 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default RegisterForm;