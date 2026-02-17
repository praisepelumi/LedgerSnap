import { DocumentTextIcon } from "@heroicons/react/24/outline";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 rounded-full bg-ink-100 flex items-center justify-center mb-4">
        {icon || (
          <DocumentTextIcon className="w-8 h-8 text-ink-300" />
        )}
      </div>
      <h3 className="font-display text-lg text-ink-600 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-ink-400 text-center max-w-sm">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
