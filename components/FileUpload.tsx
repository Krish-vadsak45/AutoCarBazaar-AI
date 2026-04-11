"use client"; // This component must be a client component

import {
  ImageKitAbortError,
  ImageKitInvalidRequestError,
  ImageKitServerError,
  ImageKitUploadNetworkError,
  upload,
} from "@imagekit/next";
import { forwardRef, useImperativeHandle, useState } from "react";

interface FileUploadProps {
  onSuccess: (res: any) => void;
  onProgress?: (progress: number) => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  /** Default `image` — use `video` for listing walk-around uploads (ImageKit). */
  mediaType?: "image" | "video";
}

export interface FileUploadRef {
  uploadFile: (file: File) => Promise<void>;
}

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_VIDEO_BYTES = 100 * 1024 * 1024;

const FileUpload = forwardRef<FileUploadRef, FileUploadProps>(
  ({ onSuccess, onProgress, inputRef, mediaType = "image" }, ref) => {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const validateFile = (file: File) => {
      if (mediaType === "video") {
        if (!file.type.startsWith("video/")) {
          setError("Please upload a valid video file");
          return false;
        }
        if (file.size > MAX_VIDEO_BYTES) {
          setError("Video size must be less than 100 MB");
          return false;
        }
        return true;
      }
      if (!file.type.startsWith("image/")) {
        setError("Please upload a valid image file");
        return false;
      }
      if (file.size > MAX_IMAGE_BYTES) {
        setError("Image size must be less than 10 MB");
        return false;
      }
      return true;
    };

    const performUpload = async (file: File) => {
      if (!validateFile(file)) return;

      setUploading(true);
      setError(null);

      try {
        const authRes = await fetch("/api/imagekit-auth");
        if (!authRes.ok) throw new Error("Authentication failed");
        const auth = await authRes.json();

        const res = await upload({
          file,
          fileName: file.name,
          publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
          signature: auth.authenticationParameters.signature,
          expire: auth.authenticationParameters.expire,
          token: auth.authenticationParameters.token,
          onProgress: (event) => {
            if (event.lengthComputable && onProgress) {
              const percent = (event.loaded / event.total) * 100;
              onProgress(Math.round(percent));
            }
          },
        });
        onSuccess(res);
      } catch (error: any) {
        console.error("Upload failed", error);
        setError(error.message || "Upload failed");
      } finally {
        setUploading(false);
      }
    };

    useImperativeHandle(ref, () => ({
      uploadFile: performUpload,
    }));

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        await performUpload(file);
      }
    };

    return (
      <>
        <input
          ref={inputRef}
          type="file"
          accept={mediaType === "video" ? "video/*" : "image/*"}
          className="hidden"
          onChange={handleFileChange}
        />
        {uploading && <span>Loading....</span>}
        {error && <span className="text-red-500 text-sm">{error}</span>}
      </>
    );
  }
);

FileUpload.displayName = "FileUpload";

export default FileUpload;