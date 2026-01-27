"use client";
import React, { useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "./ui/button";
import { Dialog, DialogTrigger, DialogContent } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardHeader, CardContent } from "./ui/card";
import { Separator } from "./ui/separator";

type Car = {
  id: string;
  title: string;
  price: number;
  mileage?: string;
  fuelType?: string;
  transmission?: string;
  bodyType?: string;
  color?: string;
  images?: string[];
  description?: string;
  features?: string[];
  specs?: Record<string, any>;
  dealer?: Record<string, any>;
};

const schema = z.object({
  vehiclePrice: z.number().min(0),
  downPayment: z.number().min(0),
  interestRate: z.number().min(0),
  loanTermYears: z.number().min(1),
});

type FormValues = z.infer<typeof schema>;

function formatCurrency(v: number) {
  return v.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });
}

export default function CarDetailClient({ car }: { car: Car }) {
  const defaultValues: FormValues = {
    vehiclePrice: car.price ?? 0,
    downPayment: 0,
    interestRate: 4.5,
    loanTermYears: 5,
  };

  const { control, watch } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const values = watch();

  const loanAmount = useMemo(
    () => Math.max(0, values.vehiclePrice - values.downPayment),
    [values],
  );
  const monthlyPayment = useMemo(() => {
    const r = values.interestRate / 100 / 12;
    const n = values.loanTermYears * 12;
    if (r === 0) return loanAmount / n || 0;
    const payment = (loanAmount * r) / (1 - Math.pow(1 + r, -n));
    return Number.isFinite(payment) ? payment : 0;
  }, [values, loanAmount]);

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <div
            style={{
              borderRadius: 8,
              overflow: "hidden",
              background: "#fff",
              boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
            }}
          >
            <img
              src={car.images?.[0] ?? "/images/placeholder.png"}
              alt={car.title}
              style={{ width: "100%", height: 420, objectFit: "cover" }}
            />
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            {(car.images ?? []).map((src, i) => (
              <img
                key={i}
                src={src}
                style={{
                  width: 72,
                  height: 56,
                  objectFit: "cover",
                  borderRadius: 6,
                }}
              />
            ))}
          </div>

          <h2 style={{ marginTop: 28 }}>Description</h2>
          <p style={{ color: "#444" }}>{car.description}</p>

          <h2 style={{ marginTop: 28 }}>Specifications</h2>
          <Card>
            <CardHeader>
              <strong>Specifications</strong>
            </CardHeader>
            <CardContent>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ color: "#666" }}>Make</div>
                  <div>{car.specs?.make ?? "-"}</div>
                </div>
                <div>
                  <div style={{ color: "#666" }}>Model</div>
                  <div>{car.specs?.model ?? "-"}</div>
                </div>
                <div>
                  <div style={{ color: "#666" }}>Year</div>
                  <div>{car.specs?.year ?? "-"}</div>
                </div>
                <div>
                  <div style={{ color: "#666" }}>Color</div>
                  <div>{car.specs?.color ?? "-"}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <aside style={{ width: 420 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                background: "#111827",
                color: "#fff",
                padding: "6px 10px",
                borderRadius: 6,
                fontSize: 12,
              }}
            >
              Sedan
            </div>
            <h1 style={{ margin: 0, fontSize: 24 }}>{car.title}</h1>
          </div>
          <div
            style={{
              marginTop: 8,
              fontSize: 22,
              color: "#0b5cff",
              fontWeight: 700,
            }}
          >
            {formatCurrency(car.price)}
          </div>

          <div style={{ marginTop: 12 }}>
            <Card>
              <CardContent>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ color: "#666", fontSize: 13 }}>
                      EMI Calculator
                    </div>
                    <div style={{ color: "#111", fontWeight: 700 }}>
                      {formatCurrency(monthlyPayment)}
                    </div>
                    <div style={{ color: "#888", fontSize: 12 }}>
                      Estimated Monthly Payment
                    </div>
                  </div>
                  <div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button>Open</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <h3>Vehiql Car Loan Calculator</h3>

                        <div style={{ marginTop: 12 }}>
                          <Label>Vehicle Price</Label>
                          <Controller
                            control={control}
                            name="vehiclePrice"
                            render={({ field }) => (
                              <Input
                                type="number"
                                value={field.value}
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value))
                                }
                              />
                            )}
                          />
                        </div>

                        <div style={{ marginTop: 12 }}>
                          <Label>Down Payment</Label>
                          <Controller
                            control={control}
                            name="downPayment"
                            render={({ field }) => (
                              <Input
                                type="number"
                                value={field.value}
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value))
                                }
                              />
                            )}
                          />
                        </div>

                        <div
                          style={{ display: "flex", gap: 12, marginTop: 12 }}
                        >
                          <div style={{ flex: 1 }}>
                            <Label>Interest Rate (%)</Label>
                            <Controller
                              control={control}
                              name="interestRate"
                              render={({ field }) => (
                                <Input
                                  type="number"
                                  value={field.value}
                                  onChange={(e) =>
                                    field.onChange(Number(e.target.value))
                                  }
                                />
                              )}
                            />
                          </div>
                          <div style={{ width: 120 }}>
                            <Label>Loan Term (Years)</Label>
                            <Controller
                              control={control}
                              name="loanTermYears"
                              render={({ field }) => (
                                <Input
                                  type="number"
                                  value={field.value}
                                  onChange={(e) =>
                                    field.onChange(Number(e.target.value))
                                  }
                                />
                              )}
                            />
                          </div>
                        </div>

                        <Separator />

                        <div style={{ marginTop: 12 }}>
                          <div style={{ fontSize: 12, color: "#666" }}>
                            Monthly Payment
                          </div>
                          <div style={{ fontSize: 22, fontWeight: 800 }}>
                            {formatCurrency(monthlyPayment)}
                          </div>

                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr",
                              gap: 8,
                              marginTop: 12,
                            }}
                          >
                            <div>
                              <div style={{ color: "#666" }}>Vehicle Price</div>
                              <div style={{ fontWeight: 700 }}>
                                {formatCurrency(values.vehiclePrice)}
                              </div>
                            </div>
                            <div>
                              <div style={{ color: "#666" }}>Down Payment</div>
                              <div style={{ fontWeight: 700 }}>
                                {formatCurrency(values.downPayment)}
                              </div>
                            </div>
                            <div>
                              <div style={{ color: "#666" }}>Loan Amount</div>
                              <div style={{ fontWeight: 700 }}>
                                {formatCurrency(loanAmount)}
                              </div>
                            </div>
                            <div>
                              <div style={{ color: "#666" }}>
                                Total Interest
                              </div>
                              <div style={{ fontWeight: 700 }}>
                                {formatCurrency(
                                  Math.max(
                                    0,
                                    monthlyPayment * values.loanTermYears * 12 -
                                      loanAmount,
                                  ),
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            marginTop: 16,
                          }}
                        >
                          <Button>Close</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
            <Button>Save</Button>
            <Button>Share</Button>
            <Button
              style={{ marginLeft: "auto", background: "#111", color: "#fff" }}
            >
              Book Test Drive
            </Button>
          </div>

          <div style={{ marginTop: 20 }}>
            <h3>Dealership Location</h3>
            <Card>
              <CardContent>
                <div style={{ fontWeight: 700 }}>{car.dealer?.name}</div>
                <div style={{ color: "#666", fontSize: 13 }}>
                  {car.dealer?.address}
                </div>
                <div style={{ marginTop: 8, color: "#666" }}>
                  Phone: {car.dealer?.phone}
                </div>
                <div style={{ color: "#666" }}>Email: {car.dealer?.email}</div>
              </CardContent>
            </Card>
          </div>
        </aside>
      </div>
    </div>
  );
}
