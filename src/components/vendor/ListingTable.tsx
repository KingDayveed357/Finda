
import { MoreHorizontal, Edit, Pause, Trash2, Play } from "lucide-react";
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
import type { Listing } from "@/lib/mockData";

interface ListingTableProps {
  listings: Listing[];
  onEdit?: (id: string) => void;
  onToggleStatus?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function ListingTable({ 
  listings, 
  onEdit, 
  onToggleStatus, 
  onDelete 
}: ListingTableProps) {
  const getStatusBadge = (status: Listing['status']) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
      case 'paused':
        return <Badge variant="secondary">Paused</Badge>;
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatPrice = (price: number) => `$${price.toLocaleString()}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Listings</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Thumbnail</TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="text-center">Views</TableHead>
              <TableHead className="text-center">Sales</TableHead>
              <TableHead className="text-center">Price</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {listings.map((listing) => (
              <TableRow key={listing.id}>
                <TableCell>
                  <Avatar className="h-12 w-12 rounded-md">
                    <AvatarImage src={listing.thumbnail} alt={listing.title} />
                    <AvatarFallback className="rounded-md">
                      {listing.title.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p className="font-medium leading-none">{listing.title}</p>
                    <p className="text-sm text-muted-foreground">{listing.category}</p>
                  </div>
                </TableCell>
                <TableCell className="text-center">{listing.views.toLocaleString()}</TableCell>
                <TableCell className="text-center">{listing.sales}</TableCell>
                <TableCell className="text-center font-medium">
                  {formatPrice(listing.price)}
                </TableCell>
                <TableCell className="text-center">
                  {getStatusBadge(listing.status)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit?.(listing.id)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onToggleStatus?.(listing.id)}>
                        {listing.status === 'active' ? (
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
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}