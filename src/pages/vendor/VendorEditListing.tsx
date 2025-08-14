// import { useParams, useNavigate } from "react-router-dom";
// import { useState, useEffect } from "react";
// import VendorLayout from "@/components/vendor/VendorLayout";
// import ComingSoon from "@/components/ComingSoon";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Label } from "@/components/ui/label";
// import { Badge } from "@/components/ui/badge";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Switch } from "@/components/ui/switch";
// import { ArrowLeft, Save, Eye, Trash2, Star, Upload, X } from "lucide-react";
// import { toast } from "sonner";
// import { 
//   listingService, 
//   type UnifiedListing 
// } from "@/service/listingService";

// interface EditFormData {
//   title: string;
//   description: string;
//   price: string;
//   category: string;
//   location: string;
//   tags: string[];
//   condition?: string;
//   isNegotiable?: boolean;
//   isPromoted?: boolean;
//   isFeatured?: boolean;
//   deliveryTime?: string;
//   providerName?: string;
//   providerPhone?: string;
//   providerEmail?: string;
//   servesRemote?: boolean;
//   responseTime?: string;
//   availability?: string;
// }

// const VendorEditListing = () => {
//   const { id } = useParams<{ id: string }>();
//   const navigate = useNavigate();
//   const [listing, setListing] = useState<UnifiedListing | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [formData, setFormData] = useState<EditFormData>({
//     title: '',
//     description: '',
//     price: '',
//     category: '',
//     location: '',
//     tags: [],
//     condition: 'new',
//     isNegotiable: false,
//     isPromoted: false,
//     isFeatured: false,
//     deliveryTime: '',
//     providerName: '',
//     providerPhone: '',
//     providerEmail: '',
//     servesRemote: false,
//     responseTime: '',
//     availability: ''
//   });
//   const [newTag, setNewTag] = useState('');
//   const [selectedImages, setSelectedImages] = useState<File[]>([]);
//   const [featuredImage, setFeaturedImage] = useState<File | null>(null);

//   // Load listing data
//   useEffect(() => {
//     const loadListing = async () => {
//       if (!id) {
//         navigate('/vendor/listings');
//         return;
//       }

//       try {
//         setLoading(true);
//         const listingData = await listingService.getListing(id);
        
//         if (!listingData) {
//           toast.error('Listing not found');
//           navigate('/vendor/listings');
//           return;
//         }

//         setListing(listingData);
        
//         // Populate form data
//         const originalData = listingData.originalData;
//         setFormData({
//           title: listingData.title,
//           description: listingData.description,
//           price: typeof listingData.price === 'number' 
//             ? listingData.price.toString() 
//             : listingData.price ? `${listingData.price.min}-${listingData.price.max}` : '',
//           category: listingData.category,
//           location: listingData.location,
//           tags: listingData.tags,
//           condition: 'product_condition' in originalData ? originalData.product_condition : 'new',
//           isNegotiable: 'is_negotiable' in originalData ? originalData.is_negotiable : false,
//           isPromoted: listingData.isPromoted,
//           isFeatured: listingData.isFeatured,
//           deliveryTime: '',
//           providerName: listingData.providerName,
//           providerPhone: listingData.providerPhone,
//           providerEmail: 'provider_email' in originalData ? originalData.provider_email : '',
//           servesRemote: 'serves_remote' in originalData ? originalData.serves_remote : false,
//           responseTime: 'response_time' in originalData ? originalData.response_time : '',
//           availability: 'availability' in originalData ? originalData.availability : ''
//         });
//       } catch (error) {
//         console.error('Error loading listing:', error);
//         toast.error('Failed to load listing');
//         navigate('/vendor/listings');
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadListing();
//   }, [id, navigate]);

//   const handleInputChange = (field: keyof EditFormData, value: any) => {
//     setFormData(prev => ({ ...prev, [field]: value }));
//   };

//   const handleAddTag = () => {
//     if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
//       setFormData(prev => ({
//         ...prev,
//         tags: [...prev.tags, newTag.trim()]
//       }));
//       setNewTag('');
//     }
//   };

//   const handleRemoveTag = (tagToRemove: string) => {
//     setFormData(prev => ({
//       ...prev,
//       tags: prev.tags.filter(tag => tag !== tagToRemove)
//     }));
//   };

//   const handleImageUpload = (files: FileList | null, type: 'featured' | 'gallery') => {
//     if (!files) return;

//     if (type === 'featured' && files[0]) {
//       setFeaturedImage(files[0]);
//     } else if (type === 'gallery') {
//       setSelectedImages(Array.from(files));
//     }
//   };

//   const handleSave = async () => {
//     if (!listing || !id) return;

//     try {
//       setSaving(true);

//       // Prepare update data based on listing type
//       const updateData: any = {};
      
//       if (listing.isService) {
//         // Service-specific fields
//         updateData.service_name = formData.title;
//         updateData.service_description = formData.description;
//         updateData.provider_name = formData.providerName;
//         updateData.provider_phone = formData.providerPhone;
//         updateData.provider_email = formData.providerEmail;
//         updateData.serves_remote = formData.servesRemote;
//         updateData.response_time = formData.responseTime;
//         updateData.availability = formData.availability;
//         updateData.tags = formData.tags.join(', ');
        
//         // Handle service pricing
//         if (formData.price.includes('-')) {
//           const [min, max] = formData.price.split('-').map(p => parseFloat(p.trim()));
//           updateData.starting_price = min;
//           updateData.max_price = max;
//         } else {
//           updateData.starting_price = parseFloat(formData.price);
//         }
//       } else {
//         // Product-specific fields
//         updateData.product_name = formData.title;
//         updateData.product_description = formData.description;
//         updateData.product_price = parseFloat(formData.price);
//         updateData.provider_phone = formData.providerPhone;
//         updateData.provider_email = formData.providerEmail;
//         updateData.product_condition = formData.condition;
//         updateData.is_negotiable = formData.isNegotiable;
//         updateData.tags = formData.tags.join(', ');
//       }

//       // Handle images
//       if (featuredImage) {
//         updateData.featured_image = featuredImage;
//       }
      
//       if (selectedImages.length > 0) {
//         updateData.gallery_images = selectedImages;
//       }

//       const updatedListing = await listingService.updateListing(id, updateData);
      
