import React from "react";
import CarDetailClient from "@/components/CarDetailClient";
import { notFound } from "next/navigation";
import connectToDatabase from "@/lib/db";
import Car from "@/models/car.model";

async function fetchCarFromDb(id: string) {
  try {
    await connectToDatabase();
    const carRaw = await Car.findById(id).lean();
    if (!carRaw) return null;

    // Convert to plain object and serialize non-serializable fields
    const car = JSON.parse(JSON.stringify(carRaw));
    // Ensure id is present as 'id' for the client component
    car.id = car._id;
    return car;
  } catch (e) {
    console.error("Error fetching car from DB:", e);
    return null;
  }
}

export default async function Page(props: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const params = await props.params;
  const { id } = params;
  const car = await fetchCarFromDb(id);

  if (!car) notFound();

  return <CarDetailClient car={car} />;
}
