import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Car from "@/models/car.model";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import Vendor from "@/models/vendor.model";
import { carSchema } from "@/lib/validations/car";

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    console.log("Connected to database for GET /api/cars");

    const url = new URL(request.url);
    const qp = url.searchParams;

    // Build Mongo filter
    const andFilters: any[] = [];

    // Search query across multiple fields
    const q = qp.get("searchQuery")?.trim();
    if (q) {
      const regex = new RegExp(q, "i");
      andFilters.push({
        $or: [
          { title: regex },
          { transmission: regex },
          { "specs.fuelType": regex },
          { "specs.year": isNaN(Number(q)) ? undefined : Number(q) },
          { description: regex },
          { tags: { $in: [regex] } },
        ].filter(Boolean),
      });
    }

    // Company filter: multiple companies OR'd
    const companies = qp.getAll("company");
    if (companies && companies.length > 0) {
      const companyOr = companies.map((c) => {
        const r = new RegExp(c.trim(), "i");
        return {
          $or: [{ title: r }, { "specs.make": r }, { tags: { $in: [r] } }],
        };
      });
      andFilters.push({ $or: companyOr });
    }

    // Transmission & fuel
    const transmission = qp.get("transmission");
    if (transmission) {
      andFilters.push({
        transmission: { $regex: transmission, $options: "i" },
      });
    }
    const fuel = qp.get("fuel");
    if (fuel) {
      andFilters.push({ "specs.fuelType": { $regex: fuel, $options: "i" } });
    }

    // Year range
    const yearFrom = qp.get("yearFrom");
    const yearTo = qp.get("yearTo");
    if (yearFrom || yearTo) {
      const yearCond: any = {};
      if (yearFrom && !isNaN(Number(yearFrom)))
        yearCond.$gte = Number(yearFrom);
      if (yearTo && !isNaN(Number(yearTo))) yearCond.$lte = Number(yearTo);
      if (Object.keys(yearCond).length) {
        andFilters.push({ "specs.year": yearCond });
      }
    }

    // Price range
    const minPrice = qp.get("minPrice");
    const maxPrice = qp.get("maxPrice");
    if (minPrice || maxPrice) {
      const priceCond: any = {};
      if (minPrice && !isNaN(Number(minPrice)))
        priceCond.$gte = Number(minPrice);
      if (maxPrice && !isNaN(Number(maxPrice)))
        priceCond.$lte = Number(maxPrice);
      if (Object.keys(priceCond).length) {
        andFilters.push({ price: priceCond });
      }
    }

    // Combine all filters with $and
    const filter = andFilters.length > 0 ? { $and: andFilters } : {};

    // Pagination
    const page = parseInt(qp.get("page") || "1", 10);
    const limit = parseInt(qp.get("limit") || "12", 10);
    const skip = (page - 1) * limit;

    // Log final filter for diagnostics
    console.log(
      "Final cars filter:",
      JSON.stringify(filter),
      "Page:",
      page,
      "Limit:",
      limit,
    );
    // console.log("Final cars filter:", JSON.stringify(filter));

    let carsRaw;
    let totalCars;
    try {
      [carsRaw, totalCars] = await Promise.all([
        Car.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        Car.countDocuments(filter),
      ]);
      console.log("Found", carsRaw.length, "cars (Total:", totalCars, ")");

      const cars = carsRaw.map((c: any) => ({
        ...c,
        id: c._id?.toString() || "",
        image: c.images?.[0] || c.image || "",
        year: c.specs?.year || c.year,
        fuel: c.specs?.fuelType || c.fuel,
        make: c.specs?.make || c.make,
      }));

      return NextResponse.json({
        cars,
        hasMore: totalCars > skip + cars.length,
      });
    } catch (err) {
      console.error("Error running Car.find with filter:", filter, err);
      return NextResponse.json(
        { error: (err as any)?.message ?? "Query failed" },
        { status: 500 }
      );
    }

    // return NextResponse.json({ cars });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? "Unknown" },
      { status: 500 }
    );
  }
}

// export async function POST(request: Request) {
//   try {
//     const body = await request.json();
//     await connectToDatabase();
//     console.log(body);
//     const created = await Car.create(body);
//     return NextResponse.json({ car: created }, { status: 201 });
//   } catch (error: any) {
//     return NextResponse.json(
//       { error: error?.message ?? "Unknown" },
//       { status: 500 }
//     );
//   }
// }

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user;
    const userId = user._id;

    await connectToDatabase();

    const vendor = await Vendor.findOne({ userId: userId });
    if (!vendor) {
      return NextResponse.json(
        { error: "Vendor profile not found. Please register as a vendor." },
        { status: 403 }
      );
    }

    const body = await request.json();

    // ✅ Validate Body
    const validation = carSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.format() },
        { status: 400 },
      );
    }

    const validatedData = validation.data;

    // ✅ Create Car (NO vendorId inside car)
    const newCar = await Car.create(validatedData);

    // Push carId into vendor using update to bypass potential strict schema validation errors on outdated documents
    await Vendor.findByIdAndUpdate(
      vendor._id,
      { $push: { cars: newCar._id.toString() } },
      { runValidators: false }
    );

    return NextResponse.json(
      { message: "Car created successfully", car: newCar },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create Car Error:", error);
    return NextResponse.json(
      { error: error?.message ?? "Internal Server Error" },
      { status: 500 }
    );
  }
}
