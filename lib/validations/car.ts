import { z } from "zod";

const transmissionEnum = ["Automatic", "Manual", "CVT"] as const;
const bodyTypeEnum = [
  "Sedan",
  "SUV",
  "Truck",
  "Coupe",
  "Hatchback",
  "Van",
] as const;
const fuelTypeEnum = ["Petrol", "Diesel", "Electric", "Hybrid"] as const;

// Helper to handle comma-separated strings or arrays
const stringToArray = z
  .union([z.string(), z.array(z.string())])
  .transform((val) =>
    typeof val === "string"
      ? val
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : val,
  );

export const carSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  price: z.coerce.number().min(0, "Price must be a positive number"),
  transmission: z.enum(transmissionEnum),
  bodyType: z.enum(bodyTypeEnum),
  description: z.string().min(10, "Description must be at least 10 characters"),
  images: z.array(z.string()).max(5, "You can upload at most 5 images").optional().default([]),
  specs: z.object({
    make: z.string().min(1, "Make is required"),
    model: z.string().min(1, "Model is required"),
    year: z.coerce
      .number()
      .min(1900, "Invalid year")
      .max(new Date().getFullYear() + 1, "Invalid year"),
    fuelType: z.enum(fuelTypeEnum),
    mileage: z.string().min(1, "Mileage is required"),
    color: z.string().min(1, "Color is required"),
  }),
  features: stringToArray.optional().default([]),
  tags: stringToArray.optional().default([]),
  status: z.enum(["available", "unavailable"]).optional().default("available"),
});

export type CarFormValues = z.input<typeof carSchema>;
export type CarData = z.output<typeof carSchema>;
