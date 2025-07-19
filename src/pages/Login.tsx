import { User } from 'lucide-react';
import AuthLayout from '@/components/auth/AuthLayout';
import LoginForm from '@/components/auth/LoginForm';

const Login = () => {
  return (
    <AuthLayout
      title="Welcome Back"
      description="Sign in to your account"
      seoTitle="Login to Finda - AI Marketplace"
      seoDescription="Login to your Finda account to access personalized AI recommendations and your marketplace."
      icon={<User className="h-6 w-6 text-white" />}
    >
      <LoginForm />
    </AuthLayout>
  );
};

export default Login;
