import * as React from "react"
import { cn } from "@/lib/utils"

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
  size?: 'sm' | 'default' | 'lg'
  variant?: 'default' | 'accent' | 'success' | 'warning'
  showLabel?: boolean
  label?: string
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ 
    className, 
    value = 0, 
    max = 100, 
    size = 'default',
    variant = 'default',
    showLabel = false,
    label,
    ...props 
  }, ref) => {
    const percentage = Math.min((value / max) * 100, 100)
    
    const sizeClasses = {
      sm: "h-2",
      default: "h-3",
      lg: "h-4"
    }
    
    const variantClasses = {
      default: "bg-gradient-to-r from-primary-500 to-primary-600",
      accent: "bg-gradient-to-r from-accent-500 to-accent-600",
      success: "bg-gradient-to-r from-green-500 to-green-600",
      warning: "bg-gradient-to-r from-orange-500 to-orange-600"
    }

    return (
      <div className="w-full" ref={ref} {...props}>
        {showLabel && (
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              {label || `${percentage.toFixed(0)}%`}
            </span>
            <span className="text-sm text-gray-500">
              {value.toLocaleString()} / {max.toLocaleString()}
            </span>
          </div>
        )}
        <div
          className={cn(
            "progress-bar",
            sizeClasses[size],
            className
          )}
        >
          <div
            className={cn(
              "progress-fill rounded-full transition-all duration-700 ease-out",
              variantClasses[variant]
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    )
  }
)
Progress.displayName = "Progress"

export { Progress }
