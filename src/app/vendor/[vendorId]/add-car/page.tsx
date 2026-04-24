'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { toast } from 'react-toastify';
import {
  Plus,
  Search,
  MoreVertical,
  Eye,
  Trash2,
  Edit2,
  CarFront,
  ToggleLeft,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Loading from '@/components/Loading';
import { Badge } from '@/components/ui/badge';
import { BulkUploadModal } from '@/components/BulkUploadModal';
import { VIPBadge } from '@/components/VIPBadge';
import { canUseBulkUpload, normalizeVendorPriority } from '@/lib/vip';

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
  const { vendorId } = useParams();
  const [cars, setCars] = useState<ICar[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [vendorPriority, setVendorPriority] = useState(1);
  const bulkUploadLocked = !canUseBulkUpload(vendorPriority);
  const paymentHref = typeof vendorId === 'string' ? `/vendor/${vendorId}/payment` : '/vendor';

  // Fetch Cars + VIP tier on Mount
  useEffect(() => {
    const fetchCars = async () => {
      try {
        const [carsRes, statusRes] = await Promise.all([
          axios.get('/api/vend-cars'),
          axios.get('/api/vendor/status').catch(() => ({ data: {} })),
        ]);
        setCars(carsRes.data.cars);
        setVendorPriority(normalizeVendorPriority(statusRes.data?.priority));
      } catch (error) {
        console.error('Failed to load cars', error);
        toast.error('Failed to load your inventory');
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, []);

  // Handle Delete (Example)
  const handleDelete = async (carId: string) => {
    if (!confirm('Are you sure you want to delete this car?')) {
      return;
    }

    try {
      // Create DELETE route at /api/cars/[id]
      await axios.delete(`/api/vend-cars/${carId}`);
      setCars((prev) => prev.filter((c) => c._id !== carId));
      toast.success('Car deleted successfully');
    } catch (error) {
      console.error('Failed to delete car', error);
      toast.error('Failed to delete car');
    }
  };

  // Handle Toggle Status
  const handleToggleStatus = async (carId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'available' ? 'unavailable' : 'available';
    try {
      await axios.patch(`/api/vend-cars/${carId}`, {
        status: newStatus,
      });
      setCars((prev) => prev.map((c) => (c._id === carId ? { ...c, status: newStatus } : c)));
      toast.success(`Car marked as ${newStatus}`);
    } catch (error) {
      console.error('Failed to update status', error);
      toast.error('Failed to update status');
    }
  };

  // Filter Cars
  const filteredCars = cars.filter(
    (car) =>
      car.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      car.specs?.make?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const refreshInventory = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/vend-cars');
      setCars(data.cars);
    } catch (error) {
      toast.error('Failed to refresh inventory');
      console.error('Failed to refresh inventory', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
            <VIPBadge priority={vendorPriority} />
          </div>
          <p className="text-muted-foreground mt-1">Manage your vehicle listings ({cars.length})</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <BulkUploadModal
            onSuccess={() => refreshInventory()}
            locked={bulkUploadLocked}
            upgradeHref={paymentHref}
          />
          <Link href={`/vendor/${vendorId}/add-car/new-car/new-car`}>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Add Vehicle
            </Button>
          </Link>
        </div>
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
            <Loading />
          ) : filteredCars.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {searchQuery ? 'No cars found matching your search.' : 'No cars listed yet.'}
            </div>
          ) : (
            <>
              {/* Mobile & Tablet Card View */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:hidden gap-4 md:gap-6">
                {filteredCars.map((car) => (
                  <div
                    key={car._id}
                    className="flex flex-col bg-[#141517] dark:bg-[#141517] border border-[#21212B] dark:border-[#21212B] rounded-2xl p-4 shadow-md hover:shadow-xl transition-all relative"
                  >
                    <div className="flex justify-between items-start">
                      <div className="h-[80px] w-[120px] bg-white rounded-xl flex items-center justify-center overflow-hidden shrink-0 border border-white/5 relative">
                        {car.images && car.images.length > 0 ? (
                          <Image
                            src={car.images[0]}
                            alt={car.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <CarFront className="h-8 w-8 text-neutral-300" />
                        )}
                      </div>

                      {/* 3 dots */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-white/70 hover:bg-white/10 hover:text-white -mr-2 -mt-2"
                          >
                            <MoreVertical className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-48 bg-[#1f2023] border-[#2c2d33] text-white"
                        >
                          <DropdownMenuLabel>Manage Vehicle</DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-[#2c2d33]" />
                          <Link href={`/cars/${car._id}`} target="_blank">
                            <DropdownMenuItem className="cursor-pointer focus:bg-white/10 focus:text-white">
                              <Eye className="mr-2 h-4 w-4 text-white/50" /> View Live
                            </DropdownMenuItem>
                          </Link>
                          <Link href={`/vendor/${vendorId}/add-car/new-car/${car._id}`}>
                            <DropdownMenuItem className="cursor-pointer focus:bg-white/10 focus:text-white">
                              <Edit2 className="mr-2 h-4 w-4 text-white/50" /> Edit Details
                            </DropdownMenuItem>
                          </Link>
                          <DropdownMenuItem
                            className="cursor-pointer focus:bg-white/10 focus:text-white"
                            onClick={() => handleToggleStatus(car._id, car.status || 'available')}
                          >
                            <ToggleLeft
                              className={`mr-2 h-4 w-4 ${car.status === 'available' ? 'text-emerald-400' : 'text-white/50'}`}
                            />{' '}
                            Mark as {car.status === 'available' ? 'Unavailable' : 'Available'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-[#2c2d33]" />
                          <DropdownMenuItem
                            className="text-red-400 focus:text-red-400 focus:bg-red-950/50 cursor-pointer"
                            onClick={() => handleDelete(car._id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Listing
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Title & Subtitle */}
                    <div className="mt-4">
                      <h3 className="font-bold text-[20px] text-[#F3F4F6] tracking-tight truncate leading-tight">
                        {car.specs?.make || 'Unknown'} {car.specs?.model}
                      </h3>
                      <p className="text-[#9CA3AF] text-[14px] mt-0.5 truncate">{car.title}</p>
                    </div>

                    {/* 2x2 Details Grid */}
                    <div className="grid grid-cols-2 gap-y-4 gap-x-2 mt-5">
                      {/* Year */}
                      <div className="flex flex-col gap-1">
                        <span className="text-[#9CA3AF] text-[13px] font-medium">Year</span>
                        <span className="font-bold text-[#F3F4F6] text-[16px]">
                          {car.specs?.year || 'N/A'}
                        </span>
                      </div>

                      {/* Price */}
                      <div className="flex flex-col gap-1">
                        <span className="text-[#9CA3AF] text-[13px] font-medium">Price</span>
                        <span className="font-bold text-[#f97316] text-[16px] tracking-tight">
                          ${car.price.toLocaleString()}
                        </span>
                      </div>

                      {/* Status */}
                      <div className="flex flex-col gap-1">
                        <span className="text-[#9CA3AF] text-[13px] font-medium">Status</span>
                        <div className="mt-0.5">
                          {car.status === 'available' ? (
                            <Badge
                              variant="outline"
                              className="bg-transparent text-[#34d399] border-[#064e3b] font-medium px-2 py-0.5 whitespace-nowrap inline-flex items-center text-xs w-auto"
                            >
                              <CheckCircle2 className="h-3 w-3 mr-1.5" />
                              Available
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-transparent text-[#fb7185] border-[#881337] font-medium px-2 py-0.5 whitespace-nowrap inline-flex items-center text-xs w-auto"
                            >
                              <XCircle className="h-3 w-3 mr-1.5" />
                              Unavailable
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Featured */}
                      <div className="flex flex-col gap-1">
                        <span className="text-[#9CA3AF] text-[13px] font-medium">Featured</span>
                        <div className="mt-0.5">
                          {car.featured ? (
                            <span className="text-[#4B5563] text-[16px] font-bold">Yes</span>
                          ) : (
                            <span className="text-[#4B5563] text-[16px] font-bold">No</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block">
                <div className="grid grid-cols-[80px_2fr_1fr_1fr_1fr_1fr_auto] gap-4 mb-4 text-sm font-medium text-muted-foreground px-4 py-2 bg-muted/50 rounded-lg">
                  <div>Image</div>
                  <div>Vehicle</div>
                  <div>Year</div>
                  <div>Price</div>
                  <div>Status</div>
                  <div>Featured</div>
                  <div className="text-right">Actions</div>
                </div>

                <div className="space-y-2">
                  {filteredCars.map((car) => (
                    <div
                      key={`table-${car._id}`}
                      className="grid grid-cols-[80px_2fr_1fr_1fr_1fr_1fr_auto] gap-4 items-center px-4 py-3 bg-card border rounded-lg hover:border-primary/50 transition-colors"
                    >
                      <div className="h-[60px] w-[80px] bg-muted rounded-md flex items-center justify-center overflow-hidden shrink-0 relative">
                        {car.images && car.images.length > 0 ? (
                          <Image
                            src={car.images[0]}
                            alt={car.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <CarFront className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>

                      <div>
                        <h3 className="font-semibold truncate">
                          {car.specs?.make || 'Unknown'} {car.specs?.model}
                        </h3>
                        <p className="text-sm text-muted-foreground truncate">{car.title}</p>
                      </div>

                      <div className="text-sm">{car.specs?.year || 'N/A'}</div>

                      <div className="font-medium">${car.price.toLocaleString()}</div>

                      <div>
                        <Badge
                          variant="secondary"
                          className={`${
                            car.status === 'available'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                          }`}
                        >
                          {car.status === 'available' ? 'Available' : 'Unavailable'}
                        </Badge>
                      </div>

                      <div>
                        {car.featured ? (
                          <Badge variant="default">Featured</Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </div>

                      <div className="flex items-center justify-end gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <Link href={`/cars/${car._id}`} target="_blank">
                              <DropdownMenuItem className="cursor-pointer">
                                <Eye className="mr-2 h-4 w-4" /> View Live
                              </DropdownMenuItem>
                            </Link>
                            <Link href={`/vendor/${vendorId}/add-car/new-car/${car._id}`}>
                              <DropdownMenuItem className="cursor-pointer">
                                <Edit2 className="mr-2 h-4 w-4" /> Edit Details
                              </DropdownMenuItem>
                            </Link>
                            <DropdownMenuItem
                              className="cursor-pointer"
                              onClick={() => handleToggleStatus(car._id, car.status || 'available')}
                            >
                              <ToggleLeft className="mr-2 h-4 w-4" /> Mark as{' '}
                              {car.status === 'available' ? 'Unavailable' : 'Available'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive cursor-pointer"
                              onClick={() => handleDelete(car._id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
