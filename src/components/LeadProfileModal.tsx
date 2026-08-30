import {
  X,
  Phone,
  MessageCircle,
  Instagram,
  Facebook,
  Globe,
  Users as UsersIcon,
  FileSpreadsheet,
  Zap,
  Calendar,
  TrendingUp,
  UserCheck
} from 'lucide-react'

export const sourceConfig: Record<string, { icon: any; color: string; label: string }> = {
  instagram: { icon: Instagram, color: 'text-brand-600 bg-brand-50 dark:bg-brand-900/30', label: 'Instagram' },
  facebook: { icon: Facebook, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30', label: 'Facebook' },
  whatsapp: { icon: MessageCircle, color: 'text-green-600 bg-green-50 dark:bg-green-900/30', label: 'WhatsApp' },
  website: { icon: Globe, color: 'text-brand-600 bg-brand-50 dark:bg-brand-900/30', label: 'Website' },
  walk_in: { icon: UsersIcon, color: 'text-brand-600 bg-brand-50 dark:bg-brand-900/30', label: 'Walk-in' },
  phone: { icon: Phone, color: 'text-slate-600 bg-slate-50 dark:bg-slate-700/30', label: 'Phone' },
  referral: { icon: UsersIcon, color: 'text-teal-600 bg-teal-50 dark:bg-teal-900/30', label: 'Referral' },
  google_ads: { icon: TrendingUp, color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/30', label: 'Google Ads' },
  spreadsheet: { icon: FileSpreadsheet, color: 'text-brand-600 bg-brand-50 dark:bg-brand-900/30', label: 'Spreadsheet' },
  other: { icon: Zap, color: 'text-slate-600 bg-slate-50 dark:bg-slate-700/30', label: 'Other' },
}

/**
 * Shared Lead Profile modal — used by the Leads (CRM) page AND the Dashboard's
 * clickable "Recent Leads" / "Follow-ups" tables so clicking a row anywhere
 * in the app opens the same rich profile view.
 */
export default function LeadProfileModal({
  lead,
  onClose,
  onAction,
  onStatusChange,
  partial = false
}: {
  lead: any
  onClose: () => void
  onAction: (lead: any, action: string) => void
  onStatusChange?: (status: string) => void
  /** true when we only have a partial record (e.g. a follow-up task row) — hides fields we don't actually know */
  partial?: boolean
}) {
  const srcCfg = sourceConfig[lead.source || 'other'] || sourceConfig.other
  const SrcIcon = srcCfg.icon
  const initial = (lead.name || '?').charAt(0).toUpperCase()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 max-w-lg w-full p-6 shadow-2xl space-y-4 my-8 animate-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 dark:border-slate-700 pb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-lg flex-shrink-0 ring-1 ring-brand-100 dark:ring-brand-800/50">
              {initial}
            </div>
            <div className="min-w-0">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white truncate">{lead.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {partial ? 'Quick View — Follow-up Task' : 'Lead Profile & History'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="cursor-pointer p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg flex-shrink-0">
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
          <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/60">
            <p className="text-slate-400 text-xs font-medium">Phone</p>
            {lead.phone ? (
              <a href={`tel:${lead.phone}`} className="font-bold text-blue-600 dark:text-blue-400 hover:underline">{lead.phone}</a>
            ) : (
              <p className="font-bold text-slate-400">—</p>
            )}
          </div>
          <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/60">
            <p className="text-slate-400 text-xs font-medium">Email</p>
            <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{lead.email || '—'}</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/60">
            <p className="text-slate-400 text-xs font-medium">Source</p>
            <span className={`inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded text-xs font-semibold ${srcCfg.color}`}>
              <SrcIcon size={12} /> {srcCfg.label}
            </span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/60">
            <p className="text-slate-400 text-xs font-medium">Status</p>
            {onStatusChange ? (
              <select
                value={lead.status || 'new'}
                onChange={e => onStatusChange(e.target.value)}
                className="mt-1 text-xs font-bold px-2 py-1 border border-slate-200 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="trial">Trial Pass</option>
                <option value="won">Won / Converted</option>
                <option value="lost">Lost</option>
              </select>
            ) : (
              <p className="font-bold text-slate-800 dark:text-slate-200 capitalize mt-0.5">{(lead.status || 'new').replace(/_/g, ' ')}</p>
            )}
          </div>
        </div>

        <div className="space-y-2 text-xs sm:text-sm">
          {!partial && (
            <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700/60">
              <p className="text-slate-400 text-xs font-medium">Fitness Goal / Interest</p>
              <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{lead.fitness_goal || lead.interest || 'Not specified'}</p>
            </div>
          )}

          <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700/60">
            <p className="text-slate-400 text-xs font-medium">{partial ? 'Follow-up Due' : 'Next Follow-Up Date'}</p>
            <p className="font-semibold text-amber-600 dark:text-amber-400 mt-0.5">
              {(lead.next_follow_up_date || lead.due_date)?.split?.('T')?.[0] || lead.next_follow_up_date || 'No follow-up date set'}
            </p>
          </div>

          {lead.notes && (
            <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700/60">
              <p className="text-slate-400 text-xs font-medium">Notes & Activity</p>
              <p className="text-slate-700 dark:text-slate-300 mt-0.5 whitespace-pre-wrap">{lead.notes}</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-2">
          <button
            onClick={() => { onClose(); onAction(lead, 'call') }}
            disabled={!lead.phone}
            className="cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <Phone size={14} /> Call Lead
          </button>
          <button
            onClick={() => { onClose(); onAction(lead, 'whatsapp') }}
            disabled={!lead.phone}
            className="cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed py-2 px-3 bg-brand-700 hover:bg-brand-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <MessageCircle size={14} /> WhatsApp
          </button>
          <button
            onClick={() => { onClose(); onAction(lead, 'followup') }}
            className="cursor-pointer py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <Calendar size={14} /> Set Follow-Up
          </button>
          <button
            onClick={() => { onClose(); onAction(lead, 'convert') }}
            className="cursor-pointer py-2 px-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <UserCheck size={14} /> Convert to Member
          </button>
        </div>
      </div>
    </div>
  )
}
