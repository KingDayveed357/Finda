
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Sparkles } from 'lucide-react';
import { mockCategories, mockAI } from '@/lib/mock-ai';

interface ListingFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const ListingForm = ({ onSubmit, onCancel }: ListingFormProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    location: '',
    tags: [] as string[],
    isService: false
  });
  const [newTag, setNewTag] = useState('');
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [isGeneratingTags, setIsGeneratingTags] = useState(false);

  const handleGenerateDescription = async () => {
    if (!formData.title || !formData.category) return;
    
    setIsGeneratingDescription(true);
    try {
      const aiDescription = await mockAI.generateDescription(formData.title, formData.category);
      setFormData(prev => ({ ...prev, description: aiDescription }));
    } catch (error) {
      console.error('Failed to generate description:', error);
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const handleGenerateTags = async () => {
    if (!formData.title || !formData.description) return;
    
    setIsGeneratingTags(true);
    try {
      const aiTags = await mockAI.generateTags(formData.title, formData.description);
      setFormData(prev => ({ ...prev, tags: [...prev.tags, ...aiTags] }));
    } catch (error) {
      console.error('Failed to generate tags:', error);
    } finally {
      setIsGeneratingTags(false);
    }
  };

  const addTag = () => {
    if (newTag && !formData.tags.includes(newTag)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag] }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-600" />
          Create New Listing (AI Enhanced)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter listing title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {mockCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="description">Description</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGenerateDescription}
                disabled={!formData.title || !formData.category || isGeneratingDescription}
                className="flex items-center gap-2"
              >
                <Sparkles className="h-4 w-4" />
                {isGeneratingDescription ? 'Generating...' : 'AI Generate'}
              </Button>
            </div>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your listing..."
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="City, State"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Tags</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGenerateTags}
                disabled={!formData.title || !formData.description || isGeneratingTags}
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
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isService"
              checked={formData.isService}
              onChange={(e) => setFormData(prev => ({ ...prev, isService: e.target.checked }))}
              className="rounded"
            />
            <Label htmlFor="isService">This is a service (not a physical product)</Label>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" className="flex-1">
              Create Listing
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ListingForm;
