// VendorProfile.tsx
import { useState, useEffect, useRef } from "react";
import VendorLayout from "@/components/vendor/VendorLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/service/authService";
import type { AuthResponse, UserProfileUpdate } from "@/types/auth";
import ProfileInformation from "@/components/vendor/ProfileInformation";
import ChangePassword from "@/components/vendor/ChangePassword";

const VendorProfile = () => {
  const { updateProfilePartial, changePassword, isLoading } = useAuth();
  const [user, setUser] = useState<AuthResponse | null>(null);
  const [initialLoad, setInitialLoad] = useState(true);

  const profileImageRef = useRef<HTMLInputElement>(null);
  const businessImageRef = useRef<HTMLInputElement>(null);

  const [profileData, setProfileData] = useState<UserProfileUpdate>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    business_name: "",
    business_description: "",
  });

  const [originalProfileData, setOriginalProfileData] = useState<UserProfileUpdate>({});
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [businessImagePreview, setBusinessImagePreview] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedUser = authService.getStoredUser();
        if (storedUser) {
          setUser(storedUser);
          const userData = {
            first_name: storedUser.first_name || "",
            last_name: storedUser.last_name || "",
            email: storedUser.email || "",
            phone: storedUser.phone || "",
            business_name: storedUser.business_name || "",
            business_description: storedUser.business_description || "",
          };
          setProfileData(userData);
          setOriginalProfileData(userData);
          setInitialLoad(false);
          return;
        }
        const freshUser = await authService.getCurrentUser();
        setUser(freshUser);
        const userData = {
          first_name: freshUser.first_name || "",
          last_name: freshUser.last_name || "",
          email: freshUser.email || "",
          phone: freshUser.phone || "",
          business_name: freshUser.business_name || "",
          business_description: freshUser.business_description || "",
        };
        setProfileData(userData);
        setOriginalProfileData(userData);
        setInitialLoad(false);
      } catch (error) {
        toast.error("Failed to load profile data");
        setInitialLoad(false);
      }
    };
    loadUserData();
  }, []);

  if (initialLoad) {
    return (
      <VendorLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading profile...</span>
          </div>
        </div>
      </VendorLayout>
    );
  }

  if (!user) {
    return (
      <VendorLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h2>
            <p className="text-muted-foreground">Unable to load your profile information.</p>
          </div>
        </div>
      </VendorLayout>
    );
  }

  return (
    <VendorLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">
            Manage your business profile and account settings.
          </p>
        </div>
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profile Information</TabsTrigger>
            <TabsTrigger value="password">Change Password</TabsTrigger>
          </TabsList>
          <TabsContent value="profile">
            <ProfileInformation
              user={user}
              profileData={profileData}
              setProfileData={setProfileData}
              originalProfileData={originalProfileData}
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              isLoading={isLoading}
              updateProfilePartial={updateProfilePartial}
              setOriginalProfileData={setOriginalProfileData}
              profileImagePreview={profileImagePreview}
              setProfileImagePreview={setProfileImagePreview}
              businessImagePreview={businessImagePreview}
              setBusinessImagePreview={setBusinessImagePreview}
              profileImageRef={profileImageRef}
              businessImageRef={businessImageRef}
              hasChanges={hasChanges}
              setHasChanges={setHasChanges}
            />
          </TabsContent>
          <TabsContent value="password">
            <ChangePassword
              passwordData={passwordData}
              setPasswordData={setPasswordData}
              changePassword={changePassword}
              isLoading={isLoading}
            />
          </TabsContent>
        </Tabs>
      </div>
    </VendorLayout>
  );
};

export default VendorProfile;
