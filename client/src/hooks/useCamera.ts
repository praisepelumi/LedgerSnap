import { useRef, useState, useCallback, useEffect } from "react";

interface UseCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement>;
  isStreaming: boolean;
  error: string | null;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  capturePhoto: () => File | null;
  switchCamera: () => Promise<void>;
  facingMode: "user" | "environment";
}

export function useCamera(): UseCameraReturn {
  const videoRef = useRef<HTMLVideoElement>(null!);
  const streamRef = useRef<MediaStream | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">(
    "environment"
  );

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
  }, []);

  const startCamera = useCallback(
    async (mode?: "user" | "environment") => {
      try {
        setError(null);
        stopCamera();

        const currentMode = mode || facingMode;

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: currentMode,
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
        });

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        setIsStreaming(true);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Camera access denied";
        setError(message);
        setIsStreaming(false);
      }
    },
    [facingMode, stopCamera]
  );

  const capturePhoto = useCallback((): File | null => {
    const video = videoRef.current;
    if (!video || !isStreaming) return null;

    const canvas = document.createElement("canvas");
    // Use actual video dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0);

    // Compress to JPEG
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);

    // Convert data URL to File
    const byteString = atob(dataUrl.split(",")[1]);
    const mimeType = "image/jpeg";
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: mimeType });
    const file = new File([blob], `receipt-${Date.now()}.jpg`, {
      type: mimeType,
    });

    return file;
  }, [isStreaming]);

  const switchCamera = useCallback(async () => {
    const newMode = facingMode === "user" ? "environment" : "user";
    setFacingMode(newMode);
    if (isStreaming) {
      await startCamera(newMode);
    }
  }, [facingMode, isStreaming, startCamera]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    videoRef,
    isStreaming,
    error,
    startCamera,
    stopCamera,
    capturePhoto,
    switchCamera,
    facingMode,
  };
}
