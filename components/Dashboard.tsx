'use client'
// components/Dashboard.tsx
import { useState, useEffect, useCallback } from 'react'
import type { DashboardData } from '@/lib/sheets'
import styles from './Dashboard.module.css'
import TabOverview  from './tabs/TabOverview'
import TabLevel     from './tabs/TabLevel'
import TabFunnel    from './tabs/TabFunnel'
import TabSource    from './tabs/TabSource'
import TabPosition  from './tabs/TabPosition'
import TabMonthly   from './tabs/TabMonthly'
import TabRaw       from './tabs/TabRaw'
import TabOrders    from './tabs/TabOrders'

const TABS = [
  { id:'overview', icon:'📊', label:'Tổng Quan'       },
  { id:'orders',   icon:'📋', label:'Đơn Hàng'        },
  { id:'level',    icon:'🏆', label:'Bộ Level'         },
  { id:'funnel',   icon:'🎯', label:'Phễu Tuyển Dụng' },
  { id:'monthly',  icon:'🗓️', label:'Theo Tháng'      },
  { id:'source',   icon:'📡', label:'Nguồn & Kênh'    },
  { id:'position', icon:'💼', label:'Vị Trí'           },
  { id:'raw',      icon:'📋', label:'Raw Data'         },
]

const REFRESH_SEC = 60

export default function Dashboard({ data: initialData }: { data: DashboardData }) {
  const [tab, setTab]         = useState('overview')
  const [dark, setDark]       = useState(true)
  const [data, setData]       = useState(initialData)
  const [countdown, setCountdown] = useState(REFRESH_SEC)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(initialData.updatedAt)

  // Fetch dữ liệu mới từ API
  const fetchData = useCallback(async () => {
    setRefreshing(true)
    try {
      const res = await fetch('/api/data', { cache: 'no-store' })
      if (res.ok) {
        const newData = await res.json()
        setData(newData)
        setLastUpdated(newData.updatedAt)
      }
    } catch (e) {
      console.error('Refresh failed:', e)
    } finally {
      setRefreshing(false)
      setCountdown(REFRESH_SEC)
    }
  }, [])

  // Auto-refresh mỗi 60 giây
  useEffect(() => {
    const interval = setInterval(fetchData, REFRESH_SEC * 1000)
    return () => clearInterval(interval)
  }, [fetchData])

  // Đếm ngược countdown
  useEffect(() => {
    const tick = setInterval(() => {
      setCountdown(c => c <= 1 ? REFRESH_SEC : c - 1)
    }, 1000)
    return () => clearInterval(tick)
  }, [])

  // Apply dark/light theme
  useEffect(() => {
    const root = document.documentElement
    if (dark) {
      root.style.setProperty('--bg',      '#0D1117')
      root.style.setProperty('--bg2',     '#161B22')
      root.style.setProperty('--bg3',     '#1C2128')
      root.style.setProperty('--bg4',     '#21262D')
      root.style.setProperty('--border',  '#30363D')
      root.style.setProperty('--border2', '#3D444D')
      root.style.setProperty('--text',    '#E6EDF3')
      root.style.setProperty('--text2',   '#8B949E')
      root.style.setProperty('--text3',   '#6E7681')
      document.body.style.background = '#0D1117'
    } else {
      root.style.setProperty('--bg',      '#F6F8FA')
      root.style.setProperty('--bg2',     '#FFFFFF')
      root.style.setProperty('--bg3',     '#F0F3F6')
      root.style.setProperty('--bg4',     '#E8EDF2')
      root.style.setProperty('--border',  '#D0D7DE')
      root.style.setProperty('--border2', '#B0BABE')
      root.style.setProperty('--text',    '#1A2332')
      root.style.setProperty('--text2',   '#57606A')
      root.style.setProperty('--text3',   '#6E7781')
      document.body.style.background = '#F6F8FA'
    }
  }, [dark])

  return (
    <div className={styles.shell}>
      {/* HEADER */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.logo}>👥</div>
          <div>
            <div className={styles.title}>DASHBOARD BÁO CÁO TUYỂN DỤNG</div>
            <div className={styles.subtitle}>HQ Group — Phòng Nhân Sự & Tuyển Dụng</div>
          </div>
        </div>
        <div className={styles.headerRight}>
          {/* Dark/Light toggle */}
          <button
            onClick={() => setDark(d => !d)}
            title={dark ? 'Chuyển sang Light Mode' : 'Chuyển sang Dark Mode'}
            style={{
              marginRight:12, padding:'5px 12px', borderRadius:20,
              border:'1px solid var(--border)', background:'var(--bg3)',
              color:'var(--text)', fontSize:11, cursor:'pointer',
              display:'flex', alignItems:'center', gap:6, fontFamily:'inherit',
            }}
          >
            {dark ? '☀️ Light' : '🌙 Dark'}
          </button>

          {/* Refresh + countdown */}
          <button
            onClick={fetchData}
            disabled={refreshing}
            title="Cập nhật ngay"
            style={{
              marginRight:12, padding:'5px 12px', borderRadius:20,
              border:'1px solid var(--border)', background:'var(--bg3)',
              color:refreshing ? 'var(--text3)' : '#2ECC8A',
              fontSize:11, cursor:refreshing?'default':'pointer',
              display:'flex', alignItems:'center', gap:6, fontFamily:'inherit',
            }}
          >
            {refreshing ? '⏳ Đang tải...' : `🔄 ${countdown}s`}
          </button>

          <div>
            <div className={styles.period}>2026</div>
            <div className={styles.updated}>
              <span className={styles.dot} />
              {lastUpdated}
            </div>
          </div>
        </div>
      </header>

      {/* TABS */}
      <nav className={styles.tabs}>
        {TABS.map(t => (
          <button
            key={t.id}
            className={`${styles.tab} ${tab === t.id ? styles.tabActive : ''}`}
            onClick={() => setTab(t.id)}
          >
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </nav>

      {/* CONTENT */}
      <main className={styles.content}>
        {tab === 'overview'  && <TabOverview  data={data} />}
        {tab === 'orders'    && <TabOrders    data={data} />}
        {tab === 'level'     && <TabLevel     data={data} />}
        {tab === 'funnel'    && <TabFunnel    data={data} />}
        {tab === 'monthly'   && <TabMonthly   data={data} />}
        {tab === 'source'    && <TabSource    data={data} />}
        {tab === 'position'  && <TabPosition  data={data} />}
        {tab === 'raw'       && <TabRaw       data={data} />}
      </main>
    </div>
  )
}
