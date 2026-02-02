"use client";

import { useCallback } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export const useGeneratePDF = () => {
  const generatePDF = useCallback(async (carData: any, images: string[]) => {
    const specs = carData?.specs || {};

    // Create a temporary container
    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.left = "-9999px";
    container.style.width = "210mm"; // A4 width
    // A4 height is approx 297mm - setting min-height slightly less to allow fitting content
    container.style.minHeight = "297mm";
    container.style.background = "#ffffff";
    container.style.fontFamily = "'Inter', Arial, sans-serif";
    container.style.color = "#1f2937";
    container.style.padding = "0"; // Reset padding to control layout manually
    container.style.boxSizing = "border-box";

    // Build HTML content with premium styling
    container.innerHTML = `
      <div style="width: 100%; display: flex; flex-direction: column; min-height: 297mm;">
        
        <!-- Premium Header Banner -->
        <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 40px; color: white; display: flex; justify-content: space-between; align-items: flex-end;">
          <div>
            <h1 style="font-size: 32px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">VEHICLE REPORT</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 14px; font-weight: 500;">PREMIUM DOCUMENTATION</p>
          </div>
          <div style="text-align: right;">
            <p style="margin: 0; font-size: 12px; opacity: 0.8;">GENERATED ON</p>
            <p style="margin: 2px 0 0 0; font-weight: 700; font-size: 14px;">
              ${new Date()
                .toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
                .toUpperCase()}
            </p>
          </div>
        </div>

        <!-- Main Content Area -->
        <div style="padding: 40px; flex: 1;">
          
          <!-- Hero Section: Title & Price -->
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; border-bottom: 2px solid #f3f4f6; padding-bottom: 25px;">
            <div style="max-width: 65%;">
              <h2 style="font-size: 36px; font-weight: 900; margin: 0 0 10px 0; line-height: 1.1; color: #111827;">
                ${carData?.title || "Unknown Vehicle"}
              </h2>
              ${
                specs?.make && specs?.model
                  ? `
                <div style="display: inline-block; background: #eff6ff; padding: 6px 12px; border-radius: 6px;">
                  <span style="color: #2563eb; font-weight: 700; font-size: 12px; letter-spacing: 0.5px; text-transform: uppercase;">
                    ${specs.make} ${specs.model}
                  </span>
                </div>
              `
                  : ""
              }
            </div>
            
            <div style="text-align: right;">
              <p style="margin: 0; font-size: 13px; font-weight: 600; color: #6b7280; text-transform: uppercase;">Listing Price</p>
              <p style="margin: 5px 0 0 0; font-size: 42px; font-weight: 900; color: #2563eb; line-height: 1;">
                ₹${carData?.price?.toLocaleString() || "N/A"}
              </p>
            </div>
          </div>

          <!-- Featured Image - Full Width -->
          ${
            images[0]
              ? `
            <div style="margin-bottom: 40px; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1); border: 1px solid #e5e7eb;">
              <img src="${images[0]}" style="width: 100%; height: 350px; object-fit: cover; display: block;" />
            </div>
          `
              : ""
          }

          <!-- Grid Layout for Specs & Details -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px;">
            
            <!-- Left Column: Technical Specs -->
            <div>
              <div style="display: flex; align-items: center; margin-bottom: 20px;">
                <div style="width: 4px; height: 24px; background: #2563eb; margin-right: 12px; border-radius: 2px;"></div>
                <h3 style="font-size: 20px; font-weight: 800; margin: 0; color: #111827;">SPECIFICATIONS</h3>
              </div>
              
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                ${[
                  { label: "Year", value: specs?.year },
                  { label: "Mileage", value: specs?.mileage },
                  { label: "Fuel Type", value: specs?.fuelType },
                  { label: "Transmission", value: carData?.transmission },
                  { label: "Body Type", value: carData?.bodyType },
                  { label: "Color", value: specs?.color },
                  { label: "Make", value: specs?.make },
                  { label: "Model", value: specs?.model },
                ]
                  .filter((item) => item.value)
                  .map(
                    (item) => `
                  <div style="background: #f9fafb; padding: 12px; border-radius: 8px; border: 1px solid #f3f4f6;">
                    <p style="font-size: 10px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700; margin: 0 0 4px 0;">
                      ${item.label}
                    </p>
                    <p style="font-size: 14px; font-weight: 700; color: #1f2937; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                      ${item.value}
                    </p>
                  </div>
                `
                  )
                  .join("")}
              </div>
            </div>

            <!-- Right Column: Description -->
            <div>
              <div style="display: flex; align-items: center; margin-bottom: 20px;">
                <div style="width: 4px; height: 24px; background: #2563eb; margin-right: 12px; border-radius: 2px;"></div>
                <h3 style="font-size: 20px; font-weight: 800; margin: 0; color: #111827;">OVERVIEW</h3>
              </div>
              
              <div style="background: #f9fafb; padding: 20px; border-radius: 12px; border: 1px solid #f3f4f6; height: 100%;">
                <p style="font-size: 14px; line-height: 1.8; color: #4b5563; margin: 0; text-align: justify;">
                  ${
                    carData?.description ||
                    "No description available for this vehicle."
                  }
                </p>
              </div>
            </div>
          </div>

          <!-- Features Section - Full Width -->
          ${
            carData?.features && carData.features.length > 0
              ? `
            <div style="margin-bottom: 40px;">
              <div style="display: flex; align-items: center; margin-bottom: 20px;">
                <div style="width: 4px; height: 24px; background: #2563eb; margin-right: 12px; border-radius: 2px;"></div>
                <h3 style="font-size: 20px; font-weight: 800; margin: 0; color: #111827;">KEY FEATURES</h3>
              </div>
              
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
                ${carData.features
                  .map(
                    (feature: string) => `
                  <div style="display: flex; align-items: center; gap: 8px; border-bottom: 1px solid #f3f4f6; padding-bottom: 8px; padding-top: 8px;">
                    <div style="width: 6px; height: 6px; background: #2563eb; border-radius: 50%; flex-shrink: 0;"></div>
                    <span style="color: #374151; font-weight: 500; font-size: 13px;">${feature}</span>
                  </div>
                `
                  )
                  .join("")}
              </div>
            </div>
          `
              : ""
          }

          <!-- Gallery Strip - If more images exist -->
          ${
            images.length > 1
              ? `
            <div style="margin-bottom: 20px;">
              <div style="display: flex; align-items: center; margin-bottom: 20px;">
                <div style="width: 4px; height: 24px; background: #2563eb; margin-right: 12px; border-radius: 2px;"></div>
                <h3 style="font-size: 20px; font-weight: 800; margin: 0; color: #111827;">GALLERY</h3>
              </div>
              <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px;">
                ${images
                  .slice(1, 5)
                  .map(
                    (img: string) => `
                  <div style="border-radius: 8px; overflow: hidden; height: 120px; border: 1px solid #e5e7eb;">
                    <img src="${img}" style="width: 100%; height: 100%; object-fit: cover; display: block;" />
                  </div>
                `
                  )
                  .join("")}
              </div>
            </div>
          `
              : ""
          }

        </div>

        <!-- Footer -->
        <div style="background: #f3f4f6; padding: 20px 40px; border-top: 1px solid #e5e7eb; margin-top: auto;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <p style="margin: 0; font-size: 12px; color: #6b7280; font-weight: 600;">
              VEHICLE REPORT &bull; PAGE 1 OF 1
            </p>
            <p style="margin: 0; font-size: 12px; color: #2563eb; font-weight: 700;">
              CONFIDENTIAL DOCUMENT
            </p>
          </div>
        </div>

      </div>
    `;

    document.body.appendChild(container);

    try {
      const canvas = await html2canvas(container, {
        scale: 2, // High resolution
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: container.scrollWidth,
        windowHeight: container.scrollHeight,
      });

      const imgData = canvas.toDataURL("image/png");

      // Calculate dimensions properly for A4
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const pdf = new jsPDF("p", "mm", "a4");

      // If content is taller than A4, we handle single page scaling or multi-page
      // For this design, we fit to one page or crop gracefully
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);

      // Handle potential second page if content overflows significantly
      // (Optional simple implementation for long content)
      heightLeft -= pageHeight;
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(
        `${
          carData?.title?.replace(/[^a-z0-9]/gi, "_").toLowerCase() || "vehicle"
        }_report.pdf`
      );
    } catch (error) {
      console.error("PDF generation failed:", error);
    } finally {
      if (document.body.contains(container)) {
        document.body.removeChild(container);
      }
    }
  }, []);

  return { generatePDF };
};
