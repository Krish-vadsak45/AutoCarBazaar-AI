"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-toastify";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import FileUpload, { FileUploadRef } from "@/components/FileUpload";
import { carSchema, CarFormValues } from "@/lib/validations/car";

export default function CarFormPage() {
  const router = useRouter();
  const params = useParams();
  const vendorId = params?.vendorId;

  // Check if we are in "Edit Mode"
  const carId = params?.id as string;
  const isEditMode = carId && carId !== "new-car";

  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const uploadRef = React.useRef<FileUploadRef>(null);
  const [fetching, setFetching] = useState(isEditMode); // Loading state for fetching existing data

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CarFormValues>({
    resolver: zodResolver(carSchema) as any,
    defaultValues: {
      title: "",
      price: 0,
      transmission: "Automatic",
      bodyType: "Sedan",
      description: "",
      specs: {
        make: "",
        model: "",
        year: new Date().getFullYear(),
        fuelType: "Petrol",
        mileage: "",
        color: "",
      },
      features: "",
      tags: "",
    },
  });

  // --- 1. Fetch Existing Data (Edit Mode) ---
  useEffect(() => {
    if (isEditMode) {
      const fetchCar = async () => {
        try {
          const { data } = await axios.get(`/api/cars/${carId}`);
          const car = data.car;

          if (car) {
            reset({
              title: car.title || "",
              price: car.price || 0,
              transmission: car.transmission || "Automatic",
              bodyType: car.bodyType || "Sedan",
              description: car.description || "",
              specs: {
                make: car.specs?.make || "",
                model: car.specs?.model || "",
                year: car.specs?.year || new Date().getFullYear(),
                fuelType: car.specs?.fuelType || "Petrol",
                mileage: car.specs?.mileage || "",
                color: car.specs?.color || "",
              },
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
  }, [carId, isEditMode, reset]);

  // --- Handlers ---

  const handleUploadSuccess = (res: any) => {
    if (imagePreviews.length >= 5) {
      toast.error("You can only upload up to 5 images");
      setIsUploading(false);
      return;
    }
    setImagePreviews((prev) => [...prev, res.url]);
    setIsUploading(false);
    toast.success("Image uploaded successfully");
  };

  const handleUploadProgress = (progress: number) => {
    setIsUploading(true);
  };

  const removeImage = (index: number) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // --- Submit Handler (Create or Update) ---
  const onSubmit = async (data: CarFormValues) => {
    setLoading(true);

    try {
      // 1. Prepare Payload (Zod handles transform for features/tags)
      const payload = {
        ...data,
        images: imagePreviews,
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

      router.push(`/vendor/${vendorId}/add-car`);
      router.refresh();
    } catch (error: any) {
      console.error("Submission error:", error);
      toast.error(error.response?.data?.error || "Failed to save vehicle");
    } finally {
      setLoading(false);
    }
  };

  const fileRef = React.useRef<HTMLInputElement>(null);

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
        <Link href={`/vendor/${params?.vendorId}/add-car`}>
          <Button variant="outline">Back to Inventory</Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
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
                  {...register("title")}
                  placeholder="e.g. 2023 Toyota Camry LE"
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  {...register("price")}
                  placeholder="25000"
                />
                {errors.price && (
                  <p className="text-sm text-destructive">{errors.price.message}</p>
                )}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Transmission</Label>
                <Controller
                  name="transmission"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Automatic">Automatic</SelectItem>
                        <SelectItem value="Manual">Manual</SelectItem>
                        <SelectItem value="CVT">CVT</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.transmission && (
                  <p className="text-sm text-destructive">{errors.transmission.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Body Type</Label>
                <Controller
                  name="bodyType"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
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
                  )}
                />
                {errors.bodyType && (
                  <p className="text-sm text-destructive">{errors.bodyType.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Detailed vehicle description..."
                rows={4}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
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
                  {...register("specs.make")}
                  placeholder="Toyota"
                />
                {errors.specs?.make?.message && (
                  <p className="text-sm text-destructive">{errors.specs.make.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Model</Label>
                <Input
                  {...register("specs.model")}
                  placeholder="Camry"
                />
                {errors.specs?.model?.message && (
                  <p className="text-sm text-destructive">{errors.specs.model.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Year</Label>
                <Input
                  type="number"
                  {...register("specs.year")}
                  placeholder="2023"
                />
                {errors.specs?.year?.message && (
                  <p className="text-sm text-destructive">{errors.specs.year.message}</p>
                )}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Fuel Type</Label>
                <Controller
                  name="specs.fuelType"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
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
                  )}
                />
                {errors.specs?.fuelType?.message && (
                  <p className="text-sm text-destructive">{errors.specs.fuelType.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Mileage</Label>
                <Input
                  {...register("specs.mileage")}
                  placeholder="e.g. 15,000 km"
                />
                {errors.specs?.mileage?.message && (
                  <p className="text-sm text-destructive">{errors.specs.mileage.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Color</Label>
                <Input
                  {...register("specs.color")}
                  placeholder="e.g. Midnight Black"
                />
                {errors.specs?.color?.message && (
                  <p className="text-sm text-destructive">{errors.specs.color.message}</p>
                )}
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
                {...register("features")}
                placeholder="Bluetooth, Backup Camera, Heated Seats, Navigation"
              />
            </div>
            <div className="space-y-2">
              <Label>Tags (Comma separated)</Label>
              <Input
                {...register("tags")}
                placeholder="Best Seller, New Arrival, Low Mileage"
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

              {!isUploading && imagePreviews.length < 5 ? (
                <div className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-muted-foreground/25 rounded-lg hover:bg-muted/50 transition-colors relative">
                  <FileUpload
                    inputRef={fileRef}
                    onSuccess={handleUploadSuccess}
                    onProgress={handleUploadProgress}
                  />
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer"
                    onClick={() => fileRef.current?.click()}
                  >
                    <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                    <span className="text-xs text-muted-foreground font-medium text-center px-2">
                      Upload Image (to ImageKit)
                    </span>
                  </div>
                </div>
              ) : isUploading ? (
                <div className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-primary/30 rounded-lg bg-primary/5 animate-pulse">
                  <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
                  <span className="text-xs text-primary font-medium">
                    Uploading...
                  </span>
                </div>
              ) : null}
            </div>
            <div className="flex justify-between items-center">
              {imagePreviews.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">
                  * Upload at least one image for better visibility
                </p>
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  {imagePreviews.length}/5 images uploaded
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Link href={`/vendor/${params?.vendorId}/add-car`}>
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
