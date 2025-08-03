import { useParams } from "react-router-dom";
import { useState } from "react";
import VendorLayout  from "@/components/vendor/VendorLayout";
import  ComingSoon  from "@/components/ComingSoon";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, Eye, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const mockListing = {
  id: "1",
  title: "Professional Logo Design",
  description: "I'll create a stunning, memorable logo that perfectly represents your brand. With over 5 years of experience in graphic design, I specialize in creating unique logos that stand out in the market.",
  price: 299,
  category: "Design & Creative",
  status: "active",
  images: ["/placeholder.svg"],
  tags: ["logo", "branding", "design"],
  deliveryTime: "3-5 days"
};

const VendorEditListing = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [listing, setListing] = useState(mockListing);

  // For demonstration, we'll show coming soon for any ID other than "1"
  if (id !== "1") {
    return (
      <VendorLayout>
        <ComingSoon 
          title="Edit Listing Feature"
          description="The editing functionality for this listing is being developed. Please check back soon!"
        />
      </VendorLayout>
    );
  }

  const handleSave = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Listing updated successfully!");
    }, 1000);
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this listing?")) {
      toast.success("Listing deleted successfully!");
      navigate("/vendor/listings");
    }
  };

  return (
    <VendorLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate("/vendor/listings")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Edit Listing</h1>
              <p className="text-muted-foreground">
                Update your listing details and settings.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant={listing.status === "active" ? "default" : "secondary"}>
              {listing.status}
            </Badge>
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={listing.title}
                    onChange={(e) => setListing({...listing, title: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    rows={5}
                    value={listing.description}
                    onChange={(e) => setListing({...listing, description: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Price ($)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={listing.price}
                      onChange={(e) => setListing({...listing, price: Number(e.target.value)})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="delivery">Delivery Time</Label>
                    <Input
                      id="delivery"
                      value={listing.deliveryTime}
                      onChange={(e) => setListing({...listing, deliveryTime: e.target.value})}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category & Tags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={listing.category}
                    onChange={(e) => setListing({...listing, category: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {listing.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={handleSave} 
                  disabled={isLoading}
                  className="w-full"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview Listing
                </Button>
                
                <Button 
                  variant="destructive" 
                  onClick={handleDelete}
                  className="w-full"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Listing
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Views</span>
                  <span className="font-medium">1,234</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Orders</span>
                  <span className="font-medium">45</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Rating</span>
                  <span className="font-medium">4.8/5</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </VendorLayout>
  );
};

export default VendorEditListing;