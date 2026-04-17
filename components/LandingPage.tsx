"use client";

import React, { useRef, useState } from "react";
import { Image as ImageIcon, X as XIcon, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import FileUpload, { FileUploadRef } from "./FileUpload";

export default function LandingPage() {
  const [showUpload, setShowUpload] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const uploadRef = useRef<FileUploadRef>(null);

  const handleUploadSuccess = (res: any) => {
    setPreviews([res.url]);
    setIsUploading(false);
    setShowUpload(true);
  };

  const handleUploadProgress = (progress: number) => {
    setIsUploading(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShowUpload(true);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && uploadRef.current) {
      setShowUpload(true);
      await uploadRef.current.uploadFile(file);
    }
  };

  const handleClear = () => {
    setPreviews([]);
    setUploadError(null);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: wire up real search; for now just log
    console.log("Search submitted", { previews });
  };

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden mt-17 pb-55">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/landing_page_1.jpg')",
        }}
      ></div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center py-20">
          <h1 className="text-xl sm:text-2xl md:text-6xl font-extrabold tracking-tight text-[#225fbc] drop-shadow-lg">
            Rent The Perfect Ride. Effortless, Fast, Reliable.
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-white drop-shadow-md font-medium">
            Discover high-quality cars near you. Upload a photo of a car you
            like and we’ll find similar models available for rent.
          </p>

          <form
            onSubmit={handleSearch}
            className="mt-10 mx-auto max-w-4xl bg-[#0f172a]/70 dark:bg-slate-950/80 rounded-2xl p-2 sm:p-3 shadow-2xl backdrop-blur-xl border border-white/20 transition-all hover:bg-[#0f172a]/80"
          >
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-0">
              <Input
                aria-label="Search cars by model, city or features"
                placeholder="Search by model, city or features (e.g. Tesla Model 3, New York)"
                className="flex-1 px-4 sm:px-6 rounded-xl border-none bg-transparent text-white placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 text-base sm:text-lg h-14"
              />

              <div className="h-8 w-px bg-white/20 hidden sm:block mx-2"></div>

              <div className="flex w-full sm:w-auto items-center justify-between sm:justify-center gap-2 px-2 pb-2 sm:pb-0 sm:px-2">
                <Button
                  type="button"
                  variant="ghost"
                  className="flex items-center gap-2 text-gray-300 hover:text-white hover:bg-white/10 h-12 px-4 rounded-xl transition-colors"
                  onClick={() => {
                    setShowUpload(true);
                    fileRef.current?.click();
                  }}
                  title="Upload an image"
                >
                  <ImageIcon className="w-5 h-5" />
                  <span className="font-semibold text-sm sm:text-base tracking-wide">
                    Upload
                  </span>
                </Button>

                <Button
                  type="submit"
                  className="px-6 sm:px-8 bg-[#f97316] hover:bg-[#ea580c] text-white font-bold h-12 rounded-xl shadow-lg transition-transform hover:scale-[1.02] text-sm sm:text-base tracking-wide"
                >
                  Search
                </Button>
              </div>
            </div>

            <div className="hidden">
              <FileUpload
                ref={uploadRef}
                inputRef={fileRef}
                onSuccess={handleUploadSuccess}
                onProgress={handleUploadProgress}
              />
            </div>

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
                  {isUploading ? (
                    <div className="col-span-full py-8 flex flex-col items-center justify-center text-primary animate-pulse">
                      <Loader2 className="w-12 h-12 mb-2 animate-spin" />
                      <div className="text-sm">Uploading to ImageKit...</div>
                    </div>
                  ) : previews.length === 0 ? (
                    <div className="col-span-full py-8 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                      <ImageIcon className="w-12 h-12 mb-2" />
                      <div className="text-sm">
                        {uploadError ? (
                          <span className="text-red-500">{uploadError}</span>
                        ) : (
                          "No image selected"
                        )}
                      </div>
                    </div>
                  ) : (
                    previews.map((p, idx) => (
                      <div
                        key={p}
                        className="relative rounded-xl overflow-hidden bg-gray-50 shadow-lg border-2 border-primary/20"
                      >
                        <img
                          src={p}
                          alt={`preview-${idx}`}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute top-2 right-2">
                          <Button
                            variant="destructive"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={handleClear}
                          >
                            <XIcon className="h-4 w-4" />
                          </Button>
                        </div>
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
