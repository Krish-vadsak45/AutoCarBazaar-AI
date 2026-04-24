import mongoose from 'mongoose';
import type { UploadResponse as ImageKitUploadResponse } from '@imagekit/next';

import { ICar } from '@/models/car.model';
import { IUser } from '@/models/user.model';
import { IVendor } from '@/models/vendor.model';
import { IReview } from '@/models/review.model';
import { ITestDrive } from '@/models/test-drive.model';

// Common API Response Type
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// User role type
export type UserRole = 'admin' | 'user' | 'vendor';

// NextAuth User Extension
export interface AuthUser {
  id: string;
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  image?: string;
  vendorId?: string;
  isVerified?: boolean;
  isActive?: boolean;
}

// Chat Types
export type MessageSender = 'ADMIN' | 'VENDOR';
export type MessageType = 'TEXT' | 'IMAGE' | 'VIDEO' | 'FILE' | 'AUDIO';

export interface IMessageItem {
  _id: string | mongoose.Types.ObjectId;
  sender: MessageSender;
  type: MessageType;
  content: string;
  fileUrl?: string;
  fileName?: string;
  isRead: boolean;
  isDeleted: boolean;
  isEdited: boolean;
  createdAt: Date;
}

export interface IChat {
  _id: string | mongoose.Types.ObjectId;
  vendorId: string | mongoose.Types.ObjectId;
  messages: IMessageItem[];
  createdAt: Date;
  updatedAt: Date;
}

// Exporting model interfaces for easier access across the app
export type { ICar, IUser, IVendor, IReview, ITestDrive };

// DTOs and Component Communication Types

export interface CarCardData {
  id?: string;
  _id?: string;
  image: string;
  title: string;
  price: string | number;
  year?: string | number;
  transmission?: string;
  fuel?: string;
  tags?: string[];
  status?: 'available' | 'unavailable';
}

export interface ReviewData {
  _id: string;
  userId: {
    _id: string;
    name: string;
    image?: string;
  };
  carId: string;
  rating: number;
  comment: string;
  helpfulCount: number;
  helpfulUsers: string[];
  replies: ReviewReplyData[];
  createdAt: string;
}

export interface ReviewReplyData {
  _id: string;
  userId: {
    _id: string;
    name: string;
    role: string;
  };
  text: string;
  createdAt: string;
}

export interface IReviewReplyData {
  _id: string;
  userId: {
    _id: string;
    name: string;
    role: string;
  };
  text: string;
  createdAt: string;
}

export interface VendorMonthlyReport {
  vendorId: string;
  vendorName: string;
  month: string;
  year: number;
  totalCars: number;
  totalRevenue: number;
  totalTestDrives: number;
  testDriveStatus: {
    PENDING: number;
    CONFIRMED: number;
    CANCELLED: number;
    COMPLETED: number;
    REJECTED: number;
  };
}

export interface IVendorWithUser extends Omit<IVendor, 'userId'> {
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  email?: string;
  name?: string;
}

export interface VendorMonthlyReportData {
  vendor: {
    businessName: string;
    priority?: number;
    subscriptionStatus: string;
  };
  stats: {
    current: {
      revenue: number;
      total: number;
      completed: number;
      rejected: number;
    };
    previous: {
      revenue: number;
      total: number;
    };
  };
  topCars: Array<{
    carId: string;
    title: string;
    bookings: number;
    revenue: number;
  }>;
  bookingsTable: Array<{
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'REJECTED';
    [key: string]: unknown;
  }>;
  reportMonth: { month: number; year: number };
}

export interface CompareCarData {
  id: string;
  image: string;
  title: string;
  price: string | number;
}

export type UploadResponse = ImageKitUploadResponse;

export interface CarListItem {
  _id: string | mongoose.Types.ObjectId;
  title: string;
  price: number;
  image?: string;
  images?: string[];
  transmission?: string;
  bodyType?: string;
  description?: string;
  features?: string[];
  tags?: string[];
  status?: 'available' | 'unavailable';
  pricePerHour?: number;
  vendorId?: string;
  carAddress?: string;
  vendorAddress?: string;
  specs?: {
    make?: string;
    model?: string;
    year?: number;
    fuelType?: string;
    mileage?: string;
    color?: string;
    bodyType?: string;
  };
}

export interface BookingConfirmationDetails {
  car: string;
  start: string;
  end: string;
  dealership: string;
}

export interface ProfileUser {
  _id?: string;
  name?: string;
  email?: string;
  role?: string;
  image?: string;
  phone?: string | number;
  address?: string;
  hasPassword?: boolean;
  isVerified?: boolean;
  isActive?: boolean;
}

export interface VendorWorkingHour {
  day: string;
  isOpen: boolean;
  openTime?: string;
  closeTime?: string;
}

export interface VendorDashboardTestDrive {
  _id: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'REJECTED';
  startDate?: string;
  createdAt?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  notes?: string;
  isDelivery?: boolean;
  address?: string;
  carId?: {
    _id?: string;
    title?: string;
    image?: string;
    images?: string[];
    price?: number;
  };
  userId?: {
    name?: string;
    email?: string;
  };
}

export interface VendorSummary {
  _id: string;
  userId?: {
    _id?: string;
    name?: string;
    email?: string;
  };
  name?: string;
  priority: number;
  subscriptionStatus: string;
  isActive: boolean;
  totalTestDrivesBooked: number;
  totalRevenue: number;
  verificationStatus: string;
  isVerified?: boolean;
  createdAt: string;
  cars: CarListItem[];
  hasUnreadMessages?: boolean;
}
