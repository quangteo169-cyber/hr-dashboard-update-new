// components/ui.tsx
import React from 'react'

/* ── CARD ─────────────────────────────────────────────────── */
export function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div className="ui-card" style={style}>
      {children}
    </div>
  )
}

/* ── CARD TITLE ───────────────────────────────────────────── */
export function CardTitle({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <div style={{ marginBottom: sub ? 4 : 14 }}>
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <span style={{ width:4, height:15, borderRadius:2, background:'var(--accent-grad)', flexShrink:0 }} />
        <span style={{ fontFamily:'Chakra Petch,Be Vietnam Pro,sans-serif', fontSize:14, fontWeight:700, letterSpacing:'.01em', color:'var(--text)' }}>{children}</span>
      </div>
      {sub && <div style={{ fontSize:11, color:'var(--text3)', marginTop:3, marginBottom:12, paddingLeft:12 }}>{sub}</div>}
    </div>
  )
}

/* ── KPI CARD ─────────────────────────────────────────────── */
export function KpiCard({
  label, value, sub, color, pct, icon
}: {
  label: string; value: string | number; sub?: string
  color?: string; pct?: number; icon?: string
}) {
  const c = color || '#33A6FF'
  return (
    <div className="ui-kpi" style={{
      ['--kpi-c' as string]: c,
      background:`linear-gradient(140deg, ${c}16, transparent 52%), var(--bg3)`,
      border:`1px solid ${c}3a`, boxShadow:'var(--shadow-sm)',
      borderRadius:10, padding:'16px 18px', position:'relative', overflow:'hidden',
      clipPath:'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%)',
    } as React.CSSProperties}>
      <div style={{ position:'absolute', top:0, left:0, right:0, height:3,
        background:`linear-gradient(90deg,${c},${c}55 60%,transparent)` }} />
      <div style={{ position:'absolute', top:-34, right:-34, width:120, height:120, borderRadius:'50%',
        background:`radial-gradient(circle, ${c}24, transparent 65%)`, pointerEvents:'none' }} />
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
        <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase',
          letterSpacing:'0.8px', color:'var(--text2)' }}>
          {label}
        </div>
        {icon && (
          <div style={{ width:30, height:30, borderRadius:9,
            background:`linear-gradient(135deg, ${c}30, ${c}0e)`,
            border:`1px solid ${c}45`, boxShadow:`0 4px 12px -4px ${c}55`,
            display:'flex', alignItems:'center',
            justifyContent:'center', fontSize:15 }}>
            {icon}
          </div>
        )}
      </div>
      <div style={{ fontFamily:'Chakra Petch,Be Vietnam Pro,sans-serif', fontSize:'clamp(24px, 7vw, 32px)',
        fontWeight:700, letterSpacing:'-0.01em', color:c, lineHeight:1, marginBottom:6,
        textShadow:`0 0 26px ${c}60` }}>
        {value}
      </div>
      {sub && <div style={{ fontSize:10, color:'var(--text3)' }}>{sub}</div>}
      {pct !== undefined && (
        <div style={{ marginTop:10, height:5, background:'var(--bg4)', borderRadius:3, position:'relative', overflow:'hidden' }}>
          <div className="ui-grow" style={{ height:'100%', width:`${Math.min(pct,100)}%`,
            background:`linear-gradient(90deg,${c},${c}99)`, borderRadius:3,
            boxShadow:`0 0 10px ${c}66` }} />
          <span className="ui-shine" />
        </div>
      )}
    </div>
  )
}

/* ── GRID ─────────────────────────────────────────────────── */
/* Số cột tự giảm trên màn hình nhỏ — rules ở globals.css (.ui-grid) */
export function Grid({ cols, gap, children, style }: {
  cols?: number; gap?: number; children: React.ReactNode; style?: React.CSSProperties
}) {
  return (
    <div className="ui-grid" data-cols={cols || 4} style={{
      ['--cols' as string]: cols || 4,
      ['--gap' as string]: `${gap || 12}px`,
      ...style,
    } as React.CSSProperties}>
      {children}
    </div>
  )
}

/* ── SECTION HEADER ───────────────────────────────────────── */
export function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background:'linear-gradient(90deg, color-mix(in srgb, #00C8FF 13%, var(--bg2)), var(--bg2) 70%)',
      border:'1px solid var(--border)', borderLeft:'3px solid #00C8FF',
      borderRadius:10, padding:'11px 16px',
      fontFamily:'Chakra Petch,Be Vietnam Pro,sans-serif',
      fontSize:12.5, fontWeight:600, color:'var(--text)', letterSpacing:'.02em',
      marginBottom:14, boxShadow:'var(--shadow-sm), inset 3px 0 8px -4px rgba(0,200,255,.5)',
    }}>
      {children}
    </div>
  )
}

