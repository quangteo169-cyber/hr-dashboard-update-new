# 📊 HR Dashboard — HQ Group 2026

Dashboard tuyển dụng real-time lấy dữ liệu trực tiếp từ Google Sheets.

## ⚡ Deploy lên Vercel (3 bước)

### Bước 1 — Chuẩn bị Google Sheet
Mở Google Sheet → **Share** → **Anyone with the link** → **Viewer**

> Sheet ID đã được hard-code: `12OEW_fXE5NnGXdYEcbxnvoIOcDDwENP5B0T6Xx8Byec`  
> GID sheet Raw Data: `1209894745`  
> Để thay đổi: sửa file `lib/sheets.ts` dòng đầu

### Bước 2 — Deploy lên Vercel
```bash
# Option A: dùng Vercel CLI
npm i -g vercel
vercel

# Option B: push lên GitHub rồi import tại vercel.com
git init && git add . && git commit -m "init"
# Tạo repo GitHub → push → vercel.com/new → import repo
```

### Bước 3 — Xong! 🎉
Dashboard tự động cập nhật mỗi **5 phút** (revalidate: 300s).

---

## 🗂️ Cấu trúc dự án

```
hr-dashboard/
├── app/
│   ├── api/data/route.ts    ← API endpoint
│   ├── page.tsx             ← Server component (fetch data)
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── Dashboard.tsx        ← Main layout + tabs
│   ├── Dashboard.module.css
│   ├── ui.tsx               ← Shared components
│   └── tabs/
│       ├── TabOverview.tsx  ← Tổng quan + KPIs
│       ├── TabLevel.tsx     ← 🏆 Bộ Level (key tab)
│       ├── TabFunnel.tsx    ← Phễu tuyển dụng
│       ├── TabMonthly.tsx   ← Theo tháng
│       ├── TabSource.tsx    ← Nguồn & kênh
│       ├── TabPosition.tsx  ← Vị trí
│       └── TabRaw.tsx       ← Raw data + search/filter
└── lib/
    └── sheets.ts            ← Fetch + parse Google Sheets CSV
```

## 📊 Bộ Level được tính như sau

| Level | Điều kiện |
|-------|-----------|
| L9    | `uvDiLam10Ngay === 'Có'` |
| L8.1  | `uvNhanViec === 'Có'` + Full-time |
| L8.2  | `uvNhanViec === 'Có'` + Part-time/TTS |
| L7    | `dongYDiLam === 'Có'` |
| L4A   | `ketQuaPV === 'Pass'` |
| L4B   | `ketQuaPV === 'Fail'` |
| L4    | `thamGiaPV === 'Có'` |
| L2A   | `ketQuaGoiMoi === 'Đồng ý'` |
| L2B   | `ketQuaGoiMoi === 'Từ chối'` |
| L1    | `hrLocCV === 'Pass'` |
| L0    | Mặc định |

## 🔧 Thay đổi Sheet khác

Sửa `lib/sheets.ts`:
```ts
const SHEET_ID = 'YOUR_SHEET_ID'
const GID      = 'YOUR_GID'
```

## 🏃 Chạy local

```bash
npm install
npm run dev
# → http://localhost:3000
```
