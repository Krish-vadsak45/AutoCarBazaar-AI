import React from 'react';
import { notFound } from 'next/navigation';
import mongoose from 'mongoose';

import CarDetailClient from '@/components/CarDetailClient';
import connectToDatabase from '@/lib/db';
import Car from '@/models/car.model';
import Vendor from '@/models/vendor.model';
import { VendorWorkingHour } from '@/src/types';

export type VendorPublic = {
  businessName: string;
  address: string;
  email: string;
  phone: string;
  workingHours?: {
    day: string;
    isOpen: boolean;
    openTime?: string;
    closeTime?: string;
  }[];
};

async function fetchCarWithVendor(id: string) {
  try {
    await connectToDatabase();
    const carRaw = await Car.findById(id).lean();
    if (!carRaw) {
      return null;
    }

    const car = JSON.parse(JSON.stringify(carRaw));
    car.id = car._id;

    let vendorPublic: VendorPublic | null = null;
    const vid = car.vendorId;
    if (vid && mongoose.Types.ObjectId.isValid(String(vid))) {
      const v = await Vendor.findById(vid).lean();
      if (v) {
        vendorPublic = {
          businessName: v.businessName ?? '',
          address: typeof v.address === 'string' ? v.address : '',
          email: v.contactDetails?.email ?? '',
          phone: v.contactDetails?.phone ?? '',
          workingHours: Array.isArray(v.workingHours)
            ? (v.workingHours as VendorWorkingHour[]).map((wh) => ({
                day: String(wh.day || '')
                  .toLowerCase()
                  .replace(/^./, (c: string) => c.toUpperCase()),
                isOpen: Boolean(wh.isOpen),
                openTime: wh.openTime,
                closeTime: wh.closeTime,
              }))
            : undefined,
        };
      }
    }

    return { car, vendorPublic };
  } catch (e) {
    console.error('Error fetching car from DB:', e);
    return null;
  }
}

export default async function Page(props: { params: Promise<{ id: string }> | { id: string } }) {
  const params = await props.params;
  const { id } = params;
  const data = await fetchCarWithVendor(id);

  if (!data) {
    notFound();
  }

  return <CarDetailClient car={data.car} vendorPublic={data.vendorPublic} />;
}
