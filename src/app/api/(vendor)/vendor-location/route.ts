import { NextResponse } from "next/server";
import { validateVendor } from "../vend-cars/[id]/route";

export async function PATCH(req: Request) {
  try {
    const vendor = await validateVendor(req);

    if (!vendor) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { lat, lng } = await req.json();

    if (typeof lat !== "number" || typeof lng !== "number") {
      return NextResponse.json(
        { error: "Valid lat and lng numbers are required" },
        { status: 400 },
      );
    }

    vendor.address.lat = lat;
    vendor.address.lng = lng;
    await vendor.save();

    return NextResponse.json(
      { message: "Location updated", lat, lng },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const vendor = await validateVendor(req);

    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        lat: vendor.address.lat ?? null,
        lng: vendor.address.lng ?? null,
        city: vendor.address.city,
        state: vendor.address.state,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
