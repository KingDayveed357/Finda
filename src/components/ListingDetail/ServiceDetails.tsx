import React from 'react';
import { Clock, MapPin as LocationIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import type { Service } from '@/types/listing';

interface ServiceDetailsProps {
  service: Service;
}

export const ServiceDetails: React.FC<ServiceDetailsProps> = ({ service }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {service.provider_name && (
            <div>
              <h4 className="font-semibold text-gray-900">Provider Name</h4>
              <p className="text-gray-600">{service.provider_name}</p>
            </div>
          )}

          {service.provider_title && (
            <div>
              <h4 className="font-semibold text-gray-900">Provider Title</h4>
              <p className="text-gray-600">{service.provider_title}</p>
            </div>
          )}
          
          {service.provider_experience && (
            <div>
              <h4 className="font-semibold text-gray-900">Experience</h4>
              <p className="text-gray-600">{service.provider_experience}</p>
            </div>
          )}
          
          {service.response_time && (
            <div>
              <h4 className="font-semibold text-gray-900">Response Time</h4>
              <p className="text-gray-600 flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {service.response_time}
              </p>
            </div>
          )}
          
          {service.availability && (
            <div>
              <h4 className="font-semibold text-gray-900">Availability</h4>
              <p className="text-gray-600">{service.availability}</p>
            </div>
          )}

          {service.price_type && (
            <div>
              <h4 className="font-semibold text-gray-900">Price Type</h4>
              <p className="text-gray-600 capitalize">{service.price_type}</p>
            </div>
          )}
        </div>

        {service.provider_bio && (
          <div>
            <h4 className="font-semibold text-gray-900">About Provider</h4>
            <p className="text-gray-600">{service.provider_bio}</p>
          </div>
        )}

        {service.provider_expertise && (
          <div>
            <h4 className="font-semibold text-gray-900">Expertise</h4>
            <p className="text-gray-600">{service.provider_expertise}</p>
          </div>
        )}

        {service.provider_certifications && (
          <div>
            <h4 className="font-semibold text-gray-900">Certifications</h4>
            <p className="text-gray-600">{service.provider_certifications}</p>
          </div>
        )}

        {service.provider_languages && (
          <div>
            <h4 className="font-semibold text-gray-900">Languages</h4>
            <p className="text-gray-600">{service.provider_languages}</p>
          </div>
        )}

        {service.serves_remote && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 flex items-center">
              <LocationIcon className="h-4 w-4 mr-2" />
              Remote Service Available
            </h4>
            <p className="text-blue-700 text-sm mt-1">
              This service provider offers remote services
              {service.service_radius && ` within ${service.service_radius}km`}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
