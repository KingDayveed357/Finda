import { useState } from 'react';
import { ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { mockCategories, locations } from '@/lib/mock-ai';

interface FiltersState {
  categories: string[];
  locations: string[];
  priceRange: [number, number];
  rating: number;
  isService: boolean | null;
}

interface FiltersSidebarProps {
  filters: FiltersState;
  onFiltersChange: (filters: FiltersState) => void;
}

const FiltersSidebar: React.FC<FiltersSidebarProps> = ({ filters, onFiltersChange }) => {
  const [openSections, setOpenSections] = useState({
    categories: true,
    location: true,
    price: true,
    rating: true,
    type: true
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    const newCategories = checked
      ? [...filters.categories, categoryId]
      : filters.categories.filter(id => id !== categoryId);
    
    onFiltersChange({ ...filters, categories: newCategories });
  };

  const handleLocationChange = (location: string, checked: boolean) => {
    const newLocations = checked
      ? [...filters.locations, location]
      : filters.locations.filter(loc => loc !== location);
    
    onFiltersChange({ ...filters, locations: newLocations });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      categories: [],
      locations: [],
      priceRange: [0, 2000],
      rating: 0,
      isService: null
    });
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </div>
          <Button variant="ghost" size="sm" onClick={clearAllFilters}>
            Clear All
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Categories */}
        <Collapsible open={openSections.categories} onOpenChange={() => toggleSection('categories')}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded">
            <span className="font-medium">Categories</span>
            {openSections.categories ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 mt-2">
            {mockCategories.map((category) => (
              <div key={category.id} className="flex items-center space-x-2">
                <Checkbox
                  id={category.id}
                  checked={filters.categories.includes(category.id)}
                  onCheckedChange={(checked) => handleCategoryChange(category.id, checked as boolean)}
                />
                <label htmlFor={category.id} className="text-sm flex-1 cursor-pointer">
                  <span>{category.icon}</span> {category.name}
                  <span className="text-gray-500 ml-1">({category.count})</span>
                </label>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>

        {/* Location */}
        <Collapsible open={openSections.location} onOpenChange={() => toggleSection('location')}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded">
            <span className="font-medium">Location</span>
            {openSections.location ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 mt-2 max-h-48 overflow-y-auto">
            {locations.map((location) => (
              <div key={location} className="flex items-center space-x-2">
                <Checkbox
                  id={location}
                  checked={filters.locations.includes(location)}
                  onCheckedChange={(checked) => handleLocationChange(location, checked as boolean)}
                />
                <label htmlFor={location} className="text-sm flex-1 cursor-pointer">
                  {location}
                </label>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>

        {/* Price Range */}
        <Collapsible open={openSections.price} onOpenChange={() => toggleSection('price')}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded">
            <span className="font-medium">Price Range</span>
            {openSections.price ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4 space-y-4">
            <Slider
              value={filters.priceRange}
              onValueChange={(value) => onFiltersChange({ ...filters, priceRange: value as [number, number] })}
              max={2000}
              step={50}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>${filters.priceRange[0]}</span>
              <span>${filters.priceRange[1]}</span>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Rating */}
        <Collapsible open={openSections.rating} onOpenChange={() => toggleSection('rating')}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded">
            <span className="font-medium">Minimum Rating</span>
            {openSections.rating ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 mt-2">
            {[4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center space-x-2">
                <Checkbox
                  id={`rating-${rating}`}
                  checked={filters.rating === rating}
                  onCheckedChange={(checked) => 
                    onFiltersChange({ ...filters, rating: checked ? rating : 0 })
                  }
                />
                <label htmlFor={`rating-${rating}`} className="text-sm cursor-pointer">
                  {rating}+ stars
                </label>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>

        {/* Type */}
        <Collapsible open={openSections.type} onOpenChange={() => toggleSection('type')}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded">
            <span className="font-medium">Type</span>
            {openSections.type ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 mt-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="products"
                checked={filters.isService === false}
                onCheckedChange={(checked) => 
                  onFiltersChange({ ...filters, isService: checked ? false : null })
                }
              />
              <label htmlFor="products" className="text-sm cursor-pointer">
                Products Only
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="services"
                checked={filters.isService === true}
                onCheckedChange={(checked) => 
                  onFiltersChange({ ...filters, isService: checked ? true : null })
                }
              />
              <label htmlFor="services" className="text-sm cursor-pointer">
                Services Only
              </label>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};

export default FiltersSidebar;