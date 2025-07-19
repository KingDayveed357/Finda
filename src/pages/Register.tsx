import { useSearchParams } from 'react-router-dom';
import { User, Building } from 'lucide-react';
import AuthLayout from '@/components/auth/AuthLayout';
import RegisterForm from '@/components/auth/RegisterForm';
import type { UserType } from '@/types/auth';

const Register = () => {
  const [searchParams] = useSearchParams();
  const userType = (searchParams.get('userType') || 'customer') as UserType;
  const isVendor = userType === 'vendor';

  const getPageTitle = () => {
    return isVendor ? "Vendor Registration - Join Finda" : "Create Account - Join Finda";
  };

  const getPageDescription = () => {
    return isVendor 
      ? "Join Finda as a vendor and start selling your products with AI-powered tools and analytics."
      : "Create your Finda account to discover amazing products with AI recommendations.";
  };

  return (
    <AuthLayout
      title="Create Account"
      description={`Sign up as a ${isVendor ? 'vendor' : 'customer'} to get started`}
      seoTitle={getPageTitle()}
      seoDescription={getPageDescription()}
      icon={isVendor ? <Building className="h-6 w-6 text-white" /> : <User className="h-6 w-6 text-white" />}
    >
      <RegisterForm />
    </AuthLayout>
  );
};

export default Register;