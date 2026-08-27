import { useState, useMemo, type ReactNode } from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react'

export interface Column<T> {
  key: keyof T | string
  header: string
  render?: (item: T) => ReactNode
  sortable?: boolean
  sortValue?: (item: T) => string | number
  className?: string
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  loading?: boolean
  emptyMessage?: string
  error?: string
  pageSize?: number
  onRowClick?: (item: T) => void
}

export default function DataTable<T extends { id?: string }>({
  data,
  columns,
  loading,
  emptyMessage = 'No data found.',
  error,
  pageSize = 15,
  onRowClick,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState(0)

  const sorted = useMemo(() => {
    if (!sortKey) return data
    const col = columns.find(c => c.key === sortKey)
    if (!col) return data
    const getVal = col.sortValue || ((item: T) => {
      const val = item[col.key as keyof T]
      return typeof val === 'string' || typeof val === 'number' ? val : ''
    })
    return [...data].sort((a, b) => {
      const aVal = getVal(a)
      const bVal = getVal(b)
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1
      return 0
    })
  }, [data, sortKey, sortDir, columns])

  const totalPages = Math.ceil(sorted.length / pageSize)
  const paginated = sorted.slice(page * pageSize, (page + 1) * pageSize)

  const handleSort = (col: Column<T>) => {
    if (!col.sortable) return
    if (sortKey === col.key) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(col.key as string)
      setSortDir('asc')
    }
  }

  if (loading) {
    return (
      <div className="bg-card text-card-foreground rounded-lg border border-border overflow-hidden">
        <div className="px-4 py-12 text-center text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-card text-card-foreground rounded-lg border border-destructive overflow-hidden">
        <div className="px-4 py-12 text-center text-destructive">{error}</div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="bg-card text-card-foreground rounded-lg border border-border overflow-hidden">
        <div className="px-4 py-12 text-center text-muted-foreground">{emptyMessage}</div>
      </div>
    )
  }

  return (
    <div className="bg-card text-card-foreground rounded-lg border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted-50 border-b border-border">
            <tr>
              {columns.map(col => (
                <th
                  key={col.key as string}
                  onClick={() => handleSort(col)}
                  className={`text-left px-4 py-2.5 font-medium text-muted-foreground ${col.sortable ? 'cursor-pointer select-none hover:text-foreground' : ''} ${col.className || ''}`}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.header}
                    {col.sortable && sortKey === col.key && (
                      sortDir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                    )}
                    {col.sortable && sortKey !== col.key && (
                      <ChevronsUpDown size={14} className="opacity-30" />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paginated.map((item, i) => (
              <tr
                key={item.id || i}
                onClick={() => onRowClick?.(item)}
                className={onRowClick ? 'hover:bg-muted-30 cursor-pointer' : ''}
              >
                {columns.map(col => (
                  <td key={col.key as string} className={`px-4 py-2.5 ${col.className || ''}`}>
                    {col.render ? col.render(item) : String(item[col.key as keyof T] ?? '—')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-border text-sm">
          <span className="text-muted-foreground">
            Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, sorted.length)} of {sorted.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-muted-foreground">{page + 1} / {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="p-1 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
