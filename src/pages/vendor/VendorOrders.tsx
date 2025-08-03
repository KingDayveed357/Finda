import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Package, 
  MoreHorizontal, 
  Search, 
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  DollarSign,
  Calendar
} from "lucide-react";
import { toast } from "sonner";
import  VendorLayout  from "@/components/vendor/VendorLayout";

const mockOrders = [
  {
    id: "ORD-001",
    customer: {
      name: "John Doe",
      email: "john@example.com",
      avatar: "/placeholder.svg"
    },
    service: "Professional Logo Design",
    amount: 299,
    status: "in_progress",
    priority: "high",
    createdAt: "2024-01-15",
    deadline: "2024-01-22"
  },
  {
    id: "ORD-002", 
    customer: {
      name: "Sarah Smith",
      email: "sarah@example.com",
      avatar: "/placeholder.svg"
    },
    service: "Website Development",
    amount: 1299,
    status: "pending",
    priority: "medium",
    createdAt: "2024-01-14",
    deadline: "2024-02-15"
  },
  {
    id: "ORD-003",
    customer: {
      name: "Mike Johnson",
      email: "mike@example.com", 
      avatar: "/placeholder.svg"
    },
    service: "Social Media Package",
    amount: 599,
    status: "completed",
    priority: "low",
    createdAt: "2024-01-10",
    deadline: "2024-01-20"
  },
  {
    id: "ORD-004",
    customer: {
      name: "Emma Wilson",
      email: "emma@example.com",
      avatar: "/placeholder.svg"
    },
    service: "SEO Consultation",
    amount: 199,
    status: "cancelled",
    priority: "low",
    createdAt: "2024-01-08",
    deadline: "2024-01-15"
  }
];

const VendorOrders = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const handleUpdateStatus = (orderId: string, newStatus: string) => {
    toast.success(`Order ${orderId} status updated to ${newStatus}`);
  };

  const handleViewDetails = (orderId: string) => {
    toast.info(`Opening details for order ${orderId}`);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "secondary" as const, icon: Clock, text: "Pending" },
      in_progress: { variant: "default" as const, icon: Truck, text: "In Progress" },
      completed: { variant: "default" as const, icon: CheckCircle, text: "Completed" },
      cancelled: { variant: "destructive" as const, icon: XCircle, text: "Cancelled" }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className={status === "completed" ? "bg-green-100 text-green-800" : ""}>
        <Icon className="h-3 w-3 mr-1" />
        {config.text}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      high: { className: "bg-red-100 text-red-800", text: "High" },
      medium: { className: "bg-yellow-100 text-yellow-800", text: "Medium" },
      low: { className: "bg-gray-100 text-gray-800", text: "Low" }
    };

    const config = priorityConfig[priority as keyof typeof priorityConfig];
    return (
      <Badge variant="secondary" className={config.className}>
        {config.text}
      </Badge>
    );
  };

  const filteredOrders = mockOrders.filter(order => {
    const matchesSearch = order.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === "all") return matchesSearch;
    return matchesSearch && order.status === activeTab;
  });

  const orderStats = {
    total: mockOrders.length,
    pending: mockOrders.filter(o => o.status === "pending").length,
    in_progress: mockOrders.filter(o => o.status === "in_progress").length,
    completed: mockOrders.filter(o => o.status === "completed").length,
    revenue: mockOrders.reduce((sum, o) => o.status === "completed" ? sum + o.amount : sum, 0)
  };

  return (
    <VendorLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
            <p className="text-muted-foreground">
              Manage and track your customer orders.
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold">{orderStats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{orderStats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold">{orderStats.in_progress}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{orderStats.completed}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Revenue</p>
                  <p className="text-2xl font-bold">${orderStats.revenue}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
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

        {/* Orders Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Orders</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="in_progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <Card key={order.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={order.customer.avatar} alt={order.customer.name} />
                          <AvatarFallback>
                            {order.customer.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{order.id}</h3>
                            {getStatusBadge(order.status)}
                            {getPriorityBadge(order.priority)}
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            {order.customer.name} • {order.customer.email}
                          </p>
                          <p className="font-medium">{order.service}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">${order.amount}</p>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            Due: {new Date(order.deadline).toLocaleDateString()}
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetails(order.id)}>
                              View Details
                            </DropdownMenuItem>
                            {order.status === "pending" && (
                              <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, "in_progress")}>
                                Start Work
                              </DropdownMenuItem>
                            )}
                            {order.status === "in_progress" && (
                              <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, "completed")}>
                                Mark Complete
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              onClick={() => handleUpdateStatus(order.id, "cancelled")}
                              className="text-destructive"
                            >
                              Cancel Order
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {filteredOrders.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No orders found matching your criteria.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </VendorLayout>
  );
};

export default VendorOrders;