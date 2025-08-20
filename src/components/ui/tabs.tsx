import * as React from "react";
import { cn } from "@/lib/utils";

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}

const Tabs: React.FC<TabsProps> = ({ value, onValueChange, className, children }) => {
  return (
    <div className={cn("w-full", className)}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          // 向所有子元素传递 currentValue，而不是覆盖它们的 value 属性
          return React.cloneElement(child, { currentValue: value, onValueChange } as any);
        }
        return child;
      })}
    </div>
  );
};

interface TabsListProps {
  className?: string;
  children: React.ReactNode;
  currentValue?: string;
  onValueChange?: (value: string) => void;
}

const TabsList: React.FC<TabsListProps> = ({ className, children, currentValue, onValueChange }) => {
  return (
    <div className={cn(
      "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
      className
    )}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { currentValue, onValueChange } as any);
        }
        return child;
      })}
    </div>
  );
};

interface TabsTriggerProps {
  value: string;
  className?: string;
  children: React.ReactNode;
  currentValue?: string;
  onValueChange?: (value: string) => void;
}

const TabsTrigger: React.FC<TabsTriggerProps> = ({ value, className, children, currentValue, onValueChange }) => {
  const isActive = currentValue === value;
  
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isActive ? "bg-background text-foreground shadow-sm" : "hover:bg-accent hover:text-accent-foreground",
        className
      )}
      onClick={() => onValueChange?.(value)}
    >
      {children}
    </button>
  );
};

interface TabsContentProps {
  value: string; // 该内容对应的标签值
  className?: string;
  children: React.ReactNode;
  currentValue?: string; // 当前激活的标签值
}

const TabsContent: React.FC<TabsContentProps> = ({ value: contentValue, className, children, currentValue }) => {
  if (currentValue !== contentValue) {
    return null;
  }
  
  return (
    <div className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}>
      {children}
    </div>
  );
};

export { Tabs, TabsList, TabsTrigger, TabsContent };