import React from 'react';
import { Phone, Mail, Globe, MessageSquare, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { UnifiedListing, Service } from '@/types/listing';
import { useNavigate } from 'react-router-dom';

interface ContactInfo {
  phone?: string;
  email?: string;
  whatsapp?: string;
  website?: string;
  linkedin?: string;
}

interface VendorSidebarProps {
  listing: UnifiedListing;
  contactInfo: ContactInfo;
  isAuthenticated: boolean;
  isCurrentUserVendor: boolean;
  onContactVendor: () => void;
}

export const VendorSidebar: React.FC<VendorSidebarProps> = ({
  listing,
  contactInfo,
  isAuthenticated,
  isCurrentUserVendor,
  // onContactVendor
}) => {
  const navigate = useNavigate();
    const handleRedirectToVendorProfile = () => {
        navigate('/messages')
    }
  
  return (
    <div className="space-y-6">
      {/* Vendor Info */}
      <Card>
        <CardHeader>
          <CardTitle>
            {listing.isService ? 'Service Provider' : 'Vendor'} Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-3 mb-4">
            <Avatar className="w-12 h-12">
              <AvatarImage src={listing.vendor?.image} alt={listing.vendor?.name} />
              <AvatarFallback>{listing.vendor?.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{listing.vendor?.name}</h3>
              <div className="flex items-center">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                <span className="text-sm">{(listing.vendor?.rating || 0).toFixed(1)} rating</span>
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="space-y-2 text-sm text-gray-600">
            <div>Views: {(listing.originalData as any).views_count || 0}</div>
            {listing.isService && (
              <div>Contacts: {(listing.originalData as Service).contacts_count || 0}</div>
            )}
            <div>Member since: {new Date((listing.originalData as any).created_at || Date.now()).getFullYear()}</div>
            {listing.isService && (listing.originalData as Service).response_time && (
              <div>Response time: {(listing.originalData as Service).response_time}</div>
            )}

             
          </div>

          {/* Contact Information */}
          {(contactInfo.phone || contactInfo.email || contactInfo.whatsapp) && (
            <>
              <Separator className="my-4" />
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">Contact Info</h4>
                {contactInfo.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    {contactInfo.phone}
                  </div>
                )}
                {contactInfo.email && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    {contactInfo.email}
                  </div>
                )}
                {contactInfo.whatsapp && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    WhatsApp: {contactInfo.whatsapp}
                  </div>
                )}
                {contactInfo.website && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Globe className="h-4 w-4 mr-2" />
                    <a href={contactInfo.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      Website
                    </a>
                  </div>
                )}
                {contactInfo.linkedin && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Globe className="h-4 w-4 mr-2" />
                    <a href={contactInfo.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      LinkedIn
                    </a>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Contact Actions - Hidden if current user is the vendor */}
      {!isCurrentUserVendor && (
        <Card>
          <CardContent className="pt-6">
            {!isAuthenticated && (
              <Alert className="mb-4">
                <AlertDescription>
                  <Link to="/auth/signup" className="text-blue-600 hover:underline">
                    Sign up
                  </Link> to contact {listing.isService ? 'service providers' : 'vendors'}
                </AlertDescription>
              </Alert>
            )}
            <div className="space-y-3">
              <Button 
                className="w-full" 
                onClick={handleRedirectToVendorProfile}
                disabled={!isAuthenticated}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Contact {listing.isService ? 'Provider' : 'Vendor'}
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                disabled={!isAuthenticated}
              >
                {listing.isService ? 'Request Quote' : 'Add to Cart'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Safety Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Safety Tips</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Always verify {listing.isService ? 'provider' : 'vendor'} credentials</li>
            <li>• Meet in public places for local transactions</li>
            <li>• Use secure payment methods</li>
            <li>• Report suspicious activity</li>
            {listing.isService && <li>• Request portfolio or previous work samples</li>}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};