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

export default SkeletonPage
