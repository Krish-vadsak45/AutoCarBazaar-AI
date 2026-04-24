'use client'; // This component must be a client component

import { upload } from '@imagekit/next';
import type { UploadOptions, UploadResponse } from '@imagekit/next';
import { forwardRef, useImperativeHandle, useState } from 'react';

type FileUploadResponse = UploadResponse;

interface ImageKitAuthResponse {
  authenticationParameters: {
    signature: string;
    expire: number;
    token: string;
  };
  publicKey?: string;
}

interface FileUploadProps {
  onSuccess: (res: FileUploadResponse) => void;
  onProgress?: (progress: number) => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  /** Default `image` — use `video` for listing walk-around uploads (ImageKit). */
  mediaType?: 'image' | 'video';
}

export interface FileUploadRef {
  uploadFile: (file: File) => Promise<void>;
}

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_VIDEO_BYTES = 100 * 1024 * 1024;

const FileUpload = forwardRef<FileUploadRef, FileUploadProps>(
  ({ onSuccess, onProgress, inputRef, mediaType = 'image' }, ref) => {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const validateFile = (file: File) => {
      if (mediaType === 'video') {
        if (!file.type.startsWith('video/')) {
          setError('Please upload a valid video file');
          return false;
        }
        if (file.size > MAX_VIDEO_BYTES) {
          setError('Video size must be less than 100 MB');
          return false;
        }
        return true;
      }
      if (!file.type.startsWith('image/')) {
        setError('Please upload a valid image file');
        return false;
      }
      if (file.size > MAX_IMAGE_BYTES) {
        setError('Image size must be less than 10 MB');
        return false;
      }
      return true;
    };

    const performUpload = async (file: File) => {
      if (!validateFile(file)) {
        return;
      }

      setUploading(true);
      setError(null);

      try {
        const authRes = await fetch('/api/imagekit-auth');
        if (!authRes.ok) {
          throw new Error('Authentication failed');
        }
        const auth: ImageKitAuthResponse = await authRes.json();

        const res = await upload({
          file,
          fileName: file.name,
          publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
          signature: auth.authenticationParameters.signature,
          expire: auth.authenticationParameters.expire,
          token: auth.authenticationParameters.token,
          onProgress: (event: ProgressEvent) => {
            if (event.lengthComputable && onProgress) {
              const percent = (event.loaded / event.total) * 100;
              onProgress(Math.round(percent));
            }
          },
        } satisfies UploadOptions);
        onSuccess(res);
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Upload failed';
        console.error('Upload failed', err);
        setError(errorMsg);
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
        {uploading ? <div className="text-sm text-muted-foreground mb-2">Uploading...</div> : null}
        {error ? <div className="text-sm text-destructive mb-2">{error}</div> : null}
        <input
          ref={inputRef}
          type="file"
          accept={mediaType === 'video' ? 'video/*' : 'image/*'}
          className="hidden"
          onChange={handleFileChange}
        />
        {uploading ? <span>Loading....</span> : null}
        {error ? <span className="text-red-500 text-sm">{error}</span> : null}
      </>
    );
  }
);

FileUpload.displayName = 'FileUpload';

export default FileUpload;
