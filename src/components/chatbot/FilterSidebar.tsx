import { useState } from "react";
import { X, ChevronDown, ChevronRight, Filter, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    priceRange: [number, number];
    vendors: string[];
    deliveryTime: string[];
    countries: string[];
    minRating: number;
    brands: string[];
  };
  onFiltersChange: (filters: any) => void;
}

export const FilterSidebar = ({ isOpen, onClose, filters, onFiltersChange }: FilterSidebarProps) => {
  const [expandedSections, setExpandedSections] = useState({
    price: true,
    vendors: true,
    delivery: false,
    location: false,
    rating: false,
    brands: false
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev]
    }));
  };

  const resetFilters = () => {
    onFiltersChange({
      priceRange: [0, 1000],
      vendors: [],
      deliveryTime: [],
      countries: [],
      minRating: 0,
      brands: []
    });
  };

  const vendorOptions = [
    { id: 'amazon', label: 'Amazon', count: 245 },
    { id: 'jumia', label: 'Jumia', count: 189 },
    { id: 'ebay', label: 'eBay', count: 156 },
    { id: 'finda', label: 'Finda Vendors', count: 324 },
    { id: 'upwork', label: 'Upwork', count: 78 }
  ];

  const deliveryOptions = [
    { id: 'same-day', label: 'Same Day', count: 45 },
    { id: 'next-day', label: 'Next Day', count: 234 },
    { id: '2-3-days', label: '2-3 Days', count: 567 },
    { id: '1-week', label: '1 Week', count: 123 }
  ];

  const countryOptions = [
    { id: 'nigeria', label: '🇳🇬 Nigeria', count: 456 },
    { id: 'usa', label: '🇺🇸 United States', count: 789 },
    { id: 'china', label: '🇨🇳 China', count: 234 },
    { id: 'uk', label: '🇬🇧 United Kingdom', count: 167 }
  ];

  const brandOptions = [
    'Apple', 'Samsung', 'Sony', 'Nike', 'Adidas', 'Canon', 'HP', 'Dell'
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:relative lg:inset-auto">
      {/* Backdrop for mobile */}
      <div 
        className="absolute inset-0 bg-black/50 lg:hidden" 
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="absolute right-0 top-0 h-full w-80 bg-background border-l shadow-lg lg:relative lg:w-full lg:shadow-none">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Refine Results</h3>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Price Range */}
          <Collapsible open={expandedSections.price} onOpenChange={() => toggleSection('price')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted rounded">
              <span className="font-medium">Price Range</span>
              {expandedSections.price ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 pt-4">
              <div className="px-2">
                <Slider
                  value={filters.priceRange}
                  onValueChange={(value) => onFiltersChange({ ...filters, priceRange: value })}
                  max={1000}
                  step={10}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground mt-2">
                  <span>${filters.priceRange[0]}</span>
                  <span>${filters.priceRange[1]}</span>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Vendors */}
          <Collapsible open={expandedSections.vendors} onOpenChange={() => toggleSection('vendors')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted rounded">
              <span className="font-medium">Marketplace</span>
              {expandedSections.vendors ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 pt-4">
              {vendorOptions.map((vendor) => (
                <div key={vendor.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={vendor.id}
                      checked={filters.vendors.includes(vendor.id)}
                      onCheckedChange={(checked) => {
                        const newVendors = checked
                          ? [...filters.vendors, vendor.id]
                          : filters.vendors.filter(v => v !== vendor.id);
                        onFiltersChange({ ...filters, vendors: newVendors });
                      }}
                    />
                    <label htmlFor={vendor.id} className="text-sm cursor-pointer">
                      {vendor.label}
                    </label>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {vendor.count}
                  </Badge>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Delivery Time */}
          <Collapsible open={expandedSections.delivery} onOpenChange={() => toggleSection('delivery')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted rounded">
              <span className="font-medium">Delivery Time</span>
              {expandedSections.delivery ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 pt-4">
              {deliveryOptions.map((option) => (
                <div key={option.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={option.id}
                      checked={filters.deliveryTime.includes(option.id)}
                      onCheckedChange={(checked) => {
                        const newDelivery = checked
                          ? [...filters.deliveryTime, option.id]
                          : filters.deliveryTime.filter(d => d !== option.id);
                        onFiltersChange({ ...filters, deliveryTime: newDelivery });
                      }}
                    />
                    <label htmlFor={option.id} className="text-sm cursor-pointer">
                      {option.label}
                    </label>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {option.count}
                  </Badge>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Country/Region */}
          <Collapsible open={expandedSections.location} onOpenChange={() => toggleSection('location')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted rounded">
              <span className="font-medium">Ship From</span>
              {expandedSections.location ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 pt-4">
              {countryOptions.map((country) => (
                <div key={country.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={country.id}
                      checked={filters.countries.includes(country.id)}
                      onCheckedChange={(checked) => {
                        const newCountries = checked
                          ? [...filters.countries, country.id]
                          : filters.countries.filter(c => c !== country.id);
                        onFiltersChange({ ...filters, countries: newCountries });
                      }}
                    />
                    <label htmlFor={country.id} className="text-sm cursor-pointer">
                      {country.label}
                    </label>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {country.count}
                  </Badge>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Rating */}
          <Collapsible open={expandedSections.rating} onOpenChange={() => toggleSection('rating')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted rounded">
              <span className="font-medium">Minimum Rating</span>
              {expandedSections.rating ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 pt-4">
              <div className="px-2">
                <Slider
                  value={[filters.minRating]}
                  onValueChange={(value) => onFiltersChange({ ...filters, minRating: value[0] })}
                  max={5}
                  step={0.5}
                  className="w-full"
                />
                <div className="text-center text-sm text-muted-foreground mt-2">
                  {filters.minRating}+ stars
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Brands */}
          <Collapsible open={expandedSections.brands} onOpenChange={() => toggleSection('brands')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted rounded">
              <span className="font-medium">Brand</span>
              {expandedSections.brands ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 pt-4">
              <Select
                value={filters.brands[0] || ''}
                onValueChange={(value) => {
                  onFiltersChange({ 
                    ...filters, 
                    brands: value ? [value] : [] 
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select brand..." />
                </SelectTrigger>
                <SelectContent>
                  {brandOptions.map((brand) => (
                    <SelectItem key={brand} value={brand}>
                      {brand}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Apply Button */}
        <div className="p-4 border-t">
          <Button className="w-full" onClick={onClose}>
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
};