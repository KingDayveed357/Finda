// import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Layout from '@/components/Layout';

export const SkeletonLoader = () => (
  <Layout>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button Skeleton */}
      <div className="h-10 w-32 bg-gray-200 rounded mb-6 animate-pulse"></div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Skeleton */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Gallery Skeleton */}
          <Card>
            <CardContent className="p-0">
              <div className="w-full h-96 bg-gray-200 rounded-t-lg animate-pulse"></div>
              <div className="flex space-x-2 p-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-16 h-16 bg-gray-200 rounded-lg animate-pulse"></div>
                ))}
              </div>
            </CardContent>
          </Card>
            {/* Title and Price Skeleton */}
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse"></div>
            <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
            <div className="flex space-x-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </div>

          {/* Description Skeleton */}
          <Card>
            <CardContent className="p-6">
              <div className="h-6 bg-gray-200 rounded w-32 animate-pulse mb-4"></div>
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Skeleton */}
        <div className="space-y-6">
          {/* Vendor Info Skeleton */}
          <Card>
            <CardContent className="p-6">
              <div className="h-6 bg-gray-200 rounded w-40 animate-pulse mb-4"></div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Actions Skeleton */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  </Layout>
);
