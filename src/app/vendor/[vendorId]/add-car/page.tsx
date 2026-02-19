"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  MoreVertical,
  Eye,
  Trash2,
  Edit2,
  CarFront,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Interface matching your Car Model structure
interface ICar {
  _id: string;
  bodyType?: string;
  title: string;
  price: number;
  featured?: boolean;
  specs?: {
    make?: string;
    model?: string;
    year?: number;
    color?: string;
  };
  // Add other fields as needed
  status?: string;
  images?: string[];
}

export default function VendorCarsPage() {
  const router = useRouter();
  const { vendorId } = useParams();
  const [cars, setCars] = useState<ICar[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch Cars on Mount
  useEffect(() => {
    const fetchCars = async () => {
      try {
        const { data } = await axios.get("/api/vend-cars");
        console.log("Fetched cars:", data.cars);
        setCars(data.cars);
      } catch (error) {
        console.error("Failed to load cars", error);
        toast.error("Failed to load your inventory");
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, []);

  // Handle Delete (Example)
  const handleDelete = async (carId: string) => {
    if (!confirm("Are you sure you want to delete this car?")) return;

    try {
      // Create DELETE route at /api/cars/[id]
      await axios.delete(`/api/vend-cars/${carId}`);
      setCars((prev) => prev.filter((c) => c._id !== carId));
      toast.success("Car deleted successfully");
    } catch (error) {
      toast.error("Failed to delete car");
    }
  };

  // Filter Cars
  const filteredCars = cars.filter(
    (car) =>
      car.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      car.specs?.make?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground mt-1">
            Manage your vehicle listings ({cars.length})
          </p>
        </div>
        <Link href={`/vendor/${vendorId}/add-car/new-car/new-car`}>
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> Add Vehicle
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title or make..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredCars.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {searchQuery
                ? "No cars found matching your search."
                : "No cars listed yet."}
            </div>
          ) : (
            <div className="space-y-3">
              {/* Header Row - Updated Grid Columns */}
              <div className="grid grid-cols-[80px_2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                <span>Image</span>
                <span>Make & Model</span>
                <span>Year</span>
                <span>Price</span>
                <span>Status</span>
                <span className="text-center">Featured</span>
                <span className="text-right">Actions</span>
              </div>

              {filteredCars.map((car) => (
                <div
                  key={car._id}
                  className="grid grid-cols-[80px_2fr_1fr_1fr_1fr_1fr_auto] items-center gap-4 p-3 rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-all group"
                >
                  {/* Image Column */}
                  <div className="h-14 w-20 rounded-lg bg-muted flex items-center justify-center overflow-hidden border">
                    {car.images && car.images.length > 0 ? (
                      <Image
                        src={car.images[0]}
                        alt={car.title}
                        width={80}
                        height={56}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <CarFront className="h-6 w-6 text-muted-foreground/50" />
                    )}
                  </div>

                  {/* Make & Model Column */}
                  <div className="flex flex-col min-w-0">
                    <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors truncate">
                      {car.specs?.make || "Unknown"} {car.specs?.model}
                    </h3>
                    <p
                      className="text-xs text-muted-foreground truncate"
                      title={car.title}
                    >
                      {car.title}
                    </p>
                  </div>

                  {/* Year Column */}
                  <div className="text-sm font-medium">
                    {car.specs?.year || "N/A"}
                  </div>

                  {/* Price Column */}
                  <div className="font-bold text-sm">
                    ${car.price.toLocaleString()}
                  </div>

                  {/* Status Column (Placeholder) */}
                  <div>
                    <Badge
                      variant="outline"
                      className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900"
                    >
                      Available
                    </Badge>
                  </div>

                  {/* Featured Column (Icon) */}
                  <div className="flex justify-center">
                    {car.featured ? (
                      <div className="bg-amber-100 dark:bg-amber-900/30 p-1.5 rounded-full text-amber-600 dark:text-amber-400">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 4.427 1.102 6.617c.225 1.335-1.317 2.227-2.31 1.6l-4.577-2.77-4.577 2.77c-.993.627-2.535-.265-2.31-1.6l1.102-6.617-4.117-4.427c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    ) : (
                      <span className="text-muted-foreground/30">-</span>
                    )}
                  </div>

                  {/* Actions Column */}
                  <div className="flex justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-muted"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Manage Vehicle</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <Link href={`/cars/${car._id}`} target="_blank">
                          <DropdownMenuItem className="cursor-pointer">
                            <Eye className="mr-2 h-4 w-4 text-muted-foreground" />{" "}
                            View Live
                          </DropdownMenuItem>
                        </Link>
                        <Link
                          href={`/vendor/${vendorId}/add-car/new-car/${car._id}`}
                        >
                          <DropdownMenuItem className="cursor-pointer">
                            <Edit2 className="mr-2 h-4 w-4 text-muted-foreground" />{" "}
                            Edit Details
                          </DropdownMenuItem>
                        </Link>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/50 cursor-pointer"
                          onClick={() => handleDelete(car._id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete Listing
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
