"use client";

import { FileText } from "lucide-react";

interface PDFButtonProps {
  onClick: () => void;
}

export function PDFButton({ onClick }: PDFButtonProps) {
  return (
    <button
      onClick={onClick}
      className="py-3 px-6 rounded-lg font-medium transition-all hover:shadow-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-slate-700 hover:border-gray-400 dark:hover:border-slate-600 flex items-center justify-center gap-2"
    >
      <FileText className="w-5 h-5" />
      Get PDF
    </button>
  );
}
