"use client";

import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, Plus, X, Loader2 } from "lucide-react";
import Link from "next/link";

interface CarFormData {
  title: string;
  price: string;
  transmission: string;
  bodyType: string;
  description: string;
  // Specs (Nested)
  make: string;
  model: string;
  year: string;
  fuelType: string;
  mileage: string;
  color: string;
  // Arrays
  features: string; // Comma separated for input
  tags: string; // Comma separated for input
}

const initialForm: CarFormData = {
  title: "",
  price: "",
  transmission: "Automatic",
  bodyType: "Sedan",
  description: "",
  make: "",
  model: "",
  year: "",
  fuelType: "Petrol",
  mileage: "",
  color: "",
  features: "",
  tags: "",
};

export default function AddCarPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<CarFormData>(initialForm);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // --- Handlers ---

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setImages((prev) => [...prev, ...newFiles]);

      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Upload Images First (If using Cloudinary/S3)
      // Since I don't have your upload logic, I'll simulate uploading
      // and construct the payload. In a real app, you'd upload 'images' state
      // to cloud storage here and get URLs back.

      // For now, I'll assume you might handle base64 or have an upload endpoint.
      // But typically JSON payloads work best with URLs.

      // Construct Payload based on ICar model
      const payload = {
        title: formData.title,
        price: Number(formData.price),
        transmission: formData.transmission,
        bodyType: formData.bodyType,
        description: formData.description,
        images: imagePreviews, // Replace with real URLs in production
        // Nested Specs
        specs: {
          make: formData.make,
          model: formData.model,
          year: Number(formData.year),
          fuelType: formData.fuelType,
          mileage: formData.mileage,
          color: formData.color,
        },
        // Arrays
        features: formData.features
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        tags: formData.tags
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };

      const res = await axios.post("/api/cars", payload);

      if (res.status === 201 || res.status === 200) {
        toast.success("Car added successfully!");
        router.push("/admin/dashboard"); // Redirect usually to list
      }
    } catch (error: any) {
      console.error("Error adding car:", error);
      toast.error(error.response?.data?.error || "Failed to add car");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Add New Vehicle
          </h1>
          <p className="text-muted-foreground">
            Add a new car to your inventory based on standard specs.
          </p>
        </div>
        <Link href="/admin/cars">
          <Button variant="outline">Back to Inventory</Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Core Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Listing Title</Label>
                <Input
                  id="title"
                  name="title"
                  required
                  placeholder="e.g. 2023 Toyota Camry LE"
                  value={formData.title}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  required
                  placeholder="25000"
                  value={formData.price}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Transmission</Label>
                <Select
                  value={formData.transmission}
                  onValueChange={(val) =>
                    handleSelectChange("transmission", val)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Automatic">Automatic</SelectItem>
                    <SelectItem value="Manual">Manual</SelectItem>
                    <SelectItem value="CVT">CVT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Body Type</Label>
                <Select
                  value={formData.bodyType}
                  onValueChange={(val) => handleSelectChange("bodyType", val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sedan">Sedan</SelectItem>
                    <SelectItem value="SUV">SUV</SelectItem>
                    <SelectItem value="Truck">Truck</SelectItem>
                    <SelectItem value="Coupe">Coupe</SelectItem>
                    <SelectItem value="Hatchback">Hatchback</SelectItem>
                    <SelectItem value="Van">Van</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Detailed vehicle description..."
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Technical Specs - Mapped to ISpecs */}
        <Card>
          <CardHeader>
            <CardTitle>Specifications</CardTitle>
            <CardDescription>
              Technical details stored in specs object
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Make</Label>
                <Input
                  name="make"
                  placeholder="Toyota"
                  value={formData.make}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label>Model</Label>
                <Input
                  name="model"
                  placeholder="Camry"
                  value={formData.model}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label>Year</Label>
                <Input
                  name="year"
                  type="number"
                  placeholder="2023"
                  value={formData.year}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Fuel Type</Label>
                <Select
                  value={formData.fuelType}
                  onValueChange={(val) => handleSelectChange("fuelType", val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Petrol">Petrol</SelectItem>
                    <SelectItem value="Diesel">Diesel</SelectItem>
                    <SelectItem value="Electric">Electric</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Mileage</Label>
                <Input
                  name="mileage"
                  placeholder="e.g. 15,000 km"
                  value={formData.mileage}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label>Color</Label>
                <Input
                  name="color"
                  placeholder="e.g. Midnight Black"
                  value={formData.color}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features & Tags */}
        <Card>
          <CardHeader>
            <CardTitle>Features & Metadata</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Features (Comma separated)</Label>
              <Textarea
                name="features"
                placeholder="Bluetooth, Backup Camera, Heated Seats, Navigation"
                value={formData.features}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label>Tags (Comma separated)</Label>
              <Input
                name="tags"
                placeholder="Best Seller, New Arrival, Low Mileage"
                value={formData.tags}
                onChange={handleInputChange}
              />
            </div>
          </CardContent>
        </Card>

        {/* Image Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Vehicle Images</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {imagePreviews.map((src, index) => (
                <div
                  key={index}
                  className="relative group aspect-square rounded-lg overflow-hidden border"
                >
                  <img
                    src={src}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}

              <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                <span className="text-xs text-muted-foreground font-medium">
                  Upload Image
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Link href="/admin/cars">
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={loading} className="min-w-[150px]">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Add Vehicle
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
