import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Layout from '@/components/Layout';
import SEO from '@/components/SEO';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  icon: ReactNode;
}

const AuthLayout = ({
  children,
  title,
  description,
  seoTitle,
  seoDescription,
  icon
}: AuthLayoutProps) => {
  return (
    <Layout>
      <SEO title={seoTitle} description={seoDescription} />
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
                {icon}
              </div>
              <CardTitle className="text-2xl">{title}</CardTitle>
              <p className="text-gray-600">{description}</p>
            </CardHeader>
            <CardContent>
              {children}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default AuthLayout;