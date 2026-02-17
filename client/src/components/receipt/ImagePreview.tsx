interface ImagePreviewProps {
  src: string;
  alt?: string;
  onRetake?: () => void;
  onConfirm?: () => void;
  showActions?: boolean;
}

export function ImagePreview({
  src,
  alt = "Receipt preview",
  onRetake,
  onConfirm,
  showActions = true,
}: ImagePreviewProps) {
  return (
    <div className="space-y-4">
      <div className="relative rounded-lg overflow-hidden border border-receipt-line shadow-receipt bg-white">
        <img
          src={src}
          alt={alt}
          className="w-full max-h-[400px] object-contain"
        />
      </div>

      {showActions && (onRetake || onConfirm) && (
        <div className="flex gap-3">
          {onRetake && (
            <button onClick={onRetake} className="btn-secondary flex-1">
              Retake
            </button>
          )}
          {onConfirm && (
            <button onClick={onConfirm} className="btn-primary flex-1">
              Use Photo
            </button>
          )}
        </div>
      )}
    </div>
  );
}
