import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Product } from '@/types/listing';

interface ProductDetailsProps {
  product: Product;
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({ product }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {product.product_brand && (
            <div>
              <h4 className="font-semibold text-gray-900">Brand</h4>
              <p className="text-gray-600">{product.product_brand}</p>
            </div>
          )}
          
          {product.product_category && (
            <div>
              <h4 className="font-semibold text-gray-900">Category</h4>
              <p className="text-gray-600">{product.product_category}</p>
            </div>
          )}
          
          {product.product_status && (
            <div>
              <h4 className="font-semibold text-gray-900">Status</h4>
              <Badge variant="outline" className="capitalize">
                {product.product_status}
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
