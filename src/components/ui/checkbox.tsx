"use client"

import * as React from "react"
// import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
// import { Check } from "lucide-react"

import { cn } from "../../lib/utils"

interface CheckboxProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLDivElement, CheckboxProps>(
  ({ className, checked = false, onCheckedChange, ...props }, ref) => {
    const handleClick = () => {
      onCheckedChange?.(!checked);
    };

    return (
      <div
        ref={ref}
        className={cn(
          "w-4 h-4 border border-input rounded-sm flex items-center justify-center cursor-pointer transition-colors",
          checked ? "bg-primary border-primary text-primary-foreground" : "hover:border-primary",
          className
        )}
        onClick={handleClick}
        role="checkbox"
        aria-checked={checked}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            handleClick();
          }
        }}
        {...props}
      >
        {checked && (
          <svg
            className="w-3 h-3 fill-current"
            viewBox="0 0 12 12"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
          </svg>
        )}
      </div>
    );
  }
);
Checkbox.displayName = "DebugCheckbox"

export { Checkbox }