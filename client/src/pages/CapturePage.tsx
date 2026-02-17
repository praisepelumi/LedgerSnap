import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";
import {
  CameraIcon,
  ArrowUpTrayIcon,
  ArrowPathRoundedSquareIcon,
  ArrowPathIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { useCamera } from "../hooks/useCamera";
import { useParseReceipt } from "../hooks/useParseReceipt";
import { CategorySelect } from "../components/category/CategorySelect";
import { ReviewBanner } from "../components/receipt/ReviewBanner";
import { Spinner } from "../components/ui/Spinner";
import { compressImage, createPreviewUrl, revokePreviewUrl } from "../utils/imageUtils";
import { formatCurrency } from "../utils/formatCurrency";
import type { ParseReceiptResult } from "@receipt/shared";

type Tab = "camera" | "upload";
type Stage = "capture" | "preview" | "analyzing" | "review";

export default function CapturePage() {
  const navigate = useNavigate();

  // ── State ────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<Tab>("camera");
  const [stage, setStage] = useState<Stage>("capture");
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [parseResult, setParseResult] = useState<ParseReceiptResult | null>(null);

  // Editable fields from parse result
  const [vendor, setVendor] = useState("");
  const [date, setDate] = useState("");
  const [total, setTotal] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);

  // ── Hooks ────────────────────────────────────────────────────────────────
  const {
    videoRef,
    isStreaming,
    startCamera,
    stopCamera,
    capturePhoto,
    switchCamera,
    error: cameraError,
  } = useCamera();

  const parseMutation = useParseReceipt();

  // ── Cleanup preview URL on unmount ───────────────────────────────────────
  useEffect(() => {
    return () => {
      if (previewUrl) revokePreviewUrl(previewUrl);
    };
  }, [previewUrl]);

  // ── Handle file selection (from camera or upload) ────────────────────────
  const handleFileSelected = useCallback(
    (file: File) => {
      if (previewUrl) revokePreviewUrl(previewUrl);
      const url = createPreviewUrl(file);
      setCapturedFile(file);
      setPreviewUrl(url);
      setStage("preview");
      stopCamera();
    },
    [previewUrl, stopCamera]
  );

  // ── Camera capture ───────────────────────────────────────────────────────
  const handleCapture = useCallback(() => {
    const file = capturePhoto();
    if (file) {
      handleFileSelected(file);
    } else {
      toast.error("Failed to capture photo. Please try again.");
    }
  }, [capturePhoto, handleFileSelected]);

  // ── Dropzone ─────────────────────────────────────────────────────────────
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        handleFileSelected(acceptedFiles[0]);
      }
    },
    [handleFileSelected]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
    maxFiles: 1,
    multiple: false,
  });

  // ── Retake ───────────────────────────────────────────────────────────────
  const handleRetake = useCallback(() => {
    if (previewUrl) revokePreviewUrl(previewUrl);
    setCapturedFile(null);
    setPreviewUrl(null);
    setParseResult(null);
    setStage("capture");
    if (activeTab === "camera") {
      startCamera();
    }
  }, [previewUrl, activeTab, startCamera]);

  // ── Analyze receipt ──────────────────────────────────────────────────────
  const handleAnalyze = useCallback(async () => {
    if (!capturedFile) return;

    setStage("analyzing");

    try {
      const compressed = await compressImage(capturedFile);
      parseMutation.mutate(compressed, {
        onSuccess: (result: ParseReceiptResult) => {
          setParseResult(result);
          // Populate editable fields
          setVendor(result.receipt.vendor ?? "");
          setDate(result.receipt.date ?? "");
          setTotal(result.receipt.total != null ? String(result.receipt.total) : "");
          setCategoryId(result.receipt.categoryId);
          setStage("review");
        },
        onError: (error: Error) => {
          toast.error(error.message || "Failed to analyze receipt");
          setStage("preview");
        },
      });
    } catch {
      toast.error("Failed to compress image");
      setStage("preview");
    }
  }, [capturedFile, parseMutation]);

  // ── Save & navigate ──────────────────────────────────────────────────────
  const handleSave = useCallback(() => {
    if (!parseResult) return;
    toast.success("Receipt saved!");
    navigate(`/receipts/${parseResult.receipt.id}`);
  }, [parseResult, navigate]);

  // ── Tab switch ───────────────────────────────────────────────────────────
  const handleTabSwitch = useCallback(
    (tab: Tab) => {
      if (stage !== "capture") return;
      setActiveTab(tab);
      if (tab === "camera") {
        startCamera();
      } else {
        stopCamera();
      }
    },
    [stage, startCamera, stopCamera]
  );

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-10">
      <h1 className="page-title font-display text-3xl text-ink-800 mb-6">
        Scan Receipt
      </h1>

      {/* ── Stage: Capture ─────────────────────────────────────────────── */}
      {stage === "capture" && (
        <>
          {/* Tab toggle */}
          <div className="flex gap-1 p-1 bg-ink-100 rounded-lg mb-6">
            <TabButton
              active={activeTab === "camera"}
              onClick={() => handleTabSwitch("camera")}
              icon={<CameraIcon className="w-4 h-4" />}
              label="Camera"
            />
            <TabButton
              active={activeTab === "upload"}
              onClick={() => handleTabSwitch("upload")}
              icon={<ArrowUpTrayIcon className="w-4 h-4" />}
              label="Upload"
            />
          </div>

          {/* Camera tab */}
          {activeTab === "camera" && (
            <div className="flex flex-col items-center">
              {/* Viewfinder */}
              <div className="relative w-full aspect-[3/4] max-h-[70vh] bg-ink-900 rounded-xl overflow-hidden mb-6">
                <video
                  ref={videoRef}
                  className="absolute inset-0 w-full h-full object-cover"
                  autoPlay
                  playsInline
                  muted
                />

                {!isStreaming && !cameraError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                    <CameraIcon className="w-12 h-12 text-ink-400" />
                    <button
                      onClick={() => startCamera()}
                      className="btn-primary"
                    >
                      Start Camera
                    </button>
                  </div>
                )}

                {cameraError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
                    <p className="text-sm text-red-400">{cameraError}</p>
                    <button
                      onClick={() => startCamera()}
                      className="btn-secondary text-sm"
                    >
                      Retry
                    </button>
                  </div>
                )}

                {/* Corner guide marks */}
                {isStreaming && (
                  <div className="absolute inset-6 pointer-events-none">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-white/60 rounded-tl-lg" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-white/60 rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-white/60 rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-white/60 rounded-br-lg" />
                  </div>
                )}
              </div>

              {/* Camera controls */}
              {isStreaming && (
                <div className="flex items-center justify-center gap-8">
                  {/* Switch camera */}
                  <button
                    onClick={switchCamera}
                    className="w-12 h-12 rounded-full bg-ink-800/60 text-white flex items-center justify-center hover:bg-ink-700/80 transition-colors"
                    aria-label="Switch camera"
                  >
                    <ArrowPathRoundedSquareIcon className="w-5 h-5" />
                  </button>

                  {/* Shutter button */}
                  <button
                    onClick={handleCapture}
                    className="w-18 h-18 rounded-full border-4 border-receipt-stamp bg-white flex items-center justify-center hover:bg-receipt-cream transition-colors active:scale-95"
                    style={{ width: 72, height: 72 }}
                    aria-label="Capture photo"
                  >
                    <div className="w-14 h-14 rounded-full bg-receipt-stamp/10 border-2 border-receipt-stamp" />
                  </button>

                  {/* Spacer to balance layout */}
                  <div className="w-12 h-12" />
                </div>
              )}
            </div>
          )}

          {/* Upload tab */}
          {activeTab === "upload" && (
            <div
              {...getRootProps()}
              className={`
                receipt-card border-2 border-dashed cursor-pointer transition-colors
                flex flex-col items-center justify-center py-16 px-6 text-center
                ${
                  isDragActive
                    ? "border-receipt-stamp bg-receipt-stamp/5"
                    : "border-receipt-line hover:border-ink-300"
                }
              `}
            >
              <input {...getInputProps()} />
              <ArrowUpTrayIcon
                className={`w-10 h-10 mb-4 ${
                  isDragActive ? "text-receipt-stamp" : "text-ink-300"
                }`}
              />
              {isDragActive ? (
                <p className="text-sm font-medium text-receipt-stamp">
                  Drop the image here...
                </p>
              ) : (
                <>
                  <p className="text-sm font-medium text-ink-600 mb-1">
                    Drag & drop a receipt image
                  </p>
                  <p className="text-xs text-ink-400">
                    or click to browse (JPEG, PNG, WebP)
                  </p>
                </>
              )}
            </div>
          )}
        </>
      )}

      {/* ── Stage: Preview ─────────────────────────────────────────────── */}
      {stage === "preview" && previewUrl && (
        <div className="flex flex-col items-center">
          <div className="w-full max-h-[60vh] rounded-xl overflow-hidden mb-6 bg-ink-100">
            <img
              src={previewUrl}
              alt="Captured receipt"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex gap-3 w-full">
            <button
              onClick={handleRetake}
              className="btn-secondary flex-1 flex items-center justify-center gap-2"
            >
              <ArrowPathIcon className="w-4 h-4" />
              Retake
            </button>
            <button
              onClick={handleAnalyze}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              <CheckIcon className="w-4 h-4" />
              Use Photo
            </button>
          </div>
        </div>
      )}

      {/* ── Stage: Analyzing ───────────────────────────────────────────── */}
      {stage === "analyzing" && (
        <div className="flex flex-col items-center justify-center py-20">
          <Spinner size="lg" />
          <p className="mt-4 text-ink-500 font-body text-sm">
            Analyzing receipt...
          </p>
          <p className="mt-1 text-ink-300 text-xs">
            This may take a few seconds
          </p>
        </div>
      )}

      {/* ── Stage: Review ──────────────────────────────────────────────── */}
      {stage === "review" && parseResult && (
        <div className="space-y-6">
          {/* Review warnings */}
          {parseResult.reviewItems.length > 0 && (
            <ReviewBanner items={parseResult.reviewItems} />
          )}

          {/* Duplicate warning */}
          {parseResult.duplicateWarning?.isDuplicate && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
              <strong>Possible duplicate:</strong>{" "}
              {parseResult.duplicateWarning.matchReason || "A similar receipt was already scanned."}
            </div>
          )}

          {/* Image thumbnail */}
          {previewUrl && (
            <div className="w-full max-h-48 rounded-xl overflow-hidden bg-ink-100">
              <img
                src={previewUrl}
                alt="Receipt preview"
                className="w-full h-full object-contain"
              />
            </div>
          )}

          {/* Editable fields */}
          <div className="receipt-card p-5 space-y-4">
            <h2 className="section-title font-display text-lg text-ink-700">
              Review Details
            </h2>

            <div>
              <label className="label">Vendor</label>
              <input
                type="text"
                className="input-field"
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                placeholder="Merchant name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Date</label>
                <input
                  type="date"
                  className="input-field"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div>
                <label className="label">Total</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 text-sm">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    className="input-field pl-7"
                    value={total}
                    onChange={(e) => setTotal(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="label">Category</label>
              <CategorySelect
                value={categoryId}
                onChange={setCategoryId}
                suggestedCategory={parseResult.receipt.suggestedCategory}
              />
            </div>

            {/* Quick summary */}
            {parseResult.receipt.lineItems.length > 0 && (
              <div>
                <p className="label">
                  {parseResult.receipt.lineItems.length} line item
                  {parseResult.receipt.lineItems.length !== 1 ? "s" : ""} detected
                </p>
                <p className="text-xs text-ink-400">
                  You can review individual items after saving.
                </p>
              </div>
            )}

            {/* Confidence indicator */}
            <div className="flex items-center gap-2 pt-2 border-t border-receipt-line">
              <div className="flex-1 h-1.5 bg-ink-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    parseResult.receipt.confidence >= 0.8
                      ? "bg-receipt-success"
                      : parseResult.receipt.confidence >= 0.5
                        ? "bg-receipt-warning"
                        : "bg-receipt-danger"
                  }`}
                  style={{
                    width: `${Math.round(parseResult.receipt.confidence * 100)}%`,
                  }}
                />
              </div>
              <span className="text-xs font-mono text-ink-400">
                {Math.round(parseResult.receipt.confidence * 100)}% confidence
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleRetake}
              className="btn-secondary flex-1"
            >
              Scan Again
            </button>
            <button
              onClick={handleSave}
              className="btn-primary flex-1"
            >
              Save & Review
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Tab Button ───────────────────────────────────────────────────────────────

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

function TabButton({ active, onClick, icon, label }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-colors
        ${
          active
            ? "bg-receipt-paper text-ink-800 shadow-sm"
            : "text-ink-400 hover:text-ink-600"
        }
      `}
    >
      {icon}
      {label}
    </button>
  );
}
