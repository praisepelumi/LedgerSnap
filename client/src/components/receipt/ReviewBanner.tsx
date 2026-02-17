import {
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import type { ReviewItem } from "@receipt/shared";

interface ReviewBannerProps {
  items: ReviewItem[];
}

const severityConfig = {
  high: {
    icon: XCircleIcon,
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-800",
    iconColor: "text-red-500",
  },
  medium: {
    icon: ExclamationTriangleIcon,
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-800",
    iconColor: "text-amber-500",
  },
  low: {
    icon: InformationCircleIcon,
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-800",
    iconColor: "text-blue-500",
  },
};

export function ReviewBanner({ items }: ReviewBannerProps) {
  if (items.length === 0) return null;

  // Group by severity
  const grouped = {
    high: items.filter((i) => i.severity === "high"),
    medium: items.filter((i) => i.severity === "medium"),
    low: items.filter((i) => i.severity === "low"),
  };

  return (
    <div className="space-y-2">
      {(["high", "medium", "low"] as const).map((severity) => {
        const group = grouped[severity];
        if (group.length === 0) return null;

        const config = severityConfig[severity];
        const Icon = config.icon;

        return (
          <div
            key={severity}
            className={`${config.bg} ${config.border} border rounded-lg p-3`}
          >
            {group.map((item, i) => (
              <div
                key={i}
                className={`flex items-start gap-2 ${i > 0 ? "mt-2" : ""}`}
              >
                <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${config.iconColor}`} />
                <p className={`text-sm ${config.text}`}>
                  <span className="font-medium capitalize">{item.field}:</span>{" "}
                  {item.message}
                </p>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
