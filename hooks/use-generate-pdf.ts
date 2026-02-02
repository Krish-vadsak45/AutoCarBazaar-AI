"use client";

import { useCallback } from "react";
import { toJpeg } from "html-to-image";
import jsPDF from "jspdf";

export const useGeneratePDF = () => {
  const generatePDF = useCallback(
    async (container: HTMLElement, title?: string) => {
      if (!container) return;

      try {
        const pdf = new jsPDF({
          orientation: "p",
          unit: "mm",
          format: "a4",
          compress: true,
        });

        const pages = Array.from(container.children) as HTMLElement[];

        if (pages.length === 0) {
          pages.push(container);
        }

        for (let i = 0; i < pages.length; i++) {
          const page = pages[i];

          // Let's force-load images by creating a new Image object for each to check validity
          const imgs = Array.from(page.getElementsByTagName("img"));

          await Promise.all(
            imgs.map((img) => {
              return new Promise((resolve) => {
                if (img.complete && img.naturalHeight !== 0)
                  return resolve(true);

                const testImg = new Image();
                testImg.onload = () => resolve(true);
                testImg.onerror = () => {
                  console.warn("Skipping broken image in PDF:", img.src);
                  img.style.visibility = "hidden"; // Hide it if it's broken
                  resolve(false);
                };
                testImg.src = img.src;
              });
            }),
          );

          // Small pause for any lazy-loaded styles
          await new Promise((r) => setTimeout(r, 500));

          const dataUrl = await toJpeg(page, {
            quality: 0.9,
            pixelRatio: 1.5, // Lowering slightly for better stability on memory-constrained devices
            backgroundColor: "#ffffff",
            cacheBust: true,
            skipFonts: true,
          });

          if (i > 0) pdf.addPage();
          pdf.addImage(dataUrl, "JPEG", 0, 0, 210, 297, undefined, "FAST");
        }

        pdf.save(`${title?.replace(/ /g, "_") || "Vehicle"}_Report.pdf`);
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
