import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, MoreHorizontal, Eye, ShoppingCart, Search, Filter } from "lucide-react";
import { toast } from "sonner";
import  VendorLayout  from "@/components/vendor/VendorLayout";

const mockListings = [
  {
    id: "1",
    title: "Vintage Leather Jacket",
    image: "/placeholder.svg",
    price: 150,
    status: "active",
    views: 245,
    sales: 12,
  },
  {
    id: "2", 
    title: "Handmade Ceramic Vase",
    image: "/placeholder.svg",
    price: 85,
    status: "paused",
    views: 189,
    sales: 7,
  },
  {
    id: "3",
    title: "Organic Cotton T-Shirt",
    image: "/placeholder.svg", 
    price: 35,
    status: "active",
    views: 567,
    sales: 23,
  },
];

const VendorListings = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleEditListing = (id: string) => {
    window.location.href = `/vendor/listings/edit/${id}`;
  };

  const handleToggleStatus = (id: string) => {
    toast.success(`Listing ${id} status toggled`);
  };

  const handleDeleteListing = (id: string) => {
    toast.error(`Listing ${id} has been deleted`);
  };

  const getStatusBadge = (status: string) => {
    return status === "active" ? (
      <Badge className="bg-green-100 text-green-800">Active</Badge>
    ) : (
      <Badge variant="secondary">Paused</Badge>
    );
  };

  const filteredListings = mockListings.filter(listing =>
    listing.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <VendorLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Listings</h1>
            <p className="text-muted-foreground">
              Manage your product listings and track their performance.
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add New Listing
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search listings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((listing) => (
            <Card key={listing.id}>
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <Avatar className="h-16 w-16 rounded-lg">
                    <AvatarImage src={listing.image} alt={listing.title} />
                    <AvatarFallback className="rounded-lg">
                      {listing.title.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditListing(listing.id)}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleStatus(listing.id)}>
                        {listing.status === "active" ? "Pause" : "Activate"}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeleteListing(listing.id)}
                        className="text-destructive"
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold line-clamp-2">{listing.title}</h3>
                    <p className="text-2xl font-bold text-primary mt-1">
                      ${listing.price}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    {getStatusBadge(listing.status)}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {listing.views}
                    </div>
                    <div className="flex items-center gap-1">
                      <ShoppingCart className="h-4 w-4" />
                      {listing.sales} sold
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {filteredListings.length === 0 && (
            <div className="col-span-full">
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">No listings found matching your search.</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </VendorLayout>
  );
};

export default VendorListings;