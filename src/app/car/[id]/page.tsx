import React from "react";
import CarDetailClient from "@/components/CarDetailClient";

type Params = { params: { id: string } };

async function fetchCar(id: string) {
  // simple server-side fetch to the internal API; fallback to sample data
  try {
    const base = process.env.NEXT_PUBLIC_BASE_URL || "";
    const url = base ? `${base}/api/cars/${id}` : `/api/cars/${id}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("not found");
    return await res.json();
  } catch (e) {
    // fallback mock data matching the screenshots
    return {
      id,
      title: "2023 Honda City",
      price: 18000,
      mileage: "13 miles",
      fuelType: "Diesel",
      transmission: "Semi-Automatic",
      bodyType: "Sedan",
      color: "Blue",
      images: [
        "/images/cars/honda-city-1.jpg",
        "/images/cars/honda-city-2.jpg",
        "/images/cars/honda-city-3.jpg",
      ],
      description:
        "Experience the sleek and stylish 2023 Honda City! This stunning blue sedan offers a comfortable ride and impressive fuel efficiency. Enjoy modern features and reliable performance!",
      features: [
        "Semi-Automatic Transmission",
        "Diesel Engine",
        "Sedan Body Style",
        "Blue Exterior",
      ],
      specs: {
        make: "Honda",
        year: 2023,
        model: "City",
        fuelType: "Diesel",
        mileage: "13 miles",
        color: "Blue",
      },
      dealer: {
        name: "Vehiql Motors",
        address: "69 Car Street, Autoville, CA 69420",
        phone: "+1 (555) 123-4567",
        email: "contact@vehiql.com",
      },
    };
  }
}

export default async function Page({ params: { id } }: Params) {
  const car = await fetchCar(id);

  return <CarDetailClient car={car} />;
}