//       if (updatedListing) {
//         setListing(updatedListing);
//         toast.success('Listing updated successfully!');
//       }
//     } catch (error) {
//       console.error('Error updating listing:', error);
//       toast.error('Failed to update listing');
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleDelete = async () => {
//     if (!id) return;

//     if (!confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
//       return;
//     }

//     try {
//       const success = await listingService.deleteListing(id);
//       if (success) {
//         toast.success('Listing deleted successfully!');
//         navigate('/vendor/listings');
//       }
//     } catch (error) {
//       console.error('Error deleting listing:', error);
//       toast.error('Failed to delete listing');
//     }
//   };

//   const handleToggleStatus = async () => {
//     if (!id) return;

//     try {
//       const updatedListing = await listingService.toggleListingStatus(id);
//       if (updatedListing) {
//         setListing(updatedListing);
//         toast.success('Listing status updated successfully!');
//       }
//     } catch (error) {
//       console.error('Error toggling status:', error);
//       toast.error('Failed to update listing status');
//     }
//   };

//   const handlePreview = () => {
//     if (!listing) return;
    
//     const [type, numId] = listing.id.split('-');
//     if (type === 'product') {
//       window.open(`/products/${numId}`, '_blank');
//     } else {
//       window.open(`/services/${numId}`, '_blank');
//     }
//   };

//   if (loading) {
//     return (
//       <VendorLayout>
//         <div className="flex items-center justify-center min-h-[400px]">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
//         </div>
//       </VendorLayout>
//     );
//   }

//   if (!listing) {
//     return (
//       <VendorLayout>
//         <ComingSoon 
//           title="Listing Not Found"
//           description="The listing you're looking for could not be found."
//         />
//       </VendorLayout>
//     );
//   }

//   return (
//     <VendorLayout>
//       <div className="space-y-6">
//         {/* Header */}
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-4">
//             <Button 
//               variant="ghost" 
//               size="icon"
//               onClick={() => navigate("/vendor/listings")}
//             >
//               <ArrowLeft className="h-4 w-4" />
//             </Button>
//             <div>
//               <h1 className="text-3xl font-bold tracking-tight">Edit Listing</h1>
//               <p className="text-muted-foreground">
//                 Update your {listing.isService ? 'service' : 'product'} details and settings.
//               </p>
//             </div>
//           </div>
          
//           <div className="flex items-center gap-2">
//             <Badge variant={listing.status === "active" ? "default" : "secondary"}>
//               {listing.status}
//             </Badge>
//             <Badge variant={listing.isService ? "default" : "outline"}>
//               {listing.isService ? "Service" : "Product"}
//             </Badge>
//             <Button variant="outline" size="sm" onClick={handlePreview}>
//               <Eye className="h-4 w-4 mr-2" />
//               Preview
//             </Button>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* Main Content */}
//           <div className="lg:col-span-2 space-y-6">
//             <Card>
//               <CardHeader>
//                 <CardTitle>Basic Information</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div>
//                   <Label htmlFor="title">Title</Label>
//                   <Input
//                     id="title"
//                     value={formData.title}
//                     onChange={(e) => handleInputChange('title', e.target.value)}
//                     placeholder={`Enter ${listing.isService ? 'service' : 'product'} title`}
//                   />
//                 </div>
                
//                 <div>
//                   <Label htmlFor="description">Description</Label>
//                   <Textarea
//                     id="description"
//                     rows={5}
//                     value={formData.description}
//                     onChange={(e) => handleInputChange('description', e.target.value)}
//                     placeholder="Describe your offering in detail"
//                   />
//                 </div>
                
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <Label htmlFor="price">
//                       {listing.isService ? 'Price Range' : 'Price'} (₦)
//                     </Label>
//                     <Input
//                       id="price"
//                       value={formData.price}
//                       onChange={(e) => handleInputChange('price', e.target.value)}
//                       placeholder={listing.isService ? "e.g., 5000-10000 or 5000" : "e.g., 25000"}
//                     />
//                   </div>
                  
//                   <div>
//                     <Label htmlFor="category">Category</Label>
//                     <Input
//                       id="category"
//                       value={formData.category}
//                       onChange={(e) => handleInputChange('category', e.target.value)}
//                       placeholder="Product category"
//                       disabled
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <Label htmlFor="location">Location</Label>
//                   <Input
//                     id="location"
//                     value={formData.location}
//                     onChange={(e) => handleInputChange('location', e.target.value)}
//                     placeholder="Service location"
//                     disabled
//                   />
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Service-specific fields */}
//             {listing.isService && (
//               <Card>
//                 <CardHeader>
//                   <CardTitle>Service Details</CardTitle>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div>
//                       <Label htmlFor="responseTime">Response Time</Label>
//                       <Input
//                         id="responseTime"
//                         value={formData.responseTime}
//                         onChange={(e) => handleInputChange('responseTime', e.target.value)}
//                         placeholder="e.g., Within 24 hours"
//                       />
//                     </div>
                    
//                     <div>
//                       <Label htmlFor="availability">Availability</Label>
//                       <Input
//                         id="availability"
//                         value={formData.availability}
//                         onChange={(e) => handleInputChange('availability', e.target.value)}
//                         placeholder="e.g., Mon-Fri 9AM-6PM"
//                       />
//                     </div>
//                   </div>

//                   <div className="flex items-center space-x-2">
//                     <Switch
//                       id="servesRemote"
//                       checked={formData.servesRemote}
//                       onCheckedChange={(checked) => handleInputChange('servesRemote', checked)}
//                     />
//                     <Label htmlFor="servesRemote">Serves Remote Clients</Label>
//                   </div>
//                 </CardContent>
//               </Card>
//             )}

//             {/* Product-specific fields */}
//             {!listing.isService && (
//               <Card>
//                 <CardHeader>
//                   <CardTitle>Product Details</CardTitle>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div>
//                       <Label htmlFor="condition">Condition</Label>
//                       <Select
//                         value={formData.condition}
//                         onValueChange={(value) => handleInputChange('condition', value)}
//                       >
//                         <SelectTrigger>
//                           <SelectValue />
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectItem value="new">New</SelectItem>
//                           <SelectItem value="used">Used</SelectItem>
//                           <SelectItem value="refurbished">Refurbished</SelectItem>
//                         </SelectContent>
//                       </Select>
//                     </div>
//                   </div>

//                   <div className="flex items-center space-x-2">
//                     <Switch
//                       id="isNegotiable"
//                       checked={formData.isNegotiable}
//                       onCheckedChange={(checked) => handleInputChange('isNegotiable', checked)}
//                     />
//                     <Label htmlFor="isNegotiable">Price is negotiable</Label>
//                   </div>
//                 </CardContent>
//               </Card>
//             )}

//             {/* Contact Information */}
//             <Card>
//               <CardHeader>
//                 <CardTitle>Contact Information</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <Label htmlFor="providerName">
//                       {listing.isService ? 'Provider' : 'Seller'} Name
//                     </Label>
//                     <Input
//                       id="providerName"
//                       value={formData.providerName}
//                       onChange={(e) => handleInputChange('providerName', e.target.value)}
//                       placeholder="Your name or business name"
//                     />
//                   </div>
                  
//                   <div>
//                     <Label htmlFor="providerPhone">Phone Number</Label>
//                     <Input
//                       id="providerPhone"
//                       value={formData.providerPhone}
//                       onChange={(e) => handleInputChange('providerPhone', e.target.value)}
//                       placeholder="+234 xxx xxx xxxx"
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <Label htmlFor="providerEmail">Email Address</Label>
//                   <Input
//                     id="providerEmail"
//                     type="email"
//                     value={formData.providerEmail}
//                     onChange={(e) => handleInputChange('providerEmail', e.target.value)}
//                     placeholder="your.email@example.com"
//                   />
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Tags */}
//             <Card>
//               <CardHeader>
//                 <CardTitle>Tags & Keywords</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div className="flex flex-wrap gap-2">
//                   {formData.tags.map((tag, index) => (
//                     <Badge key={index} variant="secondary" className="flex items-center gap-1">
//                       {tag}
//                       <X 
//                         className="h-3 w-3 cursor-pointer" 
//                         onClick={() => handleRemoveTag(tag)}
//                       />
//                     </Badge>
//                   ))}
//                 </div>
                
//                 <div className="flex gap-2">
//                   <Input
//                     value={newTag}
//                     onChange={(e) => setNewTag(e.target.value)}
//                     placeholder="Add a tag"
//                     onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
//                   />
//                   <Button type="button" onClick={handleAddTag}>Add</Button>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Images */}
//             <Card>
//               <CardHeader>
//                 <CardTitle>Images</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div>
//                   <Label htmlFor="featuredImage">Featured Image</Label>
//                   <Input
//                     id="featuredImage"
//                     type="file"
//                     accept="image/*"
//                     onChange={(e) => handleImageUpload(e.target.files, 'featured')}
//                   />
//                   {featuredImage && (
//                     <p className="text-sm text-muted-foreground mt-1">
//                       Selected: {featuredImage.name}
//                     </p>
//                   )}
//                 </div>
                
//                 <div>
//                   <Label htmlFor="galleryImages">Gallery Images</Label>
//                   <Input
//                     id="galleryImages"
//                     type="file"
//                     accept="image/*"
//                     multiple
//                     onChange={(e) => handleImageUpload(e.target.files, 'gallery')}
//                   />
//                   {selectedImages.length > 0 && (
//                     <p className="text-sm text-muted-foreground mt-1">
//                       Selected: {selectedImages.length} images
//                     </p>
//                   )}
//                 </div>
//               </CardContent>
//             </Card>
//           </div>

//           {/* Sidebar */}
//           <div className="space-y-6">
//             <Card>
//               <CardHeader>
//                 <CardTitle>Actions</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-3">
//                 <Button 
//                   onClick={handleSave} 
//                   disabled={saving}
//                   className="w-full"
//                 >
//                   <Save className="h-4 w-4 mr-2" />
//                   {saving ? "Saving..." : "Save Changes"}
//                 </Button>
                
//                 <Button 
//                   variant="outline" 
//                   onClick={handleToggleStatus}
//                   className="w-full"
//                 >
//                   {listing.status === 'active' ? 'Pause Listing' : 'Activate Listing'}
//                 </Button>
                
//                 <Button 
//                   variant="outline" 
//                   onClick={handlePreview}
//                   className="w-full"
//                 >
//                   <Eye className="h-4 w-4 mr-2" />
//                   Preview Listing
//                 </Button>
                
//                 <Button 
//                   variant="destructive" 
//                   onClick={handleDelete}
//                   className="w-full"
//                 >
//                   <Trash2 className="h-4 w-4 mr-2" />
//                   Delete Listing
//                 </Button>
//               </CardContent>
//             </Card>

//             <Card>
//               <CardHeader>
//                 <CardTitle>Statistics</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-3">
//                 <div className="flex justify-between">
//                   <span className="text-sm text-muted-foreground">Views</span>
//                   <span className="font-medium">{listing.viewsCount.toLocaleString()}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-sm text-muted-foreground">Rating</span>
//                   <span className="font-medium flex items-center gap-1">
//                     <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
//                     {listing.rating.toFixed(1)} ({listing.ratingCount})
//                   </span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-sm text-muted-foreground">Status</span>
//                   <span className="font-medium">{listing.status}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-sm text-muted-foreground">Created</span>
//                   <span className="font-medium">
//                     {new Date(listing.createdAt).toLocaleDateString()}
//                   </span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-sm text-muted-foreground">Updated</span>
//                   <span className="font-medium">
//                     {new Date(listing.updatedAt).toLocaleDateString()}
//                   </span>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Promotion Options */}
//             <Card>
//               <CardHeader>
//                 <CardTitle>Promotion</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-3">
//                 <div className="flex items-center justify-between">
//                   <span className="text-sm">Promoted</span>
//                   <Badge variant={listing.isPromoted ? "default" : "outline"}>
//                     {listing.isPromoted ? "Yes" : "No"}
//                   </Badge>
//                 </div>
//                 <div className="flex items-center justify-between">
//                   <span className="text-sm">Featured</span>
//                   <Badge variant={listing.isFeatured ? "default" : "outline"}>
//                     {listing.isFeatured ? "Yes" : "No"}
//                   </Badge>
//                 </div>
//                 {listing.isService && (
//                   <div className="flex items-center justify-between">
//                     <span className="text-sm">Verified</span>
//                     <Badge variant={listing.isVerified ? "default" : "outline"}>
//                       {listing.isVerified ? "Yes" : "No"}
//                     </Badge>
//                   </div>
//                 )}
                
//                 <Button variant="outline" className="w-full mt-3" disabled>
//                   <TrendingUp className="h-4 w-4 mr-2" />
//                   Promote Listing
//                 </Button>
//                 <p className="text-xs text-muted-foreground">
//                   Promotion features coming soon
//                 </p>
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       </div>
//     </VendorLayout>
//   );
// };

// export default VendorEditListing;