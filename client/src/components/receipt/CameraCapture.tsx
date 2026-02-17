import {
  CameraIcon,
  ArrowsRightLeftIcon,
} from "@heroicons/react/24/outline";

interface CameraCaptureProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  isStreaming: boolean;
  error: string | null;
  onStart: () => void;
  onCapture: () => void;
  onSwitch: () => void;
}

export function CameraCapture({
  videoRef,
  isStreaming,
  error,
  onStart,
  onCapture,
  onSwitch,
}: CameraCaptureProps) {
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <CameraIcon className="w-12 h-12 text-ink-300 mb-3" />
        <p className="text-ink-500 mb-1">Camera not available</p>
        <p className="text-sm text-ink-400 max-w-sm">{error}</p>
        <button onClick={onStart} className="btn-secondary mt-4">
          Try Again
        </button>
      </div>
    );
  }

  if (!isStreaming) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-20 h-20 rounded-full bg-ink-100 flex items-center justify-center mb-4">
          <CameraIcon className="w-10 h-10 text-ink-400" />
        </div>
        <p className="text-ink-500 mb-4">
          Point your camera at a receipt
        </p>
        <button onClick={onStart} className="btn-primary">
          Open Camera
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Video viewfinder */}
      <div className="relative rounded-xl overflow-hidden bg-black aspect-[3/4] max-h-[60vh]">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />

        {/* Viewfinder overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-4 border-2 border-white/30 rounded-lg" />
          <div className="absolute top-4 left-4 w-8 h-8 border-l-3 border-t-3 border-white rounded-tl-lg" />
          <div className="absolute top-4 right-4 w-8 h-8 border-r-3 border-t-3 border-white rounded-tr-lg" />
          <div className="absolute bottom-4 left-4 w-8 h-8 border-l-3 border-b-3 border-white rounded-bl-lg" />
          <div className="absolute bottom-4 right-4 w-8 h-8 border-r-3 border-b-3 border-white rounded-br-lg" />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-6 mt-4">
        <button
          onClick={onSwitch}
          className="w-12 h-12 rounded-full bg-ink-100 flex items-center justify-center
            text-ink-600 hover:bg-ink-200 transition-colors"
          aria-label="Switch camera"
        >
          <ArrowsRightLeftIcon className="w-5 h-5" />
        </button>

        {/* Shutter button */}
        <button
          onClick={onCapture}
          className="w-16 h-16 rounded-full bg-receipt-stamp flex items-center justify-center
            shadow-lg hover:bg-red-600 active:scale-95 transition-all"
          aria-label="Take photo"
        >
          <div className="w-12 h-12 rounded-full border-3 border-white" />
        </button>

        <div className="w-12" /> {/* Spacer for symmetry */}
      </div>
    </div>
  );
}
