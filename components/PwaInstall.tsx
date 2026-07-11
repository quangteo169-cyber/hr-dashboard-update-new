'use client'
// components/PwaInstall.tsx
// Đăng ký service worker + hiện banner "Cài đặt ứng dụng":
// - Android/Chrome: bắt sự kiện beforeinstallprompt → nút Cài đặt gọi prompt gốc của Chrome
// - iOS/Safari: không có API cài tự động → hiện hướng dẫn Chia sẻ → Thêm vào MH chính
import { useEffect, useState } from 'react'

const DISMISS_KEY = 'hq-pwa-install-dismissed'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function PwaInstall() {
  const [installEvt, setInstallEvt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showIosHint, setShowIosHint] = useState(false)

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }

    // Đã chạy trong app (standalone) hoặc người dùng đã tắt banner → không hiện lại
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true
    if (standalone || localStorage.getItem(DISMISS_KEY)) return

    const onPrompt = (e: Event) => {
      e.preventDefault()
      setInstallEvt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)

    const ua = navigator.userAgent
    const isIos = /iphone|ipad|ipod/i.test(ua) || (/macintosh/i.test(ua) && 'ontouchend' in document)
    if (isIos) setShowIosHint(true)

    return () => window.removeEventListener('beforeinstallprompt', onPrompt)
  }, [])

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1')
    setInstallEvt(null)
    setShowIosHint(false)
  }

  const install = async () => {
    if (!installEvt) return
    await installEvt.prompt()
    await installEvt.userChoice
    setInstallEvt(null)
  }

  if (!installEvt && !showIosHint) return null

  return (
    <div style={{
      position: 'fixed', left: 12, right: 12, bottom: 14, zIndex: 50,
      maxWidth: 480, margin: '0 auto',
      display: 'flex', alignItems: 'center', gap: 10,
      background: 'var(--bg3, #0F1728)',
      border: '1px solid var(--border2, #2D4066)',
      borderRadius: 14, padding: '12px 14px',
      boxShadow: '0 12px 32px -8px rgba(0,0,0,.6), 0 0 16px -6px rgba(0,200,255,.4)',
      color: 'var(--text, #E8F1FF)', fontSize: 12, lineHeight: 1.45,
    }}>
      <span style={{ fontSize: 22, flexShrink: 0 }}>📲</span>
      {installEvt ? (
        <>
          <span style={{ flex: 1 }}>Cài dashboard lên màn hình chính để mở nhanh như app</span>
          <button
            onClick={install}
            style={{
              flexShrink: 0, padding: '8px 16px', borderRadius: 9, border: 'none',
              background: 'linear-gradient(135deg,#0096FF,#7C4DFF)', color: '#fff',
              fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              boxShadow: '0 6px 20px -8px rgba(0,150,255,.9)',
            }}
          >
            Cài đặt
          </button>
        </>
      ) : (
        <span style={{ flex: 1 }}>
          Cài app: bấm nút <b>Chia sẻ</b> <span style={{ fontSize: 13 }}>⬆️</span> của Safari
          → <b>Thêm vào MH chính</b>
        </span>
      )}
      <button
        onClick={dismiss}
        aria-label="Đóng"
        style={{
          flexShrink: 0, width: 26, height: 26, borderRadius: 8,
          border: '1px solid var(--border, #1D2B47)', background: 'transparent',
          color: 'var(--text3, #5D7199)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
        }}
      >
        ✕
      </button>
    </div>
  )
}
