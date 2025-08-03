// ChangePassword.tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useState } from "react";

interface Props {
  passwordData: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  };
  setPasswordData: React.Dispatch<
    React.SetStateAction<{
      currentPassword: string;
      newPassword: string;
      confirmPassword: string;
    }>
  >;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  isLoading: boolean;
}

const ChangePassword = ({
  passwordData,
  setPasswordData,
  changePassword,
  isLoading,
}: Props) => {
  const [formSubmitting, setFormSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = passwordData;

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    try {
      setFormSubmitting(true);
      await changePassword(currentPassword, newPassword);
      toast.success("Password updated successfully.");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      toast.error(error?.message || "Failed to change password.");
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="currentPassword">Current Password</Label>
          <Input
            type="password"
            name="currentPassword"
            value={passwordData.currentPassword}
            onChange={handleChange}
            id="currentPassword"
            disabled={formSubmitting || isLoading}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="newPassword">New Password</Label>
          <Input
            type="password"
            name="newPassword"
            value={passwordData.newPassword}
            onChange={handleChange}
            id="newPassword"
            disabled={formSubmitting || isLoading}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <Input
            type="password"
            name="confirmPassword"
            value={passwordData.confirmPassword}
            onChange={handleChange}
            id="confirmPassword"
            disabled={formSubmitting || isLoading}
          />
        </div>
      </div>
      <Button type="submit" disabled={formSubmitting || isLoading}>
        {formSubmitting || isLoading ? "Updating..." : "Update Password"}
      </Button>
    </form>
  );
};

export default ChangePassword;
