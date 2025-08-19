import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ResponsiveFormProps {
  children: React.ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  className?: string;
}

export const ResponsiveForm: React.FC<ResponsiveFormProps> = ({
  children,
  onSubmit,
  className = '',
}) => {
  return (
    <form onSubmit={onSubmit} className={cn('space-y-6', className)}>
      {children}
    </form>
  );
};

// 响应式表单组
export const ResponsiveFormGroup: React.FC<{
  children: React.ReactNode;
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
  className?: string;
}> = ({ children, label, description, error, required, className = '' }) => {
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <div className="space-y-1">
          <Label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </Label>
          {description && (
            <p className="text-xs text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      )}
      <div className="space-y-2">
        {children}
        {error && (
          <div className="flex items-center space-x-2 text-destructive">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// 响应式输入框
export const ResponsiveInput: React.FC<{
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  size?: 'sm' | 'normal' | 'lg';
  error?: boolean;
  className?: string;
  [key: string]: any;
}> = ({ 
  type = 'text', 
  size = 'normal', 
  error = false, 
  className = '', 
  ...props 
}) => {
  return (
    <Input
      type={type}
      className={cn(
        error && 'border-destructive focus-visible:ring-destructive',
        className
      )}
      {...props}
    />
  );
};

// 响应式选择框
export const ResponsiveSelect: React.FC<{
  options: { value: string; label: string; disabled?: boolean }[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  size?: 'sm' | 'normal' | 'lg';
  error?: boolean;
  className?: string;
}> = ({ 
  options, 
  value, 
  onChange, 
  placeholder = '请选择...', 
  size = 'normal',
  error = false,
  className = '' 
}) => {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={cn(
        error && 'border-destructive focus:ring-destructive',
        className
      )}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem 
            key={option.value} 
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

// 响应式文本域
export const ResponsiveTextarea: React.FC<{
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
  error?: boolean;
  className?: string;
  [key: string]: any;
}> = ({ 
  rows = 4, 
  error = false, 
  className = '', 
  ...props 
}) => {
  return (
    <textarea
      rows={rows}
      className={cn(
        'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        error && 'border-destructive focus-visible:ring-destructive',
        className
      )}
      {...props}
    />
  );
};

// 响应式复选框
export const ResponsiveCheckbox: React.FC<{
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  description?: string;
  error?: boolean;
  className?: string;
}> = ({ 
  checked = false, 
  onChange, 
  label, 
  description, 
  error = false,
  className = '' 
}) => {
  return (
    <div className={cn('flex items-start space-x-3', className)}>
      <div className="flex items-center h-5">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange?.(e.target.checked)}
          className={cn(
            'h-4 w-4 rounded border border-input text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2',
            error && 'border-destructive'
          )}
        />
      </div>
      {(label || description) && (
        <div className="flex-1">
          {label && (
            <Label className="text-sm font-medium leading-none">
              {label}
            </Label>
          )}
          {description && (
            <p className="text-xs text-muted-foreground mt-1">
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

// 响应式单选按钮组
export const ResponsiveRadioGroup: React.FC<{
  options: { value: string; label: string; description?: string }[];
  value?: string;
  onChange?: (value: string) => void;
  name: string;
  error?: boolean;
  className?: string;
}> = ({ 
  options, 
  value, 
  onChange, 
  name, 
  error = false,
  className = '' 
}) => {
  return (
    <div className={cn('space-y-3', className)}>
      {options.map((option) => (
        <div key={option.value} className="flex items-start space-x-3">
          <div className="flex items-center h-5">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange?.(e.target.value)}
              className={cn(
                'h-4 w-4 border border-input text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2',
                error && 'border-destructive'
              )}
            />
          </div>
          <div className="flex-1">
            <Label className="text-sm font-medium leading-none">
              {option.label}
            </Label>
            {option.description && (
              <p className="text-xs text-muted-foreground mt-1">
                {option.description}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// 响应式按钮
export const ResponsiveButton: React.FC<{
  children: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  onClick?: () => void;
  className?: string;
}> = ({ 
  children, 
  type = 'button', 
  variant = 'default', 
  size = 'default',
  disabled = false,
  loading = false,
  fullWidth = false,
  onClick,
  className = '' 
}) => {
  return (
    <Button
      type={type}
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        fullWidth && 'w-full',
        className
      )}
    >
      {loading && (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
      )}
      {children}
    </Button>
  );
};

// 表单验证状态指示器
export const FormValidationIndicator: React.FC<{
  isValid?: boolean;
  message?: string;
  className?: string;
}> = ({ isValid, message, className = '' }) => {
  if (!message) return null;

  return (
    <div className={cn(
      'flex items-center space-x-2 mt-2',
      isValid ? 'text-green-600' : 'text-destructive',
      className
    )}>
      {isValid ? (
        <CheckCircle className="h-4 w-4 flex-shrink-0" />
      ) : (
        <AlertCircle className="h-4 w-4 flex-shrink-0" />
      )}
      <span className="text-sm">{message}</span>
    </div>
  );
};

export default ResponsiveForm;