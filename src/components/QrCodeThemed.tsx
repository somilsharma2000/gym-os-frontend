import React, { useState, useEffect } from 'react'
import { Sparkles, Zap, Star, Flame } from 'lucide-react'

export type QrTheme = 'classic' | 'neon' | 'gradient' | 'anime' | 'minimal'

export interface QrCodeThemedProps {
  payload: string
  theme?: QrTheme
  size?: number
  passCode?: string
  showPicker?: boolean
  onThemeChange?: (theme: QrTheme) => void
  className?: string
}

export const THEME_OPTIONS: { id: QrTheme; label: string; swatch: string; description: string }[] = [
  { id: 'classic', label: 'Classic', swatch: 'bg-slate-700 border-slate-500', description: 'Standard dark border' },
  { id: 'neon', label: 'Neon', swatch: 'bg-blue-600 border-cyan-400 shadow-[0_0_8px_#0066ff]', description: 'Glowing cyan & electric blue border' },
  { id: 'gradient', label: 'Gradient', swatch: 'bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400', description: 'Vibrant gradient ring' },
  { id: 'anime', label: 'Anime', swatch: 'bg-gradient-to-r from-amber-400 via-rose-500 to-indigo-500', description: 'Playful rounded frame with corner icons' },
  { id: 'minimal', label: 'Minimal', swatch: 'bg-slate-300 border-slate-400', description: 'Clean thin border' },
]

export default function QrCodeThemed({
  payload,
  theme: defaultTheme = 'classic',
  size = 200,
  passCode,
  showPicker = true,
  onThemeChange,
  className = '',
}: QrCodeThemedProps) {
  const storageKey = passCode ? `gym_os_qr_theme_${passCode}` : null

  const [activeTheme, setActiveTheme] = useState<QrTheme>(() => {
    if (storageKey) {
      const saved = localStorage.getItem(storageKey) || (passCode ? localStorage.getItem(`qr_theme_${passCode}`) : null)
      if (saved && ['classic', 'neon', 'gradient', 'anime', 'minimal'].includes(saved)) {
        return saved as QrTheme
      }
    }
    return defaultTheme
  })

  useEffect(() => {
    if (storageKey) {
      const saved = localStorage.getItem(storageKey) || (passCode ? localStorage.getItem(`qr_theme_${passCode}`) : null)
      if (saved && ['classic', 'neon', 'gradient', 'anime', 'minimal'].includes(saved)) {
        setActiveTheme(saved as QrTheme)
      }
    }
  }, [storageKey, passCode])

  const handleSelectTheme = (newTheme: QrTheme) => {
    setActiveTheme(newTheme)
    if (storageKey) {
      localStorage.setItem(storageKey, newTheme)
      if (passCode) {
        localStorage.setItem(`qr_theme_${passCode}`, newTheme)
      }
    }
    if (onThemeChange) {
      onThemeChange(newTheme)
    }
  }

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(payload)}`

  const renderFrame = () => {
    switch (activeTheme) {
      case 'neon':
        return (
          <div className="relative p-4 rounded-2xl bg-slate-950 border-2 border-[#0066FF] shadow-[0_0_25px_rgba(0,102,255,0.7)] transition-all duration-300">
            {/* Corner accents */}
            <div className="absolute top-1.5 left-1.5 w-3.5 h-3.5 border-t-2 border-l-2 border-cyan-400 rounded-tl-sm pointer-events-none" />
            <div className="absolute top-1.5 right-1.5 w-3.5 h-3.5 border-t-2 border-r-2 border-cyan-400 rounded-tr-sm pointer-events-none" />
            <div className="absolute bottom-1.5 left-1.5 w-3.5 h-3.5 border-b-2 border-l-2 border-cyan-400 rounded-bl-sm pointer-events-none" />
            <div className="absolute bottom-1.5 right-1.5 w-3.5 h-3.5 border-b-2 border-r-2 border-cyan-400 rounded-br-sm pointer-events-none" />

            <div className="bg-white p-3 rounded-xl flex items-center justify-center">
              <img
                src={qrImageUrl}
                alt="QR Code"
                width={size}
                height={size}
                className="block max-w-full h-auto"
              />
            </div>
          </div>
        )

      case 'gradient':
        return (
          <div className="relative p-[5px] rounded-3xl bg-gradient-to-tr from-pink-500 via-purple-500 to-cyan-400 shadow-[0_0_20px_rgba(236,72,153,0.35)] transition-all duration-300">
            <div className="bg-white p-3 rounded-[20px] flex items-center justify-center">
              <img
                src={qrImageUrl}
                alt="QR Code"
                width={size}
                height={size}
                className="block max-w-full h-auto"
              />
            </div>
          </div>
        )

      case 'anime':
        return (
          <div className="relative p-4 rounded-3xl bg-gradient-to-br from-amber-400 via-rose-500 to-indigo-600 shadow-xl transition-all duration-300">
            {/* Corner icons (lucide-react) */}
            <div className="absolute -top-2.5 -left-2.5 w-7 h-7 rounded-full bg-amber-400 text-slate-900 border-2 border-white flex items-center justify-center shadow-md z-10 pointer-events-none">
              <Zap size={14} className="fill-current" />
            </div>
            <div className="absolute -top-2.5 -right-2.5 w-7 h-7 rounded-full bg-pink-500 text-white border-2 border-white flex items-center justify-center shadow-md z-10 pointer-events-none">
              <Sparkles size={14} className="fill-current" />
            </div>
            <div className="absolute -bottom-2.5 -left-2.5 w-7 h-7 rounded-full bg-rose-500 text-white border-2 border-white flex items-center justify-center shadow-md z-10 pointer-events-none">
              <Flame size={14} className="fill-current" />
            </div>
            <div className="absolute -bottom-2.5 -right-2.5 w-7 h-7 rounded-full bg-indigo-500 text-yellow-300 border-2 border-white flex items-center justify-center shadow-md z-10 pointer-events-none">
              <Star size={14} className="fill-current" />
            </div>

            <div className="bg-white p-3 rounded-2xl flex items-center justify-center">
              <img
                src={qrImageUrl}
                alt="QR Code"
                width={size}
                height={size}
                className="block max-w-full h-auto"
              />
            </div>
          </div>
        )

      case 'minimal':
        return (
          <div className="relative p-2.5 rounded-xl bg-white border border-slate-300 dark:border-slate-700 shadow-sm transition-all duration-300">
            <div className="bg-white p-2 rounded-lg flex items-center justify-center">
              <img
                src={qrImageUrl}
                alt="QR Code"
                width={size}
                height={size}
                className="block max-w-full h-auto"
              />
            </div>
          </div>
        )

      case 'classic':
      default:
        return (
          <div className="relative p-3 rounded-2xl bg-[#0a0e17] border border-slate-700 shadow-lg transition-all duration-300">
            <div className="bg-white p-3 rounded-xl flex items-center justify-center">
              <img
                src={qrImageUrl}
                alt="QR Code"
                width={size}
                height={size}
                className="block max-w-full h-auto"
              />
            </div>
          </div>
        )
    }
  }

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      {showPicker && (
        <div className="flex flex-col items-center gap-1.5">
          <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Frame Skin
          </span>
          <div className="flex items-center gap-1.5 bg-[#0a0e17] p-1.5 rounded-xl border border-slate-700/80 shadow-inner">
            {THEME_OPTIONS.map((opt) => {
              const isSelected = activeTheme === opt.id
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectTheme(opt.id)}
                  title={`${opt.label}: ${opt.description}`}
                  className={`group relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-slate-800 text-white ring-1 ring-brand-400 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <span
                    className={`w-3.5 h-3.5 rounded-full ${opt.swatch} border border-white/20 shrink-0 transition-transform ${
                      isSelected ? 'scale-110 ring-1 ring-white' : 'group-hover:scale-105'
                    }`}
                  />
                  <span className="text-[11px] font-medium">{opt.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Styled Frame Container */}
      <div className="my-1 flex items-center justify-center">
        {renderFrame()}
      </div>
    </div>
  )
}
