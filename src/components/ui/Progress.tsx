import React from 'react';
import { cn } from '../../lib/utils';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'error';
  showLabel?: boolean;
  label?: string;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ 
    className, 
    value = 0, 
    max = 100, 
    size = 'md',
    variant = 'default',
    showLabel = false,
    label,
    ...props 
  }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    
    const sizes = {
      sm: 'h-2',
      md: 'h-3',
      lg: 'h-4'
    };

    const variants = {
      default: 'bg-blue-600',
      success: 'bg-green-600',
      warning: 'bg-yellow-600',
      error: 'bg-red-600'
    };

    return (
      <div className="w-full space-y-2">
        {(showLabel || label) && (
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">
              {label || 'Progress'}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(percentage)}%
            </span>
          </div>
        )}
        
        <div
          ref={ref}
          className={cn(
            'w-full bg-gray-200 rounded-full overflow-hidden',
            sizes[size],
            className
          )}
          {...props}
        >
          <div
            className={cn(
              'h-full transition-all duration-300 ease-in-out rounded-full',
              variants[variant]
            )}
            style={{ width: `${percentage}%` }}
            role="progressbar"
            aria-valuenow={value}
            aria-valuemin={0}
            aria-valuemax={max}
          />
        </div>
      </div>
    );
  }
);

Progress.displayName = 'Progress';

// Circular Progress Component
interface CircularProgressProps extends React.SVGAttributes<SVGSVGElement> {
  value?: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  variant?: 'default' | 'success' | 'warning' | 'error';
  showLabel?: boolean;
  label?: string;
}

const CircularProgress = React.forwardRef<SVGSVGElement, CircularProgressProps>(
  ({ 
    className,
    value = 0,
    max = 100,
    size = 120,
    strokeWidth = 8,
    variant = 'default',
    showLabel = false,
    label,
    ...props
  }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    const variants = {
      default: 'stroke-blue-600',
      success: 'stroke-green-600',
      warning: 'stroke-yellow-600',
      error: 'stroke-red-600'
    };

    return (
      <div className="relative inline-flex items-center justify-center">
        <svg
          ref={ref}
          className={cn('transform -rotate-90', className)}
          width={size}
          height={size}
          {...props}
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            className="text-gray-200"
          />
          
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={cn(
              'transition-all duration-300 ease-in-out',
              variants[variant]
            )}
          />
        </svg>
        
        {(showLabel || label) && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {Math.round(percentage)}%
              </div>
              {label && (
                <div className="text-sm text-gray-500">
                  {label}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
);

CircularProgress.displayName = 'CircularProgress';

export {
  Progress,
  CircularProgress,
  type ProgressProps,
  type CircularProgressProps
};