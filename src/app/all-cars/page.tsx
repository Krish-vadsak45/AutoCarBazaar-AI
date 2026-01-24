"use client";

import React, { useState } from "react";
import AllCars from "@/components/AllCars";
import { SearchAndFilter } from "@/components/SearchAndFilter";

const page = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [toolFilter, setToolFilter] = useState("");
  const [company, setCompany] = useState<string[]>([]);
  const [yearFrom, setYearFrom] = useState("2015");
  const [yearTo, setYearTo] = useState("2024");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [transmission, setTransmission] = useState("");
  const [fuel, setFuel] = useState("");
  return (
    <>
      <AllCars
        searchQuery={searchQuery}
        company={company}
        yearFrom={yearFrom}
        yearTo={yearTo}
        minPrice={minPrice}
        maxPrice={maxPrice}
        transmission={transmission}
        fuel={fuel}
      />
      <SearchAndFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedTool={toolFilter}
        onToolChange={setToolFilter}
        company={company}
        onCompanyChange={setCompany}
        yearFrom={yearFrom}
        onYearFromChange={setYearFrom}
        yearTo={yearTo}
        onYearToChange={setYearTo}
        minPrice={minPrice}
        onMinPriceChange={setMinPrice}
        maxPrice={maxPrice}
        onMaxPriceChange={setMaxPrice}
        transmission={transmission}
        onTransmissionChange={setTransmission}
        fuel={fuel}
        onFuelChange={setFuel}
      />
    </>
  );
};

export default page;
