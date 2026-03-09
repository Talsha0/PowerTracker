'use client'

import { type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Button } from '@/components/ui/Button'

interface HeaderProps {
  title: string
  showBack?: boolean
  rightAction?: ReactNode
  className?: string
  transparent?: boolean
}

export function Header({ title, showBack, rightAction, className, transparent }: HeaderProps) {
  const router = useRouter()

  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex items-center justify-between px-4 h-14',
        !transparent && 'bg-surface-card/95 backdrop-blur-md border-b border-surface-border',
        className
      )}
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      {/* Left side (RTL: appears on left) */}
      <div className="w-10">
        {rightAction}
      </div>

      {/* Title — center */}
      <h1 className="text-lg font-bold text-white text-center flex-1 px-2 truncate">
        {title}
      </h1>

      {/* Right side (RTL: appears on right = back button) */}
      <div className="w-10 flex justify-end">
        {showBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="p-2"
            aria-label="חזור"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        )}
      </div>
    </header>
  )
}
