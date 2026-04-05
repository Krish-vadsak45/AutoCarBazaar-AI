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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Plus, X, Loader2, Save, Sparkles, Wand2 } from "lucide-react";
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

  const [activeTab, setActiveTab] = useState("standard");
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
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

  const handleSmartAdd = async (res: any) => {
    const imageUrl = res.url;
    setIsAnalyzing(true);
    // Add the image to previews early
    if (imagePreviews.length < 5) {
      setImagePreviews((prev) => [...prev, imageUrl]);
    }

    try {
      const response = await axios.post("/api/cars/analyze-image", {
        imageUrl,
      });
      const aiData = response.data;

      // Reset form with extracted values
      reset({
        title: aiData.title || "",
        price: aiData.price || 0,
        transmission: aiData.transmission || "Automatic",
        bodyType: aiData.bodyType || "Sedan",
        description: aiData.description || "",
        specs: {
          make: aiData.specs?.make || "",
          model: aiData.specs?.model || "",
          year: aiData.specs?.year || new Date().getFullYear(),
          fuelType: aiData.specs?.fuelType || "Petrol",
          mileage: aiData.specs?.mileage || "",
          color: aiData.specs?.color || "",
        },
        features: aiData.features?.join(", ") || "",
        tags: aiData.tags?.join(", ") || "",
      });

      toast.success("AI extraction complete! Redirecting to form...");
      setActiveTab("standard");
    } catch (error: any) {
      console.error("Smart Add analysis failed:", error);
      toast.error(
        error.response?.data?.error || "Failed to analyze car details",
      );
    } finally {
      setIsAnalyzing(false);
    }
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
  const aiFileRef = React.useRef<HTMLInputElement>(null);

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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {!isEditMode && (
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="standard" className="gap-2">
              <Wand2 className="h-4 w-4" /> Standard Entry
            </TabsTrigger>
            <TabsTrigger value="smart" className="gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> Smart Add (AI)
            </TabsTrigger>
          </TabsList>
        )}

        <TabsContent value="standard">
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
                      <p className="text-sm text-destructive">
                        {errors.title.message}
                      </p>
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
                      <p className="text-sm text-destructive">
                        {errors.price.message}
                      </p>
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
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
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
                      )}
                    />
                    {errors.transmission && (
                      <p className="text-sm text-destructive">
                        {errors.transmission.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Body Type</Label>
                    <Controller
                      name="bodyType"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
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
                      )}
                    />
                    {errors.bodyType && (
                      <p className="text-sm text-destructive">
                        {errors.bodyType.message}
                      </p>
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
                    <p className="text-sm text-destructive">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="carAddress">Car Location (Address)</Label>
                  <Input
                    id="carAddress"
                    {...register("carAddress")}
                    placeholder="Enter single line address (e.g. 123 Main St, Mumbai, Maharashtra 400001)"
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave blank to use your default vendor location.
                  </p>
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
                    <Input {...register("specs.make")} placeholder="Toyota" />
                    {errors.specs?.make?.message && (
                      <p className="text-sm text-destructive">
                        {errors.specs.make.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Model</Label>
                    <Input {...register("specs.model")} placeholder="Camry" />
                    {errors.specs?.model?.message && (
                      <p className="text-sm text-destructive">
                        {errors.specs.model.message}
                      </p>
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
                      <p className="text-sm text-destructive">
                        {errors.specs.year.message}
                      </p>
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
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
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
                      )}
                    />
                    {errors.specs?.fuelType?.message && (
                      <p className="text-sm text-destructive">
                        {errors.specs.fuelType.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Mileage</Label>
                    <Input
                      {...register("specs.mileage")}
                      placeholder="e.g. 15,000 km"
                    />
                    {errors.specs?.mileage?.message && (
                      <p className="text-sm text-destructive">
                        {errors.specs.mileage.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Color</Label>
                    <Input
                      {...register("specs.color")}
                      placeholder="e.g. Midnight Black"
                    />
                    {errors.specs?.color?.message && (
                      <p className="text-sm text-destructive">
                        {errors.specs.color.message}
                      </p>
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
        </TabsContent>

        {!isEditMode && (
          <TabsContent value="smart">
            <Card className="border-2 border-dashed border-primary/20 bg-primary/5">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                  <Sparkles className="h-6 w-6 text-primary" /> Smart Add with
                  AI
                </CardTitle>
                <CardDescription>
                  Upload a single photo of the car. Our AI will automatically
                  extract specs, features, and descriptions for you.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-12">
                {isAnalyzing ? (
                  <div className="flex flex-col items-center gap-4 text-center">
                    <div className="relative">
                      <div className="h-24 w-24 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                      <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-primary animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">
                        Analyzing your car...
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Extracting technical specs and features using Gemini AI
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="w-full max-w-md">
                    <div
                      className="group cursor-pointer flex flex-col items-center justify-center p-12 border-2 border-dashed border-primary/30 rounded-xl hover:bg-primary/10 transition-all"
                      onClick={() => aiFileRef.current?.click()}
                    >
                      <FileUpload
                        inputRef={aiFileRef}
                        onSuccess={handleSmartAdd}
                        onProgress={() => setIsAnalyzing(true)}
                      />
                      <div className="bg-primary/10 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                        <Upload className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-lg font-medium mb-1">
                        Select Car Image
                      </h3>
                      <p className="text-sm text-muted-foreground text-center">
                        Upload a front or side view of the vehicle for best
                        results.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                {
                  title: "Instant Extraction",
                  desc: "Gets Year, Make, Model & Color automatically.",
                },
                {
                  title: "Feature Detection",
                  desc: "Identifies Sunroof, Alloys, and exterior features.",
                },
                {
                  title: "Smart Tags",
                  desc: "Categorizes your car for better search visibility.",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="p-4 rounded-lg bg-muted/50 border flex gap-3"
                >
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-primary">
                      {i + 1}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">{item.title}</h4>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
