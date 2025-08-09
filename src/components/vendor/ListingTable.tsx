import { MoreHorizontal, Edit, Pause, Trash2, Play, Eye, Star } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UnifiedListing } from "@/service/listingService";

interface ListingTableProps {
  listings: UnifiedListing[];
  onEdit?: (id: string) => void;
  onToggleStatus?: (id: string) => void;
  onDelete?: (id: string) => void;
  onView?: (id: string) => void;
  loading?: boolean;
  title?: string;
}

type ListingStatus = 'published' | 'paused' | 'draft' | 'expired';

export default function ListingTable({ 
  listings, 
  onEdit, 
  onToggleStatus, 
  onDelete,
  onView,
  loading = false,
  title = "Recent Listings"
}: ListingTableProps) {
  
  // Extract status from originalData
  const getListingStatus = (listing: UnifiedListing): ListingStatus => {
    const originalData = listing.originalData as any;
    
    if (listing.isService) {
      return originalData.service_status || 'published';
    } else {
      return originalData.product_status || 'published';
    }
  };

  const getStatusBadge = (status: ListingStatus) => {
    switch (status) {
      case 'published':
        return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
      case 'paused':
        return <Badge variant="secondary">Paused</Badge>;
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeBadge = (isService: boolean) => {
    return (
      <Badge variant={isService ? "default" : "secondary"} className="text-xs">
        {isService ? "Service" : "Product"}
      </Badge>
    );
  };

  const formatPrice = (price: UnifiedListing['price']) => {
    if (!price) return "N/A";
    
    if (typeof price === 'number') {
      return `₦${price.toLocaleString()}`;
    }
    
    if (typeof price === 'object') {
      return `₦${price.min.toLocaleString()} - ₦${price.max.toLocaleString()}`;
    }
    
    return "N/A";
  };

  const formatRating = (rating: number, ratingCount: number) => {
    if (ratingCount === 0) return "No ratings";
    return (
      <div className="flex items-center gap-1">
        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
        <span className="text-sm">{rating.toFixed(1)} ({ratingCount})</span>
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {title}
          <Badge variant="outline">{listings.length} items</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {listings.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No listings found</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead className="text-center">Type</TableHead>
                <TableHead className="text-center">Views</TableHead>
                <TableHead className="text-center">Rating</TableHead>
                <TableHead className="text-center">Price</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="w-[70px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listings.map((listing) => {
                const status = getListingStatus(listing);
                
                return (
                  <TableRow key={listing.id}>
                    <TableCell>
                      <Avatar className="h-12 w-12 rounded-md">
                        <AvatarImage src={listing.image} alt={listing.title} />
                        <AvatarFallback className="rounded-md">
                          {listing.title.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium leading-none line-clamp-1">{listing.title}</p>
                        <p className="text-sm text-muted-foreground">{listing.category}</p>
                        <p className="text-xs text-muted-foreground">{listing.location}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {getTypeBadge(listing.isService)}
                    </TableCell>
                    <TableCell className="text-center">{listing.viewsCount.toLocaleString()}</TableCell>
                    <TableCell className="text-center">
                      {formatRating(listing.rating, listing.ratingCount)}
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      {formatPrice(listing.price)}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col gap-1">
                        {getStatusBadge(status)}
                        {listing.isPromoted && (
                          <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-800">
                            Promoted
                          </Badge>
                        )}
                        {listing.isFeatured && (
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-800">
                            Featured
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {onView && (
                            <>
                              <DropdownMenuItem onClick={() => onView(listing.id)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                            </>
                          )}
                          <DropdownMenuItem onClick={() => onEdit?.(listing.id)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onToggleStatus?.(listing.id)}>
                            {status === 'published' ? (
                              <>
                                <Pause className="mr-2 h-4 w-4" />
                                Pause
                              </>
                            ) : (
                              <>
                                <Play className="mr-2 h-4 w-4" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => onDelete?.(listing.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}