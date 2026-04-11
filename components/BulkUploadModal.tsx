import React, { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Upload,
  FileSpreadsheet,
  Download,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Lock,
} from "lucide-react";
import { toast } from "react-toastify";
import Papa from "papaparse";
import axios from "axios";

interface BulkUploadProps {
  readonly onSuccess?: () => void;
  /** When true, CSV bulk upload is disabled (requires VIP 5 / priority > 4). */
  readonly locked?: boolean;
  readonly upgradeHref?: string;
}

export function BulkUploadModal({
  onSuccess,
  locked = false,
  upgradeHref = "/vendor",
}: BulkUploadProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    const csvContent =
      "title,price,make,model,year,transmission,bodyType,fuelType,mileage,color,description,features,tags,carAddress\n" +
      '"2023 Toyota Camry",25000,"Toyota","Camry",2023,"Automatic","Sedan","Petrol","10000 km","Silver","Excellent condition car","Bluetooth, Backup Camera","New Arrival, Best Seller","Mumbai, Maharashtra"';

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.body.appendChild(document.createElement("a"));
    link.setAttribute("href", url);
    link.setAttribute("download", "AutoCarBazaar_Template.csv");
    link.click();
    link.remove();
  };

  const processCsvResults = (results: Papa.ParseResult<any>) => {
    const formattedData = results.data.map((row: any) => ({
      title: row.title,
      price: Number(row.price),
      transmission: row.transmission || "Automatic",
      bodyType: row.bodyType || "Sedan",
      description: row.description,
      specs: {
        make: row.make,
        model: row.model,
        year: Number(row.year),
        fuelType: row.fuelType || "Petrol",
        mileage: row.mileage,
        color: row.color,
      },
      features: row.features
        ? row.features.split(",").map((s: string) => s.trim())
        : [],
      tags: row.tags ? row.tags.split(",").map((s: string) => s.trim()) : [],
      carAddress: row.carAddress,
    }));

    setData(formattedData);
    toast.info(`Found ${formattedData.length} vehicles in file`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      toast.error("Please upload a CSV file");
      return;
    }

    setFileName(file.name);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: processCsvResults,
      error: (error: Error) => {
        console.error("CSV Parse error:", error);
        toast.error("Error parsing the CSV file");
      },
    });
  };

  const handleUpload = async () => {
    if (data.length === 0) {
      toast.error("No data found to upload");
      return;
    }

    setIsUploading(true);
    try {
      const res = await axios.post("/api/cars/bulk-upload", { cars: data });
      toast.success(`${res.data.count} vehicles uploaded successfully!`);
      setIsOpen(false);
      setData([]);
      setFileName(null);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error("Upload failed:", error);
      toast.error(
        error.response?.data?.error ||
          "Bulk upload failed. Please check your data format.",
      );
    } finally {
      setIsUploading(false);
    }
  };

  const triggerButton = (
    <Button
      variant="outline"
      className="gap-2 border-primary/50 text-primary hover:bg-primary/5"
      type="button"
    >
      <FileSpreadsheet className="h-4 w-4" /> Bulk Upload
    </Button>
  );

  const lockedTitle = "Bulk upload requires VIP level 5 (priority > 4).";

  if (locked) {
    return (
      <button
        type="button"
        title={lockedTitle}
        className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-md border border-border bg-background px-4 text-sm font-medium text-muted-foreground opacity-80 shadow-sm transition-colors hover:bg-muted/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={() => {
          toast.info(`${lockedTitle}`, { autoClose: 6000 });
        }}
      >
        <Lock className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
        <FileSpreadsheet className="h-4 w-4 shrink-0" aria-hidden />
        <span>Bulk Upload</span>
      </button>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{triggerButton}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Bulk Vehicle Upload</DialogTitle>
          <DialogDescription>
            Download the template, fill in your vehicle data, and upload the CSV
            file here.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col space-y-4 py-4">
          <Button
            variant="ghost"
            size="sm"
            className="w-fit text-primary hover:text-primary/80 hover:bg-primary/5 p-0 h-auto"
            onClick={downloadTemplate}
          >
            <Download className="h-4 w-4 mr-2" /> Download CSV Template
          </Button>

          <button
            type="button"
            className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center transition-colors cursor-pointer w-full ${
              fileName
                ? "border-primary/50 bg-primary/5"
                : "border-muted-foreground/20 hover:border-primary/30"
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".csv"
              onChange={handleFileChange}
            />
            {fileName ? (
              <>
                <CheckCircle2 className="h-10 w-10 text-primary mb-2" />
                <span className="text-sm font-medium text-center truncate max-w-full">
                  {fileName}
                </span>
                <span className="text-xs text-muted-foreground mt-1">
                  {data.length} vehicles detected
                </span>
              </>
            ) : (
              <>
                <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                <span className="text-sm font-medium">
                  Click to select CSV file
                </span>
                <span className="text-xs text-muted-foreground mt-1 text-center">
                  Only .csv files are supported
                </span>
              </>
            )}
          </button>

          <div className="bg-amber-50 dark:bg-amber-950/20 p-3 rounded-md border border-amber-200 dark:border-amber-900">
            <div className="flex gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800 dark:text-amber-300">
                Note: Images cannot be uploaded via CSV. You can add images
                manually by editing the listings after upload.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="sm:justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={isUploading || data.length === 0}
            className="min-w-25"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" /> Processing...
              </>
            ) : (
              "Start Upload"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
