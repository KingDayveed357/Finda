//components/ListingDetail/ErrorDisplay
import React from 'react';
import { Link } from 'react-router-dom';
import { WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import { ErrorType, type ErrorState } from '@/types/listing';

interface ErrorDisplayProps {
  error: ErrorState;
  onRetry: () => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onRetry }) => {
  const getErrorIcon = () => {
    switch (error.type) {
      case ErrorType.NETWORK:
        return <WifiOff className="h-12 w-12 text-gray-400 mb-4" />;
      default:
        return <div className="h-12 w-12 bg-gray-200 rounded-full mb-4"></div>;
    }
  };

  const getErrorTitle = () => {
    switch (error.type) {
      case ErrorType.NETWORK:
        return 'Connection Problem';
      case ErrorType.NOT_FOUND:
        return 'Listing Not Found';
      default:
        return 'Something Went Wrong';
    }
  };

  const getErrorDescription = () => {
    switch (error.type) {
      case ErrorType.NETWORK:
        return 'Please check your internet connection and try again.';
      case ErrorType.NOT_FOUND:
        return 'The listing you are looking for does not exist or has been removed.';
      default:
        return error.message || 'An unexpected error occurred.';
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          {getErrorIcon()}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {getErrorTitle()}
          </h1>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {getErrorDescription()}
          </p>
          <div className="flex justify-center space-x-4">
            <Button onClick={onRetry} className="flex items-center">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Link to="/listings">
              <Button variant="outline">Back to Listings</Button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};
