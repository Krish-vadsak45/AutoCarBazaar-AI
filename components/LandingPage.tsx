"use client";

import React, { useRef, useState } from "react";
import { Image as ImageIcon, X as XIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export default function LandingPage() {
  const [showUpload, setShowUpload] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const onFiles = (files: FileList | null) => {
    if (!files) return;
    const arr: string[] = [];
    Array.from(files)
      .slice(0, 1)
      .forEach((f) => {
        const url = URL.createObjectURL(f);
        arr.push(url);
      });
    setPreviews(arr);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiles(e.target.files);
    setShowUpload(true);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    onFiles(e.dataTransfer.files);
    setShowUpload(true);
  };

  const handleClear = () => {
    previews.forEach((p) => URL.revokeObjectURL(p));
    setPreviews([]);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: wire up real search; for now just log
    console.log("Search submitted", { previews });
  };

  return (
    <section className="min-h-[70vh] flex items-center justify-center bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 mt-17">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center py-16">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
            Rent The Perfect Ride. Effortless, Fast, Reliable.
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-gray-600 dark:text-gray-300">
            Discover high-quality cars near you. Upload a photo of a car you
            like and we’ll find similar models available for rent.
          </p>

          <form
            onSubmit={handleSearch}
            className="mt-8 bg-white/80 dark:bg-slate-800/70 rounded-xl p-4 shadow-md backdrop-blur-sm"
          >
            <div className="flex flex-col sm:flex-row items-stretch gap-3">
              <Input
                aria-label="Search cars by model, city or features"
                placeholder="Search by model, city or features (e.g. Tesla Model 3, New York)"
                className="flex-1 px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-transparent text-gray-900 dark:text-gray-100"
              />

              <div className="flex items-center justify-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex items-center gap-2 dark:text-gray-100 dark:hover:bg-slate-700"
                  onClick={() => {
                    setShowUpload(true);
                    fileRef.current?.click();
                  }}
                  title="Upload an image"
                >
                  <ImageIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  <span className="">Upload</span>
                </Button>

                <Button type="submit" className="px-5 py-3">
                  Search
                </Button>
              </div>
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleInputChange}
            />

            {(showUpload || previews.length > 0) && (
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="mt-4 rounded-lg border-2 border-dashed border-gray-200 dark:border-slate-700 p-4 bg-white/60 dark:bg-slate-800/60"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm text-gray-700 dark:text-gray-200">
                    Upload images (drag & drop or click Upload).
                  </div>
                  <div className="flex items-center gap-2">
                    {previews.length > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleClear}
                        className="text-muted-foreground hover:text-card-foreground hover:bg-primary transition-all font-medium cursor-pointer flex items-center gap-2"
                      >
                        <XIcon className="w-5 h-5" /> Clear
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-muted-foreground hover:text-card-foreground hover:bg-primary transition-all font-medium cursor-pointer"
                      onClick={() => fileRef.current?.click()}
                    >
                      Browse
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap justify-center gap-3">
                  {previews.length === 0 ? (
                    <div className="col-span-full py-8 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                      <ImageIcon className="w-12 h-12 mb-2" />
                      <div className="text-sm">No image selected</div>
                    </div>
                  ) : (
                    previews.map((p, idx) => (
                      <div
                        key={p}
                        className="relative rounded overflow-hidden bg-gray-50"
                      >
                        <img
                          src={p}
                          alt={`preview-${idx}`}
                          className="w-full h-36 object-cover"
                        />
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
