import React from 'react'

export function SkeletonPage() {
  return (
    <div className="p-6 space-y-4 w-full max-w-4xl animate-pulse">
      <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
      <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
      <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded"></div>
    </div>
  )
}

export function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full animate-pulse p-4">
      <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
      <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
      <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
    </div>
  )
}

export function SkeletonTable() {
  return (
    <div className="space-y-3 w-full animate-pulse p-4">
      <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded"></div>
      <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded"></div>
      <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded"></div>
      <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded"></div>
    </div>
  )
}

export function SkeletonChart() {
  return (
    <div className="h-64 w-full bg-slate-200 dark:bg-slate-700 rounded animate-pulse p-4"></div>
  )
}

export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 animate-pulse shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="h-3.5 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
        <div className="h-5 w-5 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
      </div>
      <div className="h-7 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-2"></div>
      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
    </div>
  )
}

export default SkeletonPage
