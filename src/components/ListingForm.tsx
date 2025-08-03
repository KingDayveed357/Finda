// import { useState } from 'react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Textarea } from '@/components/ui/textarea';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Label } from '@/components/ui/label';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Badge } from '@/components/ui/badge';
// import { Checkbox } from '@/components/ui/checkbox';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { X, Plus, Sparkles, Package, Briefcase } from 'lucide-react';
// import { mockCategories, mockAI } from '@/lib/mock-ai';

// interface ListingFormProps {
//   onSubmit: (data: any) => void;
//   onCancel: () => void;
//   initialData?: any;
//   isEdit?: boolean;
// }

// type ListingType = 'product' | 'service';

// const ListingForm = ({ onSubmit, onCancel, initialData, isEdit = false }: ListingFormProps) => {
//   const [listingType, setListingType] = useState<ListingType>('product');
//   const [formData, setFormData] = useState({
//     // Common fields
//     type: 'product' as ListingType,
//     category: '',
//     country: '',
//     state: '',
//     city: '',
//     address_details: '',
//     featured_image: null as File | null,
//     gallery_images: [] as File[],
//     tags: '',
//     is_promoted: false,
//     meta_title: '',
//     meta_description: '',
    
//     // Product specific fields
//     product_name: '',
//     product_description: '',
//     product_price: '',
//     original_price: '',
//     is_negotiable: false,
//     product_brand: '',
//     product_model: '',
//     product_condition: 'new',
//     provider_phone: '',
//     provider_email: '',
//     provider_whatsapp: '',
    
//     // Service specific fields
//     service_name: '',
//     service_description: '',
//     provider_name: '',
//     provider_title: '',
//     provider_bio: '',
//     provider_expertise: '',
//     provider_experience: '',
//     provider_certifications: '',
//     provider_languages: '',
//     provider_website: '',
//     provider_linkedin: '',
//     starting_price: '',
//     max_price: '',
//     price_type: 'fixed',
//     response_time: '',
//     availability: '',
//     serves_remote: false,
//     service_radius: '',
    
//     ...initialData
//   });
  
//   const [newTag, setNewTag] = useState('');
//   const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
//   const [isGeneratingTags, setIsGeneratingTags] = useState(false);

//   const handleGenerateDescription = async () => {
//     const title = listingType === 'product' ? formData.product_name : formData.service_name;
//     if (!title || !formData.category) return;
    
//     setIsGeneratingDescription(true);
//     try {
//       const aiDescription = await mockAI.generateDescription(title, formData.category);
//       const field = listingType === 'product' ? 'product_description' : 'service_description';
//       setFormData(prev => ({ ...prev, [field]: aiDescription }));
//     } catch (error) {
//       console.error('Failed to generate description:', error);
//     } finally {
//       setIsGeneratingDescription(false);
//     }
//   };

//   const handleGenerateTags = async () => {
//     const title = listingType === 'product' ? formData.product_name : formData.service_name;
//     const description = listingType === 'product' ? formData.product_description : formData.service_description;
//     if (!title || !description) return;
    
//     setIsGeneratingTags(true);
//     try {
//       const aiTags = await mockAI.generateTags(title, description);
//       const currentTags = formData.tags ? formData.tags.split(',').map(t => t.trim()) : [];
//       const newTags = [...currentTags, ...aiTags];
//       setFormData(prev => ({ ...prev, tags: newTags.join(', ') }));
//     } catch (error) {
//       console.error('Failed to generate tags:', error);
//     } finally {
//       setIsGeneratingTags(false);
//     }
//   };

//   const addTag = () => {
//     if (newTag) {
//       const currentTags = formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(t => t) : [];
//       if (!currentTags.includes(newTag)) {
//         const newTags = [...currentTags, newTag];
//         setFormData(prev => ({ ...prev, tags: newTags.join(', ') }));
//         setNewTag('');
//       }
//     }
//   };

//   const removeTag = (tagToRemove: string) => {
//     const currentTags = formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(t => t) : [];
//     const newTags = currentTags.filter(tag => tag !== tagToRemove);
//     setFormData(prev => ({ ...prev, tags: newTags.join(', ') }));
//   };

//   const handleListingTypeChange = (type: ListingType) => {
//     setListingType(type);
//     setFormData(prev => ({ ...prev, type }));
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     onSubmit({ ...formData, type: listingType });
//   };

//   const getTags = () => {
//     return formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(t => t) : [];
//   };

//   return (
//     <Card className="w-full max-w-4xl">
//       <CardHeader>
//         <CardTitle className="flex items-center gap-2">
//           <Sparkles className="h-5 w-5 text-blue-600" />
//           {isEdit ? 'Edit Listing' : 'Create New Listing'} (AI Enhanced)
//         </CardTitle>
//       </CardHeader>
//       <CardContent>
//         <form onSubmit={handleSubmit} className="space-y-6">
//           {/* Listing Type Selection */}
//           <Tabs value={listingType} onValueChange={handleListingTypeChange} className="w-full">
//             <TabsList className="grid w-full grid-cols-2">
//               <TabsTrigger value="product" className="flex items-center gap-2">
//                 <Package className="h-4 w-4" />
//                 Product
//               </TabsTrigger>
//               <TabsTrigger value="service" className="flex items-center gap-2">
//                 <Briefcase className="h-4 w-4" />
//                 Service
//               </TabsTrigger>
//             </TabsList>

//             <TabsContent value="product" className="space-y-6 mt-6">
//               {/* Product Form */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div className="space-y-2">
//                   <Label htmlFor="product_name">Product Name *</Label>
//                   <Input
//                     id="product_name"
//                     value={formData.product_name}
//                     onChange={(e) => setFormData(prev => ({ ...prev, product_name: e.target.value }))}
//                     placeholder="Enter product name"
//                     required
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="category">Category *</Label>
//                   <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select category" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {mockCategories.map((category) => (
//                         <SelectItem key={category.id} value={category.id}>
//                           {category.icon} {category.name}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <div className="flex items-center justify-between">
//                   <Label htmlFor="product_description">Description *</Label>
//                   <Button
//                     type="button"
//                     variant="outline"
//                     size="sm"
//                     onClick={handleGenerateDescription}
//                     disabled={!formData.product_name || !formData.category || isGeneratingDescription}
//                     className="flex items-center gap-2"
//                   >
//                     <Sparkles className="h-4 w-4" />
//                     {isGeneratingDescription ? 'Generating...' : 'AI Generate'}
//                   </Button>
//                 </div>
//                 <Textarea
//                   id="product_description"
//                   value={formData.product_description}
//                   onChange={(e) => setFormData(prev => ({ ...prev, product_description: e.target.value }))}
//                   placeholder="Describe your product..."
//                   rows={4}
//                   required
//                 />
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                 <div className="space-y-2">
//                   <Label htmlFor="product_price">Price *</Label>
//                   <Input
//                     id="product_price"
//                     type="number"
//                     value={formData.product_price}
//                     onChange={(e) => setFormData(prev => ({ ...prev, product_price: e.target.value }))}
//                     placeholder="0.00"
//                     min="0"
//                     step="0.01"
//                     required
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="original_price">Original Price</Label>
//                   <Input
//                     id="original_price"
//                     type="number"
//                     value={formData.original_price}
//                     onChange={(e) => setFormData(prev => ({ ...prev, original_price: e.target.value }))}
//                     placeholder="0.00"
//                     min="0"
//                     step="0.01"
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="product_condition">Condition</Label>
//                   <Select value={formData.product_condition} onValueChange={(value) => setFormData(prev => ({ ...prev, product_condition: value }))}>
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select condition" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="new">New</SelectItem>
//                       <SelectItem value="used">Used</SelectItem>
//                       <SelectItem value="refurbished">Refurbished</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div className="space-y-2">
//                   <Label htmlFor="product_brand">Brand</Label>
//                   <Input
//                     id="product_brand"
//                     value={formData.product_brand}
//                     onChange={(e) => setFormData(prev => ({ ...prev, product_brand: e.target.value }))}
//                     placeholder="Product brand"
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="product_model">Model</Label>
//                   <Input
//                     id="product_model"
//                     value={formData.product_model}
//                     onChange={(e) => setFormData(prev => ({ ...prev, product_model: e.target.value }))}
//                     placeholder="Product model"
//                   />
//                 </div>
//               </div>

//               <div className="flex items-center space-x-2">
//                 <Checkbox
//                   id="is_negotiable"
//                   checked={formData.is_negotiable}
//                   onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_negotiable: checked as boolean }))}
//                 />
//                 <Label htmlFor="is_negotiable">Price is negotiable</Label>
//               </div>
//             </TabsContent>

//             <TabsContent value="service" className="space-y-6 mt-6">
//               {/* Service Form */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div className="space-y-2">
//                   <Label htmlFor="service_name">Service Name *</Label>
//                   <Input
//                     id="service_name"
//                     value={formData.service_name}
//                     onChange={(e) => setFormData(prev => ({ ...prev, service_name: e.target.value }))}
//                     placeholder="Enter service name"
//                     required
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="provider_name">Provider Name *</Label>
//                   <Input
//                     id="provider_name"
//                     value={formData.provider_name}
//                     onChange={(e) => setFormData(prev => ({ ...prev, provider_name: e.target.value }))}
//                     placeholder="Your name or business name"
//                     required
//                   />
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <div className="flex items-center justify-between">
//                   <Label htmlFor="service_description">Description *</Label>
//                   <Button
//                     type="button"
//                     variant="outline"
//                     size="sm"
//                     onClick={handleGenerateDescription}
//                     disabled={!formData.service_name || !formData.category || isGeneratingDescription}
//                     className="flex items-center gap-2"
//                   >
//                     <Sparkles className="h-4 w-4" />
//                     {isGeneratingDescription ? 'Generating...' : 'AI Generate'}
//                   </Button>
//                 </div>
//                 <Textarea
//                   id="service_description"
//                   value={formData.service_description}
//                   onChange={(e) => setFormData(prev => ({ ...prev, service_description: e.target.value }))}
//                   placeholder="Describe your service..."
//                   rows={4}
//                   required
//                 />
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div className="space-y-2">
//                   <Label htmlFor="provider_title">Professional Title</Label>
//                   <Input
//                     id="provider_title"
//                     value={formData.provider_title}
//                     onChange={(e) => setFormData(prev => ({ ...prev, provider_title: e.target.value }))}
//                     placeholder="e.g., Senior Developer, Marketing Expert"
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="provider_experience">Experience</Label>
//                   <Input
//                     id="provider_experience"
//                     value={formData.provider_experience}
//                     onChange={(e) => setFormData(prev => ({ ...prev, provider_experience: e.target.value }))}
//                     placeholder="e.g., 5 years"
//                   />
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="provider_bio">Bio</Label>
//                 <Textarea
//                   id="provider_bio"
//                   value={formData.provider_bio}
//                   onChange={(e) => setFormData(prev => ({ ...prev, provider_bio: e.target.value }))}
//                   placeholder="Brief biography about yourself..."
//                   rows={3}
//                 />
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div className="space-y-2">
//                   <Label htmlFor="starting_price">Starting Price</Label>
//                   <Input
//                     id="starting_price"
//                     type="number"
//                     value={formData.starting_price}
//                     onChange={(e) => setFormData(prev => ({ ...prev, starting_price: e.target.value }))}
//                     placeholder="0.00"
//                     min="0"
//                     step="0.01"
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="max_price">Maximum Price</Label>
//                   <Input
//                     id="max_price"
//                     type="number"
//                     value={formData.max_price}
//                     onChange={(e) => setFormData(prev => ({ ...prev, max_price: e.target.value }))}
//                     placeholder="0.00"
//                     min="0"
//                     step="0.01"
//                   />
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div className="space-y-2">
//                   <Label htmlFor="price_type">Price Type</Label>
//                   <Select value={formData.price_type} onValueChange={(value) => setFormData(prev => ({ ...prev, price_type: value }))}>
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select price type" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="fixed">Fixed Price</SelectItem>
//                       <SelectItem value="hourly">Hourly Rate</SelectItem>
//                       <SelectItem value="project">Per Project</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="response_time">Response Time</Label>
//                   <Input
//                     id="response_time"
//                     value={formData.response_time}
//                     onChange={(e) => setFormData(prev => ({ ...prev, response_time: e.target.value }))}
//                     placeholder="e.g., Within 24 hours"
//                   />
//                 </div>
//               </div>

//               <div className="flex items-center space-x-2">
//                 <Checkbox
//                   id="serves_remote"
//                   checked={formData.serves_remote}
//                   onCheckedChange={(checked) => setFormData(prev => ({ ...prev, serves_remote: checked as boolean }))}
//                 />
//                 <Label htmlFor="serves_remote">Can provide service remotely</Label>
//               </div>

//               {!formData.serves_remote && (
//                 <div className="space-y-2">
//                   <Label htmlFor="service_radius">Service Radius (km)</Label>
//                   <Input
//                     id="service_radius"
//                     type="number"
//                     value={formData.service_radius}
//                     onChange={(e) => setFormData(prev => ({ ...prev, service_radius: e.target.value }))}
//                     placeholder="50"
//                     min="0"
//                   />
//                 </div>
//               )}
//             </TabsContent>
//           </Tabs>

//           {/* Location Fields (Common for both) */}
//           <div className="space-y-4">
//             <h3 className="text-lg font-semibold">Location *</h3>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//               <div className="space-y-2">
//                 <Label htmlFor="country">Country *</Label>
//                 <Input
//                   id="country"
//                   value={formData.country}
//                   onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
//                   placeholder="Country"
//                   required
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="state">State *</Label>
//                 <Input
//                   id="state"
//                   value={formData.state}
//                   onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
//                   placeholder="State"
//                   required
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="city">City *</Label>
//                 <Input
//                   id="city"
//                   value={formData.city}
//                   onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
//                   placeholder="City"
//                   required
//                 />
//               </div>
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="address_details">Address Details</Label>
//               <Input
//                 id="address_details"
//                 value={formData.address_details}
//                 onChange={(e) => setFormData(prev => ({ ...prev, address_details: e.target.value }))}
//                 placeholder="Additional address information"
//               />
//             </div>
//           </div>

//           {/* Contact Information */}
//           <div className="space-y-4">
//             <h3 className="text-lg font-semibold">Contact Information</h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div className="space-y-2">
//                 <Label htmlFor="provider_email">Email {listingType === 'service' ? '*' : ''}</Label>
//                 <Input
//                   id="provider_email"
//                   type="email"
//                   value={formData.provider_email}
//                   onChange={(e) => setFormData(prev => ({ ...prev, provider_email: e.target.value }))}
//                   placeholder="your@email.com"
//                   required={listingType === 'service'}
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="provider_phone">Phone</Label>
//                 <Input
//                   id="provider_phone"
//                   value={formData.provider_phone}
//                   onChange={(e) => setFormData(prev => ({ ...prev, provider_phone: e.target.value }))}
//                   placeholder="+1234567890"
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Tags */}
//           <div className="space-y-2">
//             <div className="flex items-center justify-between">
//               <Label>Tags</Label>
//               <Button
//                 type="button"
//                 variant="outline"
//                 size="sm"
//                 onClick={handleGenerateTags}
//                 disabled={
//                   !(listingType === 'product' ? formData.product_name : formData.service_name) ||
//                   !(listingType === 'product' ? formData.product_description : formData.service_description) ||
//                   isGeneratingTags
//                 }
//                 className="flex items-center gap-2"
//               >
//                 <Sparkles className="h-4 w-4" />
//                 {isGeneratingTags ? 'Generating...' : 'AI Suggest Tags'}
//               </Button>
//             </div>
//             <div className="flex gap-2">
//               <Input
//                 value={newTag}
//                 onChange={(e) => setNewTag(e.target.value)}
//                 placeholder="Add a tag"
//                 onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
//               />
//               <Button type="button" onClick={addTag} variant="outline">
//                 <Plus className="h-4 w-4" />
//               </Button>
//             </div>
//             {getTags().length > 0 && (
//               <div className="flex flex-wrap gap-2 mt-2">
//                 {getTags().map((tag) => (
//                   <Badge key={tag} variant="secondary" className="flex items-center gap-1">
//                     {tag}
//                     <button
//                       type="button"
//                       onClick={() => removeTag(tag)}
//                       className="ml-1 hover:text-red-500"
//                     >
//                       <X className="h-3 w-3" />
//                     </button>
//                   </Badge>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* Advanced Options */}
//           <div className="space-y-4">
//             <h3 className="text-lg font-semibold">Advanced Options</h3>
//             <div className="flex items-center space-x-2">
//               <Checkbox
//                 id="is_promoted"
//                 checked={formData.is_promoted}
//                 onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_promoted: checked as boolean }))}
//               />
//               <Label htmlFor="is_promoted">Promote this listing</Label>
//             </div>
//           </div>

//           <div className="flex gap-4 pt-4">
//             <Button type="submit" className="flex-1">
//               {isEdit ? 'Update Listing' : 'Create Listing'}
//             </Button>
//             <Button type="button" variant="outline" onClick={onCancel}>
//               Cancel
//             </Button>
//           </div>
//         </form>
//       </CardContent>
//     </Card>
//   );
// };

// export default ListingForm;
