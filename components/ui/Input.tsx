import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  prefix?: string
  suffix?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, prefix, suffix, id, ...props }, ref) => {
    const inputId = id ?? label?.replace(/\s+/g, '-').toLowerCase()

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-300 mb-1.5 text-right"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {prefix && (
            <span className="absolute right-3 text-gray-400 text-sm select-none">{prefix}</span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full bg-surface-input border border-surface-border rounded-xl px-4 py-3 text-white text-right',
              'placeholder:text-gray-500',
              'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent',
              'transition-colors duration-200',
              'min-h-touch',
              error && 'border-red-500 focus:ring-red-500',
              prefix && 'pr-10',
              suffix && 'pl-10',
              className
            )}
            dir="rtl"
            {...props}
          />
          {suffix && (
            <span className="absolute left-3 text-gray-400 text-sm select-none">{suffix}</span>
          )}
        </div>
        {hint && !error && <p className="mt-1 text-xs text-gray-500 text-right">{hint}</p>}
        {error && <p className="mt-1 text-xs text-red-400 text-right">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
export { Input }