/* ── PCT BAR ──────────────────────────────────────────────── */
export function PctBar({ value, max, color }: { value: number; max: number; color?: string }) {
  const w = max > 0 ? Math.round(value / max * 100) : 0
  const c = color || '#33A6FF'
  return (
    <div style={{ height:5, background:'var(--bg4)', borderRadius:3, overflow:'hidden', minWidth:60 }}>
      <div className="ui-grow" style={{ height:'100%', width:`${w}%`,
        background:`linear-gradient(90deg,${c},${c}99)`, borderRadius:3 }} />
    </div>
  )
}

/* ── TABLE ────────────────────────────────────────────────── */
export function Table({ headers, rows, colColors }: {
  headers: string[]
  rows: (string | number | React.ReactNode)[][]
  colColors?: (string | undefined)[]
}) {
  return (
    <div style={{ overflowX:'auto', borderRadius:10 }}>
      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:11 }}>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i} style={{
                padding:'9px 10px', textAlign: i===0 ? 'left' : 'center',
                color:'var(--text3)', fontWeight:700, fontSize:9,
                textTransform:'uppercase', letterSpacing:'0.6px',
                borderBottom:'1px solid var(--border2)', whiteSpace:'nowrap',
                background:'var(--bg2)',
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} style={{
              background: ri % 2 === 0 ? 'var(--bg3)' : 'var(--bg4)',
              transition:'background .1s'
            }}>
              {row.map((cell, ci) => (
                <td key={ci} style={{
                  padding:'9px 10px',
                  textAlign: ci===0 ? 'left' : 'center',
                  color: colColors?.[ci] || 'var(--text2)',
                  borderBottom:'1px solid var(--border)',
                  fontFamily: typeof cell === 'number' ? 'Space Mono,monospace' : undefined,
                  fontWeight: ci===0 ? 600 : undefined,
                  fontSize: typeof cell === 'number' ? 12 : 11,
                }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ── FUNNEL BAR ───────────────────────────────────────────── */
export function FunnelBar({ label, count, total, color, sublabel }: {
  label: string; count: number; total: number; color: string; sublabel?: string
}) {
  const w = total > 0 ? count / total * 100 : 0
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
      <div style={{ width:'clamp(84px, 24vw, 160px)', fontSize:10, color:'var(--text2)', textAlign:'right', flexShrink:0 }}>
        {label}
      </div>
      <div style={{ flex:1, height:30, background:'var(--bg4)', borderRadius:8, overflow:'hidden', position:'relative',
        boxShadow:'inset 0 1px 2px rgba(0,0,0,.15)' }}>
        <div className="ui-grow" style={{
          position:'absolute', inset:0, width:`${w}%`,
          background:`linear-gradient(90deg,${color}e6,${color}90)`,
          borderRadius:8, display:'flex', alignItems:'center',
          paddingLeft:9, minWidth: count > 0 ? 40 : 0,
          boxShadow:`inset 0 1px 0 rgba(255,255,255,.18), 0 0 14px ${color}44`,
        }}>
          {count > 0 && (
            <span style={{ fontSize:10, fontWeight:700, color:'#fff',
              fontFamily:'Space Mono,monospace', whiteSpace:'nowrap',
              textShadow:'0 1px 2px rgba(0,0,0,.35)' }}>
              {count}
            </span>
          )}
          <span className="ui-shine" />
        </div>
      </div>
      <div style={{ width:'clamp(56px, 15vw, 90px)', textAlign:'right', flexShrink:0 }}>
        <div style={{ fontFamily:'Space Mono,monospace', fontSize:13,
          fontWeight:700, color }}>
          {count}
        </div>
        <div style={{ fontSize:9, color:'var(--text3)' }}>
          {sublabel || (total > 0 ? `${(w).toFixed(1)}%` : '—')}
        </div>
      </div>
    </div>
  )
}

/* ── BADGE ────────────────────────────────────────────────── */
export function Badge({ text, color }: { text: string; color: string }) {
  return (
    <span style={{
      display:'inline-block', padding:'2px 9px', borderRadius:999,
      fontSize:9, fontWeight:700,
      background:`${color}22`, color, border:`1px solid ${color}44`,
      boxShadow:`0 2px 8px -4px ${color}55`,
    }}>
      {text}
    </span>
  )
}

/* ── SPACE ────────────────────────────────────────────────── */
export function Space({ h = 16 }: { h?: number }) {
  return <div style={{ height: h }} />
}
