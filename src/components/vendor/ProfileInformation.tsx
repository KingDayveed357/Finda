// ProfileInformation.tsx
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { AuthResponse, UserProfileUpdate } from "@/types/auth";
import type { ChangeEvent } from "react";

interface Props {
  user: AuthResponse;
  profileData: UserProfileUpdate;
  setProfileData: (data: UserProfileUpdate) => void;
  originalProfileData: UserProfileUpdate;
  setOriginalProfileData: (data: UserProfileUpdate) => void;
  isEditing: boolean;
  setIsEditing: (edit: boolean) => void;
  isLoading: boolean;
  updateProfilePartial: (fields: Partial<UserProfileUpdate>) => Promise<AuthResponse>;
  profileImagePreview: string | null;
  setProfileImagePreview: (url: string | null) => void;
  businessImagePreview: string | null;
  setBusinessImagePreview: (url: string | null) => void;
  profileImageRef: React.RefObject<HTMLInputElement | null> ;
  businessImageRef: React.RefObject<HTMLInputElement | null> ;
  hasChanges: boolean;
  setHasChanges: (change: boolean) => void;
}

const ProfileInformation = ({
  user,
  profileData,
  setProfileData,
  originalProfileData,
  setOriginalProfileData,
  isEditing,
  setIsEditing,
  isLoading,
  // updateProfilePartial,
  profileImagePreview,
  setProfileImagePreview,
  businessImagePreview,
  setBusinessImagePreview,
  profileImageRef,
  businessImageRef,
  hasChanges,
  setHasChanges,
}: Props) => {
  const handleProfileChange = (field: keyof UserProfileUpdate, value: string) => {
    setProfileData({ ...profileData, [field]: value });
    setHasChanges(true);
  };

  const handleImageChange = (
    e: ChangeEvent<HTMLInputElement>,
    type: "profile" | "business"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
            setProfileData({
        ...profileData,
        [type === "profile" ? "profile" : "business_image"]: file,
        });

      setHasChanges(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (type === "profile") {
          setProfileImagePreview(result);
        } else {
          setBusinessImagePreview(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const getChangedFields = (): Partial<UserProfileUpdate> => {
    const changes: Partial<UserProfileUpdate> = {};
    Object.keys(profileData).forEach((key) => {
      const k = key as keyof UserProfileUpdate;
      if (profileData[k] !== originalProfileData[k]) changes[k] = profileData[k] as any;
    });
    return changes;
  };

  const handleSaveProfile = async () => {
    try {
      const changedFields = getChangedFields();
      if (
        Object.keys(changedFields).length === 0 &&
        !profileImagePreview &&
        !businessImagePreview
      ) {
        toast.info("No changes to save.");
        setIsEditing(false);
        return;
      }
      // const updatedUser = await updateProfilePartial(changedFields);
      setOriginalProfileData(profileData);
      setIsEditing(false);
      setHasChanges(false);
      setProfileImagePreview(null);
      setBusinessImagePreview(null);
      toast.success("Your profile has been updated.");
    } catch (err) {
      toast.error("Failed to update profile.");
    }
  };

  const handleCancel = () => {
    setProfileData(originalProfileData);
    setIsEditing(false);
    setHasChanges(false);
    setProfileImagePreview(null);
    setBusinessImagePreview(null);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Business Profile</CardTitle>
          <div className="flex space-x-2">
            {isEditing && (
              <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
                Cancel
              </Button>
            )}
            <Button
              variant={isEditing ? "default" : "outline"}
              onClick={() => (isEditing ? handleSaveProfile() : setIsEditing(true))}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...
                </>
              ) : isEditing ? (
                "Save Changes"
              ) : (
                "Edit Profile"
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Image Uploads */}
        <div className="flex items-start space-x-6">
          {/* Profile Photo */}
          <div className="text-center">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage
                  src={profileImagePreview || user.profile}
                  alt="Profile"
                />
                <AvatarFallback>
                  {user.first_name?.[0]}{user.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                  onClick={() => profileImageRef.current?.click()}
                >
                  <Camera className="h-4 w-4" />
                </Button>
              )}
              <input
                ref={profileImageRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(e, "profile")}
                className="hidden"
              />
            </div>
            <p className="text-sm text-muted-foreground mt-2">Profile Photo</p>
          </div>

          {/* Business Logo */}
          <div className="text-center">
            <div className="relative">
              <Avatar className="h-24 w-24 rounded-lg">
                <AvatarImage
                  src={businessImagePreview || user.business_image}
                  alt="Business Logo"
                />
                <AvatarFallback className="rounded-lg">
                  {user.business_name?.substring(0, 2).toUpperCase() || "BL"}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                  onClick={() => businessImageRef.current?.click()}
                >
                  <Camera className="h-4 w-4" />
                </Button>
              )}
              <input
                ref={businessImageRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(e, "business")}
                className="hidden"
              />
            </div>
            <p className="text-sm text-muted-foreground mt-2">Business Logo</p>
          </div>
        </div>

        {/* Editable Fields */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>First Name</Label>
            <Input
              value={profileData.first_name || ""}
              onChange={(e) => handleProfileChange("first_name", e.target.value)}
              disabled={!isEditing}
            />
          </div>
          <div className="space-y-2">
            <Label>Last Name</Label>
            <Input
              value={profileData.last_name || ""}
              onChange={(e) => handleProfileChange("last_name", e.target.value)}
              disabled={!isEditing}
            />
          </div>
          <div className="space-y-2">
            <Label>Business Name</Label>
            <Input
              value={profileData.business_name || ""}
              onChange={(e) => handleProfileChange("business_name", e.target.value)}
              disabled={!isEditing}
            />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={profileData.email || ""}
              onChange={(e) => handleProfileChange("email", e.target.value)}
              disabled={!isEditing}
            />
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input
              value={profileData.phone || ""}
              onChange={(e) => handleProfileChange("phone", e.target.value)}
              disabled={!isEditing}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Business Description</Label>
          <Textarea
            value={profileData.business_description || ""}
            onChange={(e) => handleProfileChange("business_description", e.target.value)}
            disabled={!isEditing}
            rows={4}
            placeholder="Describe your business..."
          />
        </div>

        {isEditing && hasChanges && (
          <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md">
            You have unsaved changes. Click "Save Changes" to apply them.
          </div>
        )}

        {/* Account Info */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium mb-4">Account Information</h3>
          <div className="grid gap-4 md:grid-cols-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Account Type:</span>
              <span className="capitalize font-medium">{user.user_type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">User ID:</span>
              <span className="font-medium">#{user.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Member Since:</span>
              <span className="font-medium">
                {new Date(user.date_joined).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileInformation;
