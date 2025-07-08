export interface AIResponse {
  description: string;
  recommendations: string[];
  tags: string[];
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number | { min: number; max: number };
  category: string;
  location: string;
  vendor: {
    id: string;
    name: string;
    rating: number;
    image: string;
  };
  images: string[];
  rating: number;
  isService: boolean;
  tags: string[];
}
