import React from "react";

export default function AllCarsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="scrollbar-hide">{children}</div>;
}
