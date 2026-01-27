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
      images: [
        "https://example.com/images/cars/honda-city-front.jpg",
        "https://example.com/images/cars/honda-city-interior.jpg",
      ],
      image: "https://example.com/images/cars/honda-city-front.jpg", // legacy
      title: "Honda City ZX Petrol",
      price: 1350000,
      transmission: "Automatic",
      bodyType: "Sedan",
      description:
        "Well-maintained single-owner car with smooth performance and excellent fuel efficiency.",
      features: [
        "Sunroof",
        "Touchscreen Infotainment",
        "Reverse Camera",
        "Cruise Control",
        "ABS",
        "Airbags",
      ],
      specs: {
        make: "Honda",
        model: "City",
        year: 2022,
        fuelType: "Petrol",
        mileage: "18 km/l",
        color: "White",
      },
      tags: ["sedan", "automatic", "petrol", "single-owner"],
    };
  }
}

export default async function Page({ params: { id } }: Params) {
  const car = await fetchCar(id);

  return (
    <>
      <CarDetailClient />
    </>
  );
}
