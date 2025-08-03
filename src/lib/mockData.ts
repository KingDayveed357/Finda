export interface Listing {
  id: string;
  title: string;
  thumbnail: string;
  views: number;
  sales: number;
  price: number;
  status: 'active' | 'paused' | 'draft';
  category: string;
  createdAt: string;
}

export interface DashboardStats {
  totalListings: number;
  totalViews: number;
  totalSales: number;
  revenue: number;
}

export const mockStats: DashboardStats = {
  totalListings: 24,
  totalViews: 15420,
  totalSales: 342,
  revenue: 28650
};

export const mockListings: Listing[] = [
  {
    id: '1',
    title: 'Professional Photography Services',
    thumbnail: '/placeholder.svg',
    views: 1234,
    sales: 45,
    price: 299,
    status: 'active',
    category: 'Services',
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    title: 'Custom Web Development Package',
    thumbnail: '/placeholder.svg',
    views: 892,
    sales: 23,
    price: 1299,
    status: 'active',
    category: 'Digital',
    createdAt: '2024-01-12'
  },
  {
    id: '3',
    title: 'Logo Design Bundle',
    thumbnail: '/placeholder.svg',
    views: 567,
    sales: 67,
    price: 199,
    status: 'paused',
    category: 'Design',
    createdAt: '2024-01-10'
  },
  {
    id: '4',
    title: 'Social Media Marketing Course',
    thumbnail: '/placeholder.svg',
    views: 1890,
    sales: 156,
    price: 99,
    status: 'active',
    category: 'Education',
    createdAt: '2024-01-08'
  },
  {
    id: '5',
    title: 'E-commerce Consultation',
    thumbnail: '/placeholder.svg',
    views: 345,
    sales: 12,
    price: 499,
    status: 'draft',
    category: 'Consulting',
    createdAt: '2024-01-05'
  }
];