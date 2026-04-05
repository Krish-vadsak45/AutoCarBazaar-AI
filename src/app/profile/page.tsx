"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import FileUpload from "@/components/FileUpload";
import { toast } from "react-toastify";
import { Loader2, Lock, User, Mail, Phone, Camera, MapPin } from "lucide-react";
import axios from "axios";

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [image, setImage] = useState("");

  // Password states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (status === "authenticated") {
      fetchUserData();
    } else if (status === "unauthenticated") {
      // Handle redirect or show message
      setLoading(false);
    }
  }, [status]);

  const fetchUserData = async () => {
    try {
      const res = await axios.get("/api/users");
      const data = res.data;
      setUser(data.user);
      setName(data.user.name || "");
      setEmail(data.user.email || "");
      setPhone(data.user.phone || "");
      setAddress(data.user.address || "");
      setImage(data.user.image || "");
    } catch (error) {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await axios.post("/api/users", {
        name,
        phone,
        address,
        image,
      });

      const data = res.data;
      setUser((prev: any) => ({ ...prev, ...data.user }));
      await update({
        ...session,
        user: { ...session?.user, image: data.user.image },
      });
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (user?.hasPassword && !currentPassword) {
      toast.error("Current password is required");
      return;
    }

    setSaving(true);
    try {
      await axios.post("/api/users", {
        currentPassword: user?.hasPassword ? currentPassword : undefined,
        newPassword,
      });

      setUser((prev: any) => ({ ...prev, hasPassword: true })); // User now definitely has password
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to update password");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUploadSuccess = (res: any) => {
    setImage(res.url);
    setUploading(false);
    toast.success("Image uploaded successfully");
  };

  const handleImageUploadProgress = (progress: number) => {
    setUploadProgress(progress);
    if (progress < 100) {
      setUploading(true);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center mt-10">
        Please sign in to view your profile.
      </div>
    );
  }

  return (
    <div className="container mx-auto py-20 px-4 max-w-4xl space-y-8">
      <h1 className="text-3xl font-bold mb-6">Profile Settings</h1>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Base Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              {/* Image Upload Section */}
              <div className="flex flex-col items-center space-y-4">
                <div
                  className="relative group cursor-pointer"
                  onClick={triggerFileInput}
                >
                  <Avatar className="w-32 h-32 border-4 border-background shadow-xl">
                    <AvatarImage src={image} alt={name || "User"} />
                    <AvatarFallback className="text-4xl bg-muted">
                      {name ? (
                        name.charAt(0).toUpperCase()
                      ) : (
                        <User className="w-12 h-12" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                  {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-full">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={triggerFileInput}
                    disabled={uploading}
                  >
                    {uploading
                      ? `Uploading ${uploadProgress}%`
                      : "Change Photo"}
                  </Button>
                  <FileUpload
                    inputRef={fileInputRef}
                    onSuccess={handleImageUploadSuccess}
                    onProgress={handleImageUploadProgress}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    JPG, GIF or PNG. Max size of 10MB.
                  </p>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    value={email}
                    disabled
                    className="pl-9 bg-muted"
                  />
                </div>
                <p className="text-[0.8rem] text-muted-foreground">
                  Email cannot be changed.
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  value={user?.role?.toUpperCase() || "USER"}
                  disabled
                  className="bg-muted font-bold"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-9"
                    placeholder="Enter your name"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-9"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="pl-9"
                    placeholder="Enter your saved address"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={saving || uploading}
                className="w-full"
              >
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Profile
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Security / Password */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="rounded-md bg-blue-50 p-4 border border-blue-100 dark:bg-blue-900/10 dark:border-blue-900/20">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  {user?.hasPassword
                    ? "You have a password set. You can change it below."
                    : "You are logged in via social provider. Set a password to enable email/password login and access vendor features."}
                </p>
              </div>

              {user?.hasPassword && (
                <div className="grid gap-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required={user?.hasPassword}
                  />
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" disabled={saving} variant="secondary">
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {user?.hasPassword ? "Change Password" : "Set Password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
