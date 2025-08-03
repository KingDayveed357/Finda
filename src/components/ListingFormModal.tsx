import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, Plus, Sparkles, Package, Briefcase, Upload } from 'lucide-react';
import { mockAI } from '@/lib/mock-ai';
import { toast } from 'sonner';
import { productService, type CreateProductData } from '@/service/productService';
import { serviceService, type CreateServiceData } from '@/service/servicesService';
import { categoryService, type Category } from '@/service/categoryService';
import { locationService, type Country, type State, type City } from '@/service/LocationService';

interface ListingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
  isEdit?: boolean;
  onSuccess?: (listing: any) => void;
}

type ListingType = 'product' | 'service';

interface FormData {
  type: ListingType;
  category: string;
  country: string;
  state: string;
  city: string;
  address_details: string;
  featured_image: File | null;
  gallery_images: File[];
  tags: string;
  is_promoted: boolean;
  meta_title: string;
  meta_description: string;
  
  // Product specific fields
  product_name: string;
  product_description: string;
  product_price: string;
  original_price: string;
  is_negotiable: boolean;
  product_brand: string;
  product_model: string;
  product_condition: string;
  provider_phone: string;
  provider_email: string;
  provider_whatsapp: string;
  
  // Service specific fields
  service_name: string;
  service_description: string;
  provider_name: string;
  provider_title: string;
  provider_bio: string;
  provider_expertise: string;
  provider_experience: string;
  provider_certifications: string;
  provider_languages: string;
  provider_website: string;
  provider_linkedin: string;
  starting_price: string;
  max_price: string;
  price_type: string;
  response_time: string;
  availability: string;
  serves_remote: boolean;
  service_radius: string;
}

