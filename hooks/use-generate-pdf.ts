"use client";

import { useCallback } from "react";
import { toJpeg } from "html-to-image";
import jsPDF from "jspdf";

export const useGeneratePDF = () => {
  const generatePDF = useCallback(
    async (container: HTMLElement, title?: string) => {
      if (!container) return;

    try {
      const pages = Array.from(container.children) as HTMLElement[];
      if (pages.length === 0) pages.push(container);

      // We'll initialize the PDF on the first page to get correct dimensions
      let pdf: jsPDF | null = null;

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        
        // Ensure all images are ready
        const imgs = Array.from(page.getElementsByTagName("img"));
        await Promise.all(
          imgs.map((img) => {
            return new Promise((resolve) => {
              if (img.complete && img.naturalHeight !== 0) return resolve(true);
              const testImg = new Image();
              testImg.onload = () => resolve(true);
              testImg.onerror = () => {
                img.style.visibility = "hidden";
                resolve(false);
              };
              testImg.src = img.src;
            });
          })
        );

        // Allow styling to settle
        await new Promise((r) => setTimeout(r, 600));

        // Capture page as high-quality JPEG
        const dataUrl = await toJpeg(page, {
          quality: 1.0,
          pixelRatio: 2, // Sharpness
          backgroundColor: "#ffffff",
          cacheBust: true,
          skipFonts: false,
        });

        // Get actual dimensions of the captured image
        const img = new Image();
        img.src = dataUrl;
        await new Promise((resolve) => (img.onload = resolve));

        // Calculate PDF dimensions in mm (A4 width is 210mm)
        const pdfWidth = 210;
        const pdfHeight = (img.height * pdfWidth) / img.width;

        if (!pdf) {
          pdf = new jsPDF({
            orientation: "p",
            unit: "mm",
            format: [pdfWidth, pdfHeight],
            compress: true
          });
        } else {
          pdf.addPage([pdfWidth, pdfHeight], "p");
        }

        // Add image without stretching
        pdf.addImage(dataUrl, "JPEG", 0, 0, pdfWidth, pdfHeight, undefined, "FAST");
      }

      if (pdf) {
        pdf.save(`${title?.replace(/ /g, "_") || "Vehicle"}_Report.pdf`);
      }
    } catch (error: any) {
        console.error("PDF generation failed:", error);
        // We check if it's the "Event" error which usually means a specific resource failed
        const msg = error?.message || "Internal Capture Error";
        alert(
          `Export Error: ${msg}. Please try scrolling through the preview once before exporting.`,
        );
        throw error;
      }
    },
    [],
  );

  return { generatePDF };
};
