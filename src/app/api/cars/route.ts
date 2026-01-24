import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Car from "@/models/car.model";

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    console.log("Connected to database for GET /api/cars");

    const url = new URL(request.url);
    const qp = url.searchParams;

    // Build Mongo filter
    const filter: any = {};

    // Search query across multiple fields
    const q = qp.get("searchQuery")?.trim();
    if (q) {
      const regex = new RegExp(q, "i");
      filter.$or = [
        { title: regex },
        { transmission: regex },
        { fuel: regex },
        { year: regex },
        { price: regex },
        { tags: { $in: [regex] } },
      ];
    }
    console.log("Search query filter:", q);
    // Company filter: multiple companies OR'd (match title or tags)
    const companies = qp.getAll("company");
    console.log("Company params:", companies);
    if (companies && companies.length > 0) {
      const compOr: any[] = [];
      for (const c of companies) {
        const r = new RegExp(c.trim(), "i");
        compOr.push({ title: r }, { tags: { $in: [r] } });
      }
      if (!filter.$or) filter.$or = [];
      filter.$or = filter.$or.concat(compOr);
    }

    // Transmission & fuel
    const transmission = qp.get("transmission");
    if (transmission)
      filter.transmission = { $regex: transmission, $options: "i" };
    const fuel = qp.get("fuel");
    if (fuel) filter.fuel = { $regex: fuel, $options: "i" };

    // Year range (years stored as strings like '2018')
    const yearFrom = qp.get("yearFrom");
    const yearTo = qp.get("yearTo");
    if (yearFrom || yearTo) {
      filter.year = {};
      if (yearFrom) filter.year.$gte = Number(yearFrom);
      if (yearTo) filter.year.$lte = Number(yearTo);
    }
    console.log("Year filter:", yearFrom, yearTo, filter.year);
    // Price range (assumes numeric prices stored as numbers; best-effort)
    const minPrice = qp.get("minPrice");
    const maxPrice = qp.get("maxPrice");
    if (minPrice || maxPrice) {
      // If price is stored as number in many docs, this will work.
      // Use $or to try both numeric and string variants (best-effort simple approach).
      const priceCond: any = {};
      if (minPrice && !Number.isNaN(Number(minPrice)))
        priceCond.$gte = Number(minPrice);
      if (maxPrice && !Number.isNaN(Number(maxPrice)))
        priceCond.$lte = Number(maxPrice);
      if (Object.keys(priceCond).length) {
        filter.$or = filter.$or || [];
        filter.$or.push({ price: priceCond });
      }
    }

    // Log final filter for diagnostics
    console.log("Final cars filter:", JSON.stringify(filter));

    let cars;
    try {
      cars = await Car.find(filter).lean();
      console.log("Found", cars.length, "cars");
    } catch (err) {
      console.error("Error running Car.find with filter:", filter, err);
      return NextResponse.json(
        { error: (err as any)?.message ?? "Query failed" },
        { status: 500 },
      );
    }

    return NextResponse.json({ cars });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? "Unknown" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await connectToDatabase();
    console.log(body);
    const created = await Car.create(body);
    return NextResponse.json({ car: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? "Unknown" },
      { status: 500 },
    );
  }
}