const ListingFormModal = ({ isOpen, onClose, initialData, isEdit = false, onSuccess }: ListingFormModalProps) => {
  const [listingType, setListingType] = useState<ListingType>(initialData?.type || 'product');
  const [formData, setFormData] = useState<FormData>({
    // Common fields
    type: 'product' as ListingType,
    category: '',
    country: '',
    state: '',
    city: '',
    address_details: '',
    featured_image: null as File | null,
    gallery_images: [] as File[],
    tags: '',
    is_promoted: false,
    meta_title: '',
    meta_description: '',
    
    // Product specific fields
    product_name: '',
    product_description: '',
    product_price: '',
    original_price: '',
    is_negotiable: false,
    product_brand: '',
    product_model: '',
    product_condition: 'new',
    provider_phone: '',
    provider_email: '',
    provider_whatsapp: '',
    
    // Service specific fields
    service_name: '',
    service_description: '',
    provider_name: '',
    provider_title: '',
    provider_bio: '',
    provider_expertise: '',
    provider_experience: '',
    provider_certifications: '',
    provider_languages: '',
    provider_website: '',
    provider_linkedin: '',
    starting_price: '',
    max_price: '',
    price_type: 'fixed',
    response_time: '',
    availability: '',
    serves_remote: false,
    service_radius: '',
    
    ...initialData
  });
  
  // Location and category data
  const [categories, setCategories] = useState<Category[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  
  // Loading states
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  
  const [newTag, setNewTag] = useState('');
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [isGeneratingTags, setIsGeneratingTags] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  // Load categories on mount and when listing type changes
  useEffect(() => {
    loadCountries();
  }, []);

  // Load categories when listing type changes
  useEffect(() => {
    loadCategories(listingType);
  }, [listingType]);

  // Load states when country changes
  useEffect(() => {
    if (formData.country) {
      loadStates(parseInt(formData.country));
      // Reset state and city when country changes
      setFormData(prev => ({ ...prev, state: '', city: '' }));
      setCities([]);
    } else {
      setStates([]);
      setCities([]);
    }
  }, [formData.country]);

  // Load cities when state changes
  useEffect(() => {
    if (formData.state) {
      loadCities(parseInt(formData.state));
      // Reset city when state changes
      setFormData(prev => ({ ...prev, city: '' }));
    } else {
      setCities([]);
    }
  }, [formData.state]);

  // FIXED: Accept listing type parameter to ensure we're loading the correct categories
  const loadCategories = async (type: ListingType) => {
    setLoadingCategories(true);
    try {
      const categoryType = type === 'product' ? 'product' : 'service';
      const fetchedCategories = await categoryService.getCategoriesByType(categoryType);
      setCategories(fetchedCategories);
    } catch (error) {
      console.error('Failed to load categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoadingCategories(false);
    }
  };

  const loadCountries = async () => {
    setLoadingCountries(true);
    try {
      const fetchedCountries = await locationService.getCountries();
      setCountries(fetchedCountries);
    } catch (error) {
      console.error('Failed to load countries:', error);
      toast.error('Failed to load countries');
    } finally {
      setLoadingCountries(false);
    }
  };

  const loadStates = async (countryId: number) => {
    setLoadingStates(true);
    try {
      const fetchedStates = await locationService.getStatesByCountry(countryId);
      setStates(fetchedStates);
    } catch (error) {
      console.error('Failed to load states:', error);
      toast.error('Failed to load states');
    } finally {
      setLoadingStates(false);
    }
  };

  const loadCities = async (stateId: number) => {
    setLoadingCities(true);
    try {
      const fetchedCities = await locationService.getCitiesByState(stateId);
      setCities(fetchedCities);
    } catch (error) {
      console.error('Failed to load cities:', error);
      toast.error('Failed to load cities');
    } finally {
      setLoadingCities(false);
    }
  };

  const handleGenerateDescription = async () => {
    const title = listingType === 'product' ? formData.product_name : formData.service_name;
    if (!title || !formData.category) return;
    
    setIsGeneratingDescription(true);
    try {
      const aiDescription = await mockAI.generateDescription(title, formData.category);
      const field = listingType === 'product' ? 'product_description' : 'service_description';
      setFormData(prev => ({ ...prev, [field]: aiDescription }));
    } catch (error) {
      console.error('Failed to generate description:', error);
      toast.error('Failed to generate description');
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const handleGenerateTags = async () => {
    const title = listingType === 'product' ? formData.product_name : formData.service_name;
    const description = listingType === 'product' ? formData.product_description : formData.service_description;
    if (!title || !description) return;
    
    setIsGeneratingTags(true);
    try {
      const aiTags = await mockAI.generateTags(title, description);
      const currentTags = formData.tags ? formData.tags.split(',').map(t => t.trim()) : [];
      const newTags = [...currentTags, ...aiTags];
      setFormData(prev => ({ ...prev, tags: newTags.join(', ') }));
    } catch (error) {
      console.error('Failed to generate tags:', error);
      toast.error('Failed to generate tags');
    } finally {
      setIsGeneratingTags(false);
    }
  };

  const addTag = () => {
    if (newTag) {
      const currentTags = formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(t => t) : [];
      if (!currentTags.includes(newTag)) {
        const newTags = [...currentTags, newTag];
        setFormData(prev => ({ ...prev, tags: newTags.join(', ') }));
        setNewTag('');
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(t => t) : [];
    const newTags = currentTags.filter(tag => tag !== tagToRemove);
    setFormData(prev => ({ ...prev, tags: newTags.join(', ') }));
  };

  const handleListingTypeChange = (type: string) => {
    const newType = type as ListingType;
    setListingType(newType);
    setFormData(prev => ({ ...prev, type: newType, category: '' }));
    // Clear existing categories immediately to prevent showing wrong categories
    setCategories([]);
    // The useEffect will trigger loadCategories with the new type
  };

   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'featured' | 'gallery') => {
    const files = e.target.files;
    if (!files) return;

    if (type === 'featured') {
      setFormData(prev => ({ ...prev, featured_image: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, gallery_images: Array.from(files) }));
    }
  };

  
  const validateForm = (): boolean => {
    const newErrors: Record<string, string[]> = {};

    // Common validations
    if (!formData.category) {
      newErrors.category = ['Category is required'];
    }
    if (!formData.country || isNaN(parseInt(formData.country))) {
      newErrors.country = ['Valid country ID is required'];
    }
    if (!formData.state || isNaN(parseInt(formData.state))) {
      newErrors.state = ['Valid state ID is required'];
    }
    if (!formData.city || isNaN(parseInt(formData.city))) {
      newErrors.city = ['Valid city ID is required'];
    }

    if (listingType === 'product') {
      if (!formData.product_name || formData.product_name.length < 3) {
        newErrors.product_name = ['Product name must be at least 3 characters long'];
      }
      if (!formData.product_description) {
        newErrors.product_description = ['Product description is required'];
      }
      if (!formData.product_price || parseFloat(formData.product_price) <= 0) {
        newErrors.product_price = ['Price must be greater than zero'];
      }
    } else {
      if (!formData.service_name || formData.service_name.length < 3) {
        newErrors.service_name = ['Service name must be at least 3 characters long'];
      }
      if (!formData.service_description) {
        newErrors.service_description = ['Service description is required'];
      }
      if (!formData.provider_name) {
        newErrors.provider_name = ['Provider name is required'];
      }
      if (!formData.provider_email) {
        newErrors.provider_email = ['Provider email is required'];
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the validation errors');
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    
    try {
      if (listingType === 'product') {
        const productData: CreateProductData = {
          product_name: formData.product_name,
          product_description: formData.product_description,
          product_price: parseFloat(formData.product_price),
          original_price: formData.original_price ? parseFloat(formData.original_price) : undefined,
          is_negotiable: formData.is_negotiable,
          country: parseInt(formData.country),
          state: parseInt(formData.state),
          city: parseInt(formData.city),
          address_details: formData.address_details || undefined,
          category: parseInt(formData.category),
          tags: formData.tags || undefined,
          product_brand: formData.product_brand || undefined,
          product_model: formData.product_model || undefined,
          product_condition: formData.product_condition || undefined,
          provider_phone: formData.provider_phone || undefined,
          provider_email: formData.provider_email || undefined,
          provider_whatsapp: formData.provider_whatsapp || undefined,
          featured_image: formData.featured_image || undefined,
          gallery_images: formData.gallery_images && formData.gallery_images.length > 0 ? formData.gallery_images : undefined,
          is_promoted: formData.is_promoted,
          meta_title: formData.meta_title || undefined,
          meta_description: formData.meta_description || undefined,
        };

        const result = await productService.createProduct(productData);
        toast.success('Product created successfully!');
        onSuccess?.(result);
      } else {
        const serviceData: CreateServiceData = {
          service_name: formData.service_name,
          service_description: formData.service_description,
          country: parseInt(formData.country),
          state: parseInt(formData.state),
          city: parseInt(formData.city),
          category: parseInt(formData.category),
          provider_name: formData.provider_name,
          provider_email: formData.provider_email,
          serves_remote: formData.serves_remote,
          service_radius: formData.service_radius ? parseInt(formData.service_radius) : undefined,
          tags: formData.tags || undefined,
          provider_title: formData.provider_title || undefined,
          provider_bio: formData.provider_bio || undefined,
          provider_expertise: formData.provider_expertise || undefined,
          provider_experience: formData.provider_experience || undefined,
          provider_certifications: formData.provider_certifications || undefined,
          provider_languages: formData.provider_languages || undefined,
          provider_phone: formData.provider_phone || undefined,
          provider_whatsapp: formData.provider_whatsapp || undefined,
          provider_website: formData.provider_website || undefined,
          provider_linkedin: formData.provider_linkedin || undefined,
          starting_price: formData.starting_price ? parseFloat(formData.starting_price) : undefined,
          max_price: formData.max_price ? parseFloat(formData.max_price) : undefined,
          price_type: formData.price_type || undefined,
          response_time: formData.response_time || undefined,
          availability: formData.availability || undefined,
          featured_image: formData.featured_image || undefined,
          gallery_images: formData.gallery_images.length > 0 ? formData.gallery_images : undefined,
          is_promoted: formData.is_promoted,
          meta_title: formData.meta_title || undefined,
          meta_description: formData.meta_description || undefined,
        };

        const result = await serviceService.createService(serviceData);
        toast.success('Service created successfully!');
        onSuccess?.(result);
      }
      
      onClose();
    } catch (error: any) {
      console.error('Failed to create listing:', error);
      
      // Handle validation errors from API
      if (error.response?.data && typeof error.response.data === 'object') {
        setErrors(error.response.data);
        toast.error('Please fix the validation errors');
      } else {
        toast.error('Failed to create listing. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTags = () => {
    return formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(t => t) : [];
  };

  const getFieldError = (fieldName: string): string | undefined => {
    return errors[fieldName]?.[0];
  };

  const hasFieldError = (fieldName: string): boolean => {
    return !!errors[fieldName];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            {isEdit ? 'Edit Listing' : 'Create New Listing'} (AI Enhanced)
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Listing Type Selection */}
          <Tabs value={listingType} onValueChange={handleListingTypeChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="product" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Product
              </TabsTrigger>
              <TabsTrigger value="service" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Service
              </TabsTrigger>
            </TabsList>

            <TabsContent value="product" className="space-y-6 mt-6">
              {/* Product Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="product_name">Product Name *</Label>
                  <Input
                    id="product_name"
                    value={formData.product_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, product_name: e.target.value }))}
                    placeholder="Enter product name"
                    className={hasFieldError('product_name') ? 'border-red-500' : ''}
                    required
                  />
                  {hasFieldError('product_name') && (
                    <p className="text-sm text-red-500">{getFieldError('product_name')}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                    disabled={loadingCategories}
                  >
                    <SelectTrigger className={hasFieldError('category') ? 'border-red-500' : ''}>
                      <SelectValue placeholder={loadingCategories ? "Loading categories..." : "Select category"} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.icon} {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {hasFieldError('category') && (
                    <p className="text-sm text-red-500">{getFieldError('category')}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="product_description">Description *</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateDescription}
                    disabled={!formData.product_name || !formData.category || isGeneratingDescription}
                    className="flex items-center gap-2"
                  >
                    <Sparkles className="h-4 w-4" />
                    {isGeneratingDescription ? 'Generating...' : 'AI Generate'}
                  </Button>
                </div>
                <Textarea
                  id="product_description"
                  value={formData.product_description}
                  onChange={(e) => setFormData(prev => ({ ...prev, product_description: e.target.value }))}
                  placeholder="Describe your product..."
                  rows={4}
                  className={hasFieldError('product_description') ? 'border-red-500' : ''}
                  required
                />
                {hasFieldError('product_description') && (
                  <p className="text-sm text-red-500">{getFieldError('product_description')}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="product_price">Price *</Label>
                  <Input
                    id="product_price"
                    type="number"
                    value={formData.product_price}
                    onChange={(e) => setFormData(prev => ({ ...prev, product_price: e.target.value }))}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className={hasFieldError('product_price') ? 'border-red-500' : ''}
                    required
                  />
                  {hasFieldError('product_price') && (
                    <p className="text-sm text-red-500">{getFieldError('product_price')}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="original_price">Original Price</Label>
                  <Input
                    id="original_price"
                    type="number"
                    value={formData.original_price}
                    onChange={(e) => setFormData(prev => ({ ...prev, original_price: e.target.value }))}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="product_condition">Condition</Label>
                  <Select value={formData.product_condition} onValueChange={(value) => setFormData(prev => ({ ...prev, product_condition: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="used">Used</SelectItem>
                      <SelectItem value="refurbished">Refurbished</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="product_brand">Brand</Label>
                  <Input
                    id="product_brand"
                    value={formData.product_brand}
                    onChange={(e) => setFormData(prev => ({ ...prev, product_brand: e.target.value }))}
                    placeholder="Brand name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="product_model">Model</Label>
                  <Input
                    id="product_model"
                    value={formData.product_model}
                    onChange={(e) => setFormData(prev => ({ ...prev, product_model: e.target.value }))}
                    placeholder="Model number/name"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_negotiable"
                  checked={formData.is_negotiable}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_negotiable: checked as boolean }))}
                />
                <Label htmlFor="is_negotiable">Price is negotiable</Label>
              </div>
            </TabsContent>

            <TabsContent value="service" className="space-y-6 mt-6">
              {/* Service Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="service_name">Service Name *</Label>
                  <Input
                    id="service_name"
                    value={formData.service_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, service_name: e.target.value }))}
                    placeholder="Enter service name"
                    className={hasFieldError('service_name') ? 'border-red-500' : ''}
                    required
                  />
                  {hasFieldError('service_name') && (
                    <p className="text-sm text-red-500">{getFieldError('service_name')}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                    disabled={loadingCategories}
                  >
                    <SelectTrigger className={hasFieldError('category') ? 'border-red-500' : ''}>
                      <SelectValue placeholder={loadingCategories ? "Loading categories..." : "Select category"} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.icon} {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {hasFieldError('category') && (
                    <p className="text-sm text-red-500">{getFieldError('category')}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="provider_name">Provider Name *</Label>
                <Input
                  id="provider_name"
                  value={formData.provider_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, provider_name: e.target.value }))}
                  placeholder="Your name or business name"
                  className={hasFieldError('provider_name') ? 'border-red-500' : ''}
                  required
                />
                {hasFieldError('provider_name') && (
                  <p className="text-sm text-red-500">{getFieldError('provider_name')}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="service_description">Description *</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateDescription}
                    disabled={!formData.service_name || !formData.category || isGeneratingDescription}
                    className="flex items-center gap-2"
                  >
                    <Sparkles className="h-4 w-4" />
                    {isGeneratingDescription ? 'Generating...' : 'AI Generate'}
                  </Button>
                </div>
                <Textarea
                  id="service_description"
                  value={formData.service_description}
                  onChange={(e) => setFormData(prev => ({ ...prev, service_description: e.target.value }))}
                  placeholder="Describe your service..."
                  rows={4}
                  className={hasFieldError('service_description') ? 'border-red-500' : ''}
                  required
                />
                {hasFieldError('service_description') && (
                  <p className="text-sm text-red-500">{getFieldError('service_description')}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="provider_title">Professional Title</Label>
                  <Input
                    id="provider_title"
                    value={formData.provider_title}
                    onChange={(e) => setFormData(prev => ({ ...prev, provider_title: e.target.value }))}
                    placeholder="e.g., Senior Developer, Marketing Expert"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="provider_experience">Experience</Label>
                  <Input
                    id="provider_experience"
                    value={formData.provider_experience}
                    onChange={(e) => setFormData(prev => ({ ...prev, provider_experience: e.target.value }))}
                    placeholder="e.g., 5 years"
                  />
                </div>
              </div>

                  <div className="space-y-2">
                <Label htmlFor="provider_bio">Expertise</Label>
                <Textarea
                  id="provider_bio"
                  value={formData.provider_expertise}
                  onChange={(e) => setFormData(prev => ({ ...prev, provider_expertise: e.target.value }))}
                  placeholder="Tell us about your expertise..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="provider_bio">Bio</Label>
                <Textarea
                  id="provider_bio"
                  value={formData.provider_bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, provider_bio: e.target.value }))}
                  placeholder="Tell us about yourself and your experience..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="starting_price">Starting Price</Label>
                  <Input
                    id="starting_price"
                    type="number"
                    value={formData.starting_price}
                    onChange={(e) => setFormData(prev => ({ ...prev, starting_price: e.target.value }))}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_price">Maximum Price</Label>
                  <Input
                    id="max_price"
                    type="number"
                    value={formData.max_price}
                    onChange={(e) => setFormData(prev => ({ ...prev, max_price: e.target.value }))}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="price_type">Price Type</Label>
                  <Select value={formData.price_type} onValueChange={(value) => setFormData(prev => ({ ...prev, price_type: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select price type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed</SelectItem>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="project">Per Project</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="response_time">Response Time</Label>
                  <Input
                    id="response_time"
                    value={formData.response_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, response_time: e.target.value }))}
                    placeholder="e.g., Within 24 hours"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="serves_remote"
                  checked={formData.serves_remote}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, serves_remote: checked as boolean }))}
                />
                <Label htmlFor="serves_remote">Can provide service remotely</Label>
              </div>

              {!formData.serves_remote && (
                <div className="space-y-2">
                  <Label htmlFor="service_radius">Service Radius (km)</Label>
                  <Input
                    id="service_radius"
                    type="number"
                    value={formData.service_radius}
                    onChange={(e) => setFormData(prev => ({ ...prev, service_radius: e.target.value }))}
                    placeholder="50"
                    min="0"
                  />
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Image Upload */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Images</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="featured_image">Featured Image</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <input
                    id="featured_image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'featured')}
                    className="hidden"
                  />
                  <label
                    htmlFor="featured_image"
                    className="cursor-pointer flex flex-col items-center justify-center"
                  >
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">
                      {formData.featured_image ? formData.featured_image.name : 'Click to upload featured image'}
                    </span>
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gallery_images">Gallery Images</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <input
                    id="gallery_images"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleFileChange(e, 'gallery')}
                    className="hidden"
                  />
                  <label
                    htmlFor="gallery_images"
                    className="cursor-pointer flex flex-col items-center justify-center"
                  >
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">
                      {formData.gallery_images.length > 0 
                        ? `${formData.gallery_images.length} images selected` 
                        : 'Click to upload gallery images'}
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Location Fields (Common for both) */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Location *</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <Select 
                  value={formData.country} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, country: value }))}
                  disabled={loadingCountries}
                >
                  <SelectTrigger className={hasFieldError('country') ? 'border-red-500' : ''}>
                    <SelectValue placeholder={loadingCountries ? "Loading countries..." : "Select country"} />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.id} value={country.id.toString()}>
                        {country.display_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {hasFieldError('country') && (
                  <p className="text-sm text-red-500">{getFieldError('country')}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Select 
                  value={formData.state} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, state: value }))}
                  disabled={!formData.country || loadingStates}
                >
                  <SelectTrigger className={hasFieldError('state') ? 'border-red-500' : ''}>
                    <SelectValue placeholder={
                      !formData.country ? "Select country first" :
                      loadingStates ? "Loading states..." : 
                      "Select state"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map((state) => (
                      <SelectItem key={state.id} value={state.id.toString()}>
                        {state.display_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {hasFieldError('state') && (
                  <p className="text-sm text-red-500">{getFieldError('state')}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Select 
                  value={formData.city} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, city: value }))}
                  disabled={!formData.state || loadingCities}
                >
                  <SelectTrigger className={hasFieldError('city') ? 'border-red-500' : ''}>
                    <SelectValue placeholder={
                      !formData.state ? "Select state first" :
                      loadingCities ? "Loading cities..." : 
                      "Select city"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city.id} value={city.id.toString()}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {hasFieldError('city') && (
                  <p className="text-sm text-red-500">{getFieldError('city')}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address_details">Address Details</Label>
              <Input
                id="address_details"
                value={formData.address_details}
                onChange={(e) => setFormData(prev => ({ ...prev, address_details: e.target.value }))}
                placeholder="Specific address or landmark"
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="provider_email">Email *</Label>
                <Input
                  id="provider_email"
                  type="email"
                  value={formData.provider_email}
                  onChange={(e) => setFormData(prev => ({ ...prev, provider_email: e.target.value }))}
                  placeholder="your@email.com"
                  className={hasFieldError('provider_email') ? 'border-red-500' : ''}
                  required
                />
                {hasFieldError('provider_email') && (
                  <p className="text-sm text-red-500">{getFieldError('provider_email')}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="provider_phone">Phone</Label>
                <Input
                  id="provider_phone"
                  value={formData.provider_phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, provider_phone: e.target.value }))}
                  placeholder="+1234567890"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="provider_whatsapp">WhatsApp</Label>
                <Input
                  id="provider_whatsapp"
                  value={formData.provider_whatsapp}
                  onChange={(e) => setFormData(prev => ({ ...prev, provider_whatsapp: e.target.value }))}
                  placeholder="+1234567890"
                />
              </div>

              {listingType === 'service' && (
                <div className="space-y-2">
                  <Label htmlFor="provider_website">Website</Label>
                  <Input
                    id="provider_website"
                    type="url"
                    value={formData.provider_website}
                    onChange={(e) => setFormData(prev => ({ ...prev, provider_website: e.target.value }))}
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Tags</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGenerateTags}
                disabled={
                  !(listingType === 'product' ? formData.product_name : formData.service_name) ||
                  !(listingType === 'product' ? formData.product_description : formData.service_description) ||
                  isGeneratingTags
                }
                className="flex items-center gap-2"
              >
                <Sparkles className="h-4 w-4" />
                {isGeneratingTags ? 'Generating...' : 'AI Suggest Tags'}
              </Button>
            </div>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {getTags().length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {getTags().map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Advanced Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Advanced Options</h3>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_promoted"
                checked={formData.is_promoted}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_promoted: checked as boolean }))}
              />
              <Label htmlFor="is_promoted">Promote this listing (additional fees may apply)</Label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="meta_title">SEO Title</Label>
                <Input
                  id="meta_title"
                  value={formData.meta_title}
                  onChange={(e) => setFormData(prev => ({ ...prev, meta_title: e.target.value }))}
                  placeholder="SEO optimized title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="meta_description">SEO Description</Label>
                <Input
                  id="meta_description"
                  value={formData.meta_description}
                  onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
                  placeholder="SEO optimized description"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : (isEdit ? 'Update Listing' : 'Create Listing')}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ListingFormModal;


