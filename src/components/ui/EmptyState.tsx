import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  /** If true, renders a compact single-line variant without the icon circle */
  compact?: boolean;
}

/**
 * A consistent empty-state placeholder used throughout the dashboard when
 * a list or section has no content to display.
 *
 * @example
 * <EmptyState
 *   icon={FileText}
 *   title="No proposals yet"
 *   description="Create the first proposal for this board."
 *   action={<Button>Create Proposal</Button>}
 * />
 */
export function EmptyState({ icon: Icon, title, description, action, className, compact }: EmptyStateProps) {
  if (compact) {
    return (
      <div className={cn("flex items-center gap-2 py-4 text-foreground-secondary text-sm", className)}>
        {Icon && <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />}
        <span>{title}</span>
        {action && <div className="ml-auto">{action}</div>}
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-label={title}
      className={cn(
        "card-surface flex flex-col items-center justify-center gap-3 px-6 py-12 text-center",
        className
      )}
    >
      {Icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-foreground-secondary">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      )}
      <div>
        <p className="font-medium text-sm">{title}</p>
        {description && (
          <p className="text-sm text-foreground-secondary mt-1 max-w-xs mx-auto">{description}</p>
        )}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
