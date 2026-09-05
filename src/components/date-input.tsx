'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

const MONTHS_FR = [
  'Janvier','Février','Mars','Avril','Mai','Juin',
  'Juillet','Août','Septembre','Octobre','Novembre','Décembre',
]

interface DateInputProps {
  value?: string   // "YYYY-MM-DD"
  onChange: (value: string) => void
  className?: string
}

export function DateInput({ value, onChange, className }: DateInputProps) {
  const [day,   setDay]   = useState('')
  const [month, setMonth] = useState('')
  const [year,  setYear]  = useState('')

  useEffect(() => {
    if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [y, m, d] = value.split('-')
      setYear(y)
      setMonth(String(parseInt(m)))
      setDay(String(parseInt(d)))
    }
  }, [value])

  function emit(d: string, m: string, y: string) {
    if (d && m && y && y.length === 4) {
      onChange(`${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`)
    }
  }

  const currentYear   = new Date().getFullYear()
  const years         = Array.from({ length: 110 }, (_, i) => currentYear + 10 - i)
  const daysInMonth   = month && year
    ? new Date(parseInt(year || String(currentYear)), parseInt(month), 0).getDate()
    : 31
  const days          = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  // Clamp day when month/year changes
  useEffect(() => {
    if (day && daysInMonth < parseInt(day)) {
      const clamped = String(daysInMonth)
      setDay(clamped)
      emit(clamped, month, year)
    }
    // intentionally not including emit in deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [daysInMonth])

  const col   = 'flex flex-col gap-1'
  const label = 'text-[10px] uppercase tracking-widest text-muted-foreground/50 font-medium select-none'
  const sel   = cn(
    'bg-transparent border-0 border-b-2 border-border text-foreground text-sm',
    'focus:outline-none focus:border-foreground py-1.5 pr-1 pl-0 cursor-pointer',
    'appearance-none transition-colors',
    className,
  )

  return (
    <div className="flex flex-wrap sm:flex-nowrap items-end gap-2 sm:gap-5 mt-3">
      <div className={col}>
        <span className={label}>Jour</span>
        <select
          value={day}
          onChange={e => { setDay(e.target.value); emit(e.target.value, month, year) }}
          className={cn(sel, 'w-full sm:w-16')}
          aria-label="Jour"
        >
          <option value="" disabled>—</option>
          {days.map(d => (
            <option key={d} value={String(d)}>{String(d).padStart(2, '0')}</option>
          ))}
        </select>
      </div>

      <div className={col}>
        <span className={label}>Mois</span>
        <select
          value={month}
          onChange={e => { setMonth(e.target.value); emit(day, e.target.value, year) }}
          className={cn(sel, 'w-full sm:w-32')}
          aria-label="Mois"
        >
          <option value="" disabled>—</option>
          {MONTHS_FR.map((m, i) => (
            <option key={i + 1} value={String(i + 1)}>{m}</option>
          ))}
        </select>
      </div>

      <div className={col}>
        <span className={label}>Année</span>
        <select
          value={year}
          onChange={e => { setYear(e.target.value); emit(day, month, e.target.value) }}
          className={cn(sel, 'w-full sm:w-20')}
          aria-label="Année"
        >
          <option value="" disabled>—</option>
          {years.map(y => (
            <option key={y} value={String(y)}>{y}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
