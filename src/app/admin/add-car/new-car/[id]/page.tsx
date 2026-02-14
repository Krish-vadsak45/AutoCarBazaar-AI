"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter, useParams } from "next/navigation";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, Plus, X, Loader2, Save } from "lucide-react";
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

export default function CarFormPage() {
  const router = useRouter();
  const params = useParams();

  // Check if we are in "Edit Mode"
  const carId = params?.id as string;
  const isEditMode = carId && carId !== "new-car";

  const [formData, setFormData] = useState<CarFormData>(initialForm);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode); // Loading state for fetching existing data

  // --- 1. Fetch Existing Data (Edit Mode) ---
  useEffect(() => {
    if (isEditMode) {
      const fetchCar = async () => {
        try {
          const { data } = await axios.get(`/api/cars/${carId}`);
          const car = data.car;

          if (car) {
            setFormData({
              title: car.title || "",
              price: String(car.price || ""),
              transmission: car.transmission || "Automatic",
              bodyType: car.bodyType || "Sedan",
              description: car.description || "",
              // Specs
              make: car.specs?.make || "",
              model: car.specs?.model || "",
              year: String(car.specs?.year || ""),
              fuelType: car.specs?.fuelType || "Petrol",
              mileage: car.specs?.mileage || "",
              color: car.specs?.color || "",
              // Arrays -> String
              features: car.features?.join(", ") || "",
              tags: car.tags?.join(", ") || "",
            });

            // Handle existing images
            if (car.images && car.images.length > 0) {
              setImagePreviews(car.images);
            }
          }
        } catch (error) {
          console.error("Failed to fetch car details:", error);
          toast.error("Failed to load car details");
        } finally {
          setFetching(false);
        }
      };

      fetchCar();
    } else {
      setFetching(false);
    }
  }, [carId, isEditMode]);

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
    // Note: In a real app with file uploads, you'd need logic to separate
    // files to delete vs files to keep (existing vs new)
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // --- Submit Handler (Create or Update) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Prepare Payload
      // In production, upload images first -> get URLs -> send URLs in payload
      const payload = {
        title: formData.title,
        price: Number(formData.price),
        transmission: formData.transmission,
        bodyType: formData.bodyType,
        description: formData.description,
        images: imagePreviews, // Assuming URLs are ready (or passed as is for now)
        specs: {
          make: formData.make,
          model: formData.model,
          year: Number(formData.year),
          fuelType: formData.fuelType,
          mileage: formData.mileage,
          color: formData.color,
        },
        features: formData.features
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        tags: formData.tags
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };

      if (isEditMode) {
        // PATCH Request
        await axios.patch(`/api/vend-cars/${carId}`, payload);
        toast.success("Vehicle updated successfully");
      } else {
        // POST Request
        await axios.post("/api/cars", payload);
        toast.success("Vehicle added successfully");
      }

      router.push("/admin/add-car");
      router.refresh();
    } catch (error: any) {
      console.error("Submission error:", error);
      toast.error(error.response?.data?.error || "Failed to save vehicle");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {isEditMode ? "Edit Vehicle" : "Add New Vehicle"}
          </h1>
          <p className="text-muted-foreground">
            {isEditMode
              ? "Update vehicle details and specifications."
              : "Add a new car to your inventory based on standard specs."}
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

        {/* Technical Specs */}
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
          <Link href="/admin/add-car">
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={loading}
            className="min-w-[150px] gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {isEditMode ? "Updating..." : "Saving..."}
              </>
            ) : (
              <>
                {isEditMode ? (
                  <Save className="h-4 w-4" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                {isEditMode ? "Update Vehicle" : "Add Vehicle"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
