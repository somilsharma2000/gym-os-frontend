import { useState } from 'react'
import { Star, X, ThumbsUp } from 'lucide-react'
import { api } from '../api/client'

interface FeedbackWidgetProps {
  classId?: string
  className: string
  trainerId?: string
  trainerName?: string
  memberId: string
  memberName: string
  onClose: () => void
}

export default function FeedbackWidget({ classId, className, trainerId, trainerName, memberId, memberName, onClose }: FeedbackWidgetProps) {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const submit = async () => {
    if (rating === 0) return
    setSubmitting(true)
    try {
      await api.submitFeedback({
        class_id: classId || '',
        class_name: className,
        trainer_id: trainerId || '',
        trainer_name: trainerName || '',
        member_id: memberId,
        member_name: memberName,
        rating,
        comment
      })
    } catch (e) { /* fail silently */ }
    setSubmitted(true)
    setSubmitting(false)
  }

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-[#111827] border border-slate-700 rounded-2xl p-6 max-w-sm w-full text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
            <ThumbsUp className="w-7 h-7 text-emerald-400" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">Thanks for your feedback!</h3>
          <p className="text-sm text-slate-400 mb-5">Your rating helps us improve your gym experience.</p>
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-medium text-sm transition-all">Close</button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#111827] border border-slate-700 rounded-2xl p-6 max-w-sm w-full">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-white">Rate Your Class</h3>
            <p className="text-xs text-slate-400 mt-0.5">{className}{trainerName ? ` \u00b7 ${trainerName}` : ''}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"><X size={18} /></button>
        </div>
        <div className="flex items-center justify-center gap-2 py-4">
          {[1, 2, 3, 4, 5].map(star => (
            <button key={star} onClick={() => setRating(star)} onMouseEnter={() => setHover(star)} onMouseLeave={() => setHover(0)} className="transition-transform hover:scale-110 active:scale-95">
              <Star size={36} className={(hover || rating) >= star ? 'fill-amber-400 text-amber-400' : 'text-slate-600'} />
            </button>
          ))}
        </div>
        <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Share your experience (optional)..." className="w-full bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" rows={3} />
        <button onClick={submit} disabled={rating === 0 || submitting} className="w-full mt-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all">{submitting ? 'Submitting...' : 'Submit Rating'}</button>
      </div>
    </div>
  )
}
