'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Calendar,
  Clock,
  Car,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
  FilterX,
  FileText,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import Image from 'next/image';

import Loading from '@/components/Loading';
import { Badge } from '@/components/ui/badge';
import { ReviewModal } from '@/components/ReviewModal';
import { Button } from '@/components/ui/button';

// --- Types based on API Response ---
interface IReservation {
  _id: string;
  status: string;
  startDate: string;
  endDate?: string;
  startTime: string;
  endTime?: string;
  notes?: string;
  isDelivery?: boolean;
  userLocation?: {
    city?: string;
    state?: string;
  };
  carId: {
    _id: string;
    title: string;
    image?: string;
    images?: string[];
    price: number;
    transmission?: string;
    bodyType?: string;
  };
  vendorId?: {
    businessName: string;
    address?: {
      city: string;
      state: string;
    };
  };
  userId?: {
    name: string;
    email: string;
  };
}

export default function MyReservationsPage() {
  const [reservations, setReservations] = useState<IReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<{
    carId: string;
    testDriveId: string;
  } | null>(null);

  // 1. Fetch reservations on mount and when page/filter changes
  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get('/api/my-reservation', {
          params: {
            page,
            limit: 5,
            status: filter === 'all' ? undefined : filter,
          },
        });
        setReservations(data.data);
        setTotalPages(data.pagination.totalPages);
        setTotalCount(data.pagination.total);
      } catch (error) {
        console.error('Failed to load reservations', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReservations();
  }, [page, filter]);

  // Handle filter change - reset to page 1
  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    setPage(1);
  };

  // Status Badge Logic
  const getStatusBadge = (status: string) => {
    const normalizedStatus = status?.toUpperCase() || '';
    const statusConfig: Record<string, { bg: string; icon: LucideIcon; label: string }> = {
      CONFIRMED: {
        bg: 'bg-emerald-500 hover:bg-emerald-600',
        icon: CheckCircle2,
        label: 'Confirmed',
      },
      PENDING: {
        bg: 'bg-amber-500 hover:bg-amber-600',
        icon: Clock,
        label: 'Pending',
      },
      CANCELLED: {
        bg: 'bg-rose-500 hover:bg-rose-600',
        icon: XCircle,
        label: 'Cancelled',
      },
      COMPLETED: {
        bg: 'bg-blue-500 hover:bg-blue-600',
        icon: CheckCircle2,
        label: 'Completed',
      },
    };

    const config = statusConfig[normalizedStatus] || {
      bg: 'bg-gray-500',
      icon: AlertCircle,
      label: status,
    };
    const Icon = config.icon;

    return (
      <Badge className={`${config.bg} border-none text-white`}>
        <Icon className="w-3 h-3 mr-1" /> {config.label}
      </Badge>
    );
  };

  // Helper: Date Range Display
  const renderDateRange = (start: string, end?: string) => {
    try {
      if (end && end !== start) {
        return `${format(new Date(start), 'MMM dd')} - ${format(new Date(end), 'MMM dd, yyyy')}`;
      }
      return format(new Date(start), 'eeee, MMM dd, yyyy');
    } catch {
      return start;
    }
  };

  // Animation Variants
  const containerVariants = { show: { transition: { staggerChildren: 0.1 } } };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-slate-950 pt-24 pb-12 transition-colors duration-300">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
              My Test Drives
              <Badge
                variant="secondary"
                className="text-lg px-3 py-1 rounded-full bg-primary/10 text-primary"
              >
                {totalCount}
              </Badge>
            </h1>
            <p className="text-muted-foreground mt-2 max-w-md">
              Track the status of your test drives and upcoming appointments.
            </p>
          </div>

          {/* Filters */}
          <div className="flex bg-white dark:bg-slate-900 p-1 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-x-auto">
            {['all', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((f) => (
              <button
                key={f}
                onClick={() => handleFilterChange(f)}
                className={`px-3 py-2 rounded-lg text-xs font-bold uppercase transition-all whitespace-nowrap ${
                  filter === f
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-muted-foreground hover:bg-gray-100 dark:hover:bg-slate-800'
                }`}
              >
                {f === 'all' ? 'All' : f}
              </button>
            ))}
          </div>
        </div>

        {/* Content List */}
        {loading ? (
          <Loading />
        ) : reservations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-24 text-center space-y-6 bg-background rounded-3xl border-2 border-dashed border-muted"
          >
            <div className="p-6 bg-muted/50 rounded-full">
              <FilterX className="w-12 h-12 text-muted-foreground/50" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-foreground">
                {filter === 'all' ? 'No reservations found' : `No ${filter} bookings`}
              </h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                {filter === 'all'
                  ? "You currently don't have any bookings."
                  : `You don't have any ${filter} reservations at the moment.`}
              </p>
            </div>
            {filter !== 'all' && (
              <Button
                onClick={() => handleFilterChange('all')}
                variant="outline"
                className="rounded-full px-8"
              >
                View All Bookings
              </Button>
            )}
            <Button asChild size="lg" className="rounded-full px-8">
              <Link href="/">Book a Test Drive</Link>
            </Button>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-6"
          >
            <AnimatePresence mode="popLayout">
              {reservations.map((res) => (
                <motion.div
                  layout
                  key={res._id}
                  variants={itemVariants}
                  exit={{ opacity: 0, y: 20 }}
                  className="group bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Image Section */}
                    <div className="relative w-full md:w-72 h-56 md:h-auto shrink-0">
                      {res.carId?.image || res.carId?.images?.[0] ? (
                        <div className="w-full h-full relative overflow-hidden">
                          <Image
                            src={res.carId.image || res.carId.images![0]}
                            alt={res.carId.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:hidden" />
                        </div>
                      ) : (
                        <div className="w-full h-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
                          <Car className="w-12 h-12 text-gray-300" />
                        </div>
                      )}

                      {/* Mobile Status Badge */}
                      <div className="absolute top-3 left-3 md:hidden">
                        {getStatusBadge(res.status)}
                      </div>

                      {/* Mobile Price Overlay */}
                      <div className="absolute bottom-3 left-3 md:hidden text-white">
                        <p className="font-bold text-lg">
                          ${res.carId?.price?.toLocaleString() || 'N/A'}
                        </p>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 p-5 md:p-6 flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white line-clamp-1">
                              {res.carId?.title || 'Unknown Vehicle'}
                            </h3>
                            <Badge
                              variant="outline"
                              className="hidden md:inline-flex text-xs font-normal"
                            >
                              {res.carId?.bodyType || 'Sedan'}
                            </Badge>
                            {res.isDelivery ? (
                              <Badge className="bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-none text-xs gap-1">
                                <MapPin className="w-3 h-3" />
                                Delivery
                              </Badge>
                            ) : null}
                          </div>

                          {res.isDelivery && res.userLocation?.city ? (
                            <div className="flex items-center text-sm text-purple-600 dark:text-purple-400 gap-1.5">
                              <MapPin className="w-3.5 h-3.5" />
                              <span className="font-medium">
                                Your location: {res.userLocation.city}
                                {res.userLocation.state ? `, ${res.userLocation.state}` : null}
                              </span>
                            </div>
                          ) : res.vendorId ? (
                            <div className="flex items-center text-sm text-muted-foreground gap-1.5">
                              <MapPin className="w-3.5 h-3.5" />
                              <span className="font-medium">{res.vendorId.businessName}</span>
                              {res.vendorId.address?.city ? (
                                <span className="text-gray-400">• {res.vendorId.address.city}</span>
                              ) : null}
                            </div>
                          ) : null}
                        </div>

                        <div className="hidden md:flex flex-col items-end gap-2">
                          <div className="text-right">
                            <p className="text-2xl font-bold text-primary">
                              ${res.carId?.price?.toLocaleString() || '0'}
                            </p>
                            <p className="text-xs text-muted-foreground">Est. price</p>
                          </div>
                          {getStatusBadge(res.status)}
                        </div>
                      </div>

                      {/* Info Grid */}
                      <div className="grid grid-cols-2 gap-y-4 gap-x-8 py-4 border-t border-gray-100 dark:border-slate-800 mb-4">
                        <div className="space-y-1">
                          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            Date
                          </span>
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {renderDateRange(res.startDate, res.endDate)}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            Time
                          </span>
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {res.startTime} {res.endTime ? `- ${res.endTime}` : null}
                          </p>
                        </div>
                      </div>

                      {/* Notes Section - if exists */}
                      {res.notes ? (
                        <div className="mb-5 bg-gray-50 dark:bg-slate-800/50 p-3 rounded-lg text-sm text-gray-600 dark:text-gray-300">
                          <span className="font-medium text-xs text-gray-500 uppercase block mb-1">
                            Notes
                          </span>
                          &quot;{res.notes}&quot;
                        </div>
                      ) : null}

                      {/* Actions */}
                      <div className="mt-auto flex flex-col sm:flex-row gap-3 justify-end pt-2">
                        {res.status === 'COMPLETED' && (
                          <Button
                            size="sm"
                            variant="secondary"
                            className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                            onClick={() => {
                              setSelectedBooking({
                                carId: res.carId._id,
                                testDriveId: res._id,
                              });
                              setIsReviewModalOpen(true);
                            }}
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            Write Review
                          </Button>
                        )}
                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-primary"
                        >
                          <Link href={`/car/${res.carId?._id}`}>View Vehicle Details</Link>
                        </Button>
                        <Button size="sm" className="rounded-lg shadow-sm">
                          Manage Booking
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 pt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-xl"
                >
                  Previous
                </Button>
                <div className="flex items-center gap-2">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
                        page === i + 1
                          ? 'bg-primary text-primary-foreground shadow-lg'
                          : 'bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 hover:border-primary/50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="rounded-xl"
                >
                  Next
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {selectedBooking ? (
        <ReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          carId={selectedBooking.carId}
          testDriveId={selectedBooking.testDriveId}
        />
      ) : null}
    </div>
  );
}
