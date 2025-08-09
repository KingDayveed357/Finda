import  { useEffect, useState } from 'react';
import { ArrowRight, Search, Zap, Shield, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import Layout from '@/components/Layout';
// import { mockCategories } from '@/lib/mock-ai';
import FeaturedListings from '@/components/FeaturedListings';
import { categoryService} from '@/service/categoryService';
import type { Category } from '@/service/categoryService';

const Landing = () => {
  const [categories, setCategories] = useState<Category[]>([]); 

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Fetch all categories since none are marked as featured yet
        const data = await categoryService.getCategories();
        setCategories(data.slice(0, 8)); // Limit to 8 categories for better UI
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    };

    fetchCategories();
  }, []);
  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-purple-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Discover Anything with 
            <span className="block text-yellow-300">AI-Powered Search</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Find the perfect products and services with intelligent recommendations. 
            Connect with trusted vendors worldwide.
          </p>
     {/* <div className="max-w-2xl mx-auto mb-8">
  <div className="relative">
    <Input
      type="text"
      placeholder="Search for products or services..."
      className="w-full pl-6 pr-28 md:pr-40 py-4 text-lg text-white placeholder:text-gray-300 bg-white/10 border border-white/20 backdrop-blur-md rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
    />
   <Button 
  className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white hover:bg-gray-300 rounded-full text-black font-semibold px-6 py-2 transition-all duration-200 flex items-center"
>
  <Search className="h-5 w-5 mr-0 sm:mr-2" />
  <span className="hidden sm:inline">Search</span>
</Button>

  </div>
</div> */}

          <Button size="lg" variant="secondary" asChild>
            <Link to="/listings">
              Browse All Listings
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

            {/* Featured Listings */}
      <FeaturedListings />

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How Finda Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our AI-powered platform makes finding and connecting with vendors effortless
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Search & Discover</h3>
                <p className="text-gray-600">
                  Use our intelligent search to find exactly what you need, powered by AI recommendations
                </p>
              </CardContent>
            </Card>
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Connect with Vendors</h3>
                <p className="text-gray-600">
                  Browse verified vendor profiles and connect directly with trusted sellers
                </p>
              </CardContent>
            </Card>
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Secure Transactions</h3>
                <p className="text-gray-600">
                  Enjoy peace of mind with our secure payment system and buyer protection
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Browse by Category
            </h2>
            <p className="text-xl text-gray-600">
              Explore thousands of products and services across all categories
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/listings?category=${category.id}`}
                className="group"
              >
                <Card className="h-32 hover:shadow-lg transition-all duration-200 hover:-translate-y-1 bg-white group-hover:bg-blue-50">
                  <CardContent className="flex flex-col items-center justify-center h-full text-center p-4">
                    <div className="text-3xl mb-2">{category.icon}</div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                    {(category.products_count !== undefined || category.services_count !== undefined) && (
  (() => {
    const productCount = category.products_count ?? 0;
    const serviceCount = category.services_count ?? 0;

    if (category.category_type === 'both') {
      return `(${productCount + serviceCount})`;
    }

    return `${ productCount || serviceCount }`; // show whichever is relevant
  })()
)}
  listings
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* AI Assistant Teaser */}
      <section className="py-16 bg-gradient-to-r from-purple-900 to-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <Zap className="h-16 w-16 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Meet Your AI Shopping Assistant
            </h2>
            <p className="text-xl mb-8">
              Get personalized recommendations, compare products intelligently, 
              and discover exactly what you're looking for with our advanced AI technology.
            </p>
            <Button size="lg" variant="secondary">
              Try AI Recommendations
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Ready to Start Selling?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of successful vendors on Finda. List your products and services 
            and reach customers worldwide.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/auth/vendor-signup">
                Start Selling
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/auth/signup">
                Sign Up as Buyer
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Landing;