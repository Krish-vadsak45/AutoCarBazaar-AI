"use client";

import { useState } from "react";
import CarSpinner from "./CarSpinner";

const Loading = () => {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background relative">
      <CarSpinner />
    </div>
  );
};

export default Loading;
