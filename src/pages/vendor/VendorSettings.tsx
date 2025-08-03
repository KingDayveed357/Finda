import { useState } from "react";
import  VendorLayout  from "@/components/vendor/VendorLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Bell, Shield, Globe, Archive } from "lucide-react";

const VendorSettings = () => {
  const [settings, setSettings] = useState({
    // Notification settings
    emailNotifications: true,
    pushNotifications: false,
    orderAlerts: true,
    marketingEmails: false,
    
    // Privacy settings
    profileVisibility: "public",
    showContactInfo: true,
    allowMessaging: true,
    
    // Business settings
    autoApproveOrders: false,
    currency: "USD",
    timezone: "UTC",
    
    // Security settings
    twoFactorAuth: false,
    loginAlerts: true,
  });

  const handleSettingChange = (key: string, value: boolean | string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = () => {
    toast.success("Your settings have been successfully updated.");
  };

  const handleExportData = () => {
    toast.info("Your data export will be ready shortly. You'll receive an email when it's complete.");
  };

  const handleDeleteAccount = () => {
    toast.error("Please contact support to delete your account.");
  };

  return (
    <VendorLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account preferences and business settings.
          </p>
        </div>

        <div className="grid gap-6">
          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <CardTitle>Notifications</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => handleSettingChange("emailNotifications", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive push notifications in your browser
                  </p>
                </div>
                <Switch
                  checked={settings.pushNotifications}
                  onCheckedChange={(checked) => handleSettingChange("pushNotifications", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Order Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when you receive new orders
                  </p>
                </div>
                <Switch
                  checked={settings.orderAlerts}
                  onCheckedChange={(checked) => handleSettingChange("orderAlerts", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Marketing Emails</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive emails about new features and promotions
                  </p>
                </div>
                <Switch
                  checked={settings.marketingEmails}
                  onCheckedChange={(checked) => handleSettingChange("marketingEmails", checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <CardTitle>Privacy & Security</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Profile Visibility</Label>
                  <p className="text-sm text-muted-foreground">
                    Control who can see your business profile
                  </p>
                </div>
                <Select
                  value={settings.profileVisibility}
                  onValueChange={(value) => handleSettingChange("profileVisibility", value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="customers">Customers Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show Contact Information</Label>
                  <p className="text-sm text-muted-foreground">
                    Display your contact details on your profile
                  </p>
                </div>
                <Switch
                  checked={settings.showContactInfo}
                  onCheckedChange={(checked) => handleSettingChange("showContactInfo", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Allow Messaging</Label>
                  <p className="text-sm text-muted-foreground">
                    Let customers send you direct messages
                  </p>
                </div>
                <Switch
                  checked={settings.allowMessaging}
                  onCheckedChange={(checked) => handleSettingChange("allowMessaging", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Switch
                  checked={settings.twoFactorAuth}
                  onCheckedChange={(checked) => handleSettingChange("twoFactorAuth", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Login Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified of new login attempts
                  </p>
                </div>
                <Switch
                  checked={settings.loginAlerts}
                  onCheckedChange={(checked) => handleSettingChange("loginAlerts", checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Business Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Globe className="h-5 w-5" />
                <CardTitle>Business Settings</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-approve Orders</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically approve incoming orders
                  </p>
                </div>
                <Switch
                  checked={settings.autoApproveOrders}
                  onCheckedChange={(checked) => handleSettingChange("autoApproveOrders", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Currency</Label>
                  <p className="text-sm text-muted-foreground">
                    Default currency for your listings
                  </p>
                </div>
                <Select
                  value={settings.currency}
                  onValueChange={(value) => handleSettingChange("currency", value)}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="CAD">CAD</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Timezone</Label>
                  <p className="text-sm text-muted-foreground">
                    Your business timezone
                  </p>
                </div>
                <Select
                  value={settings.timezone}
                  onValueChange={(value) => handleSettingChange("timezone", value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="EST">EST</SelectItem>
                    <SelectItem value="PST">PST</SelectItem>
                    <SelectItem value="CST">CST</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Data & Account */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Archive className="h-5 w-5" />
                <CardTitle>Data & Account</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Export Data</Label>
                  <p className="text-sm text-muted-foreground">
                    Download a copy of your account data
                  </p>
                </div>
                <Button variant="outline" onClick={handleExportData}>
                  Export
                </Button>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-destructive">Delete Account</Label>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete your account and all data
                  </p>
                </div>
                <Button variant="destructive" onClick={handleDeleteAccount}>
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSaveSettings} className="w-32">
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </VendorLayout>
  );
};

export default VendorSettings;