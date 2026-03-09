import type { ReactNode } from 'react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-4"
      style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-brand-500/20 mb-4 shadow-xl shadow-brand-500/20">
            <span className="text-4xl">💪</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">PowerTracker</h1>
          <p className="text-gray-400 mt-1 text-sm">עקוב אחר כוחך</p>
        </div>
        {children}
      </div>
    </div>
  )
}
