import React from "react";
import CarCard from "./CarCard";
import { Button } from "./ui/button";

const Hero = () => {
  const cars = [
    {
      image: "/1.png",
      title: "2019 Honda Civic",
      price: "10,000",
      year: "2019",
      transmission: "Automatic",
      fuel: "Gasoline",
      tags: ["sedan", "compact"],
    },
    {
      image: "/2.webp",
      title: "2020 Toyota Corolla",
      price: "12,000",
      year: "2020",
      transmission: "Manual",
      fuel: "Gasoline",
      tags: ["sedan", "compact"],
    },
    {
      image: "/3.jpg",
      title: "2018 Ford Mustang",
      price: "25,000",
      year: "2018",
      transmission: "Automatic",
      fuel: "Gasoline",
      tags: ["coupe", "sports"],
    },
  ];
  return (
    <section className="py-8 mt-10 mx-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="mb-5 pb-1 relative inline-block text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-gray-100">
            Featured Cars
            <span className="absolute left-0 -bottom-1 h-1 w-20 rounded-full bg-linear-to-r from-orange-500 to-orange-500"></span>
          </h2>

          <Button
            variant="ghost"
            className="hidden sm:inline-flex items-center gap-2 cursor-pointer"
          >
            View All Cars
          </Button>
        </div>

        <div className="grid gap-6 place-items-center max-sm:w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {cars.map((c, i) => (
            <CarCard key={`${c.title}-${i}`} cars={c} />
          ))}
        </div>

        <div className="mt-6 text-center sm:hidden">
          <Button variant="ghost" className="cursor-pointer">
            View All Cars
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
