// lib/sheets.ts
const SHEET_ID = '1YZltbbJSc1wDCMTxmwK3pmuOLAe190A8RT0YEim3Bys'
const GID_MAIN  = '1209894745'
const GID_ORDER = '1051409117' // Sheet "1.1 Đơn hàng"
const GID_PERSONNEL = '679242831' // Sheet "Tổng quan nhân sự"

function getCsvUrl(gid: string) {
  // &cb=<timestamp> làm mỗi request thành một URL khác nhau, ép cache CDN
  // của Google Sheets trả dữ liệu mới nhất thay vì bản cũ (tham số thừa
  // được endpoint export bỏ qua nên không ảnh hưởng nội dung)
  return `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${gid}&cb=${Date.now()}`
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  const lines = text.split('\n')
  for (const line of lines) {
    if (!line.trim()) continue
    const cols: string[] = []
    let cur = ''
    let inQuote = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"') {
        if (inQuote && line[i + 1] === '"') { cur += '"'; i++ }
        else inQuote = !inQuote
      } else if (ch === ',' && !inQuote) { cols.push(cur.trim()); cur = '' }
      else cur += ch
    }
    cols.push(cur.trim())
    rows.push(cols)
  }
  return rows
}

export interface Candidate {
  stt: number
  ngay: string
  thang: number
  thangNhanViec: number
  thangDiLam10: number
  tuan: number
  nvTD: string
  nguon: string
  hinhThuc: string
  capBac: string
  viTri: string
  tenUV: string
  team: string
  hrLocCV: string
  ketQuaGoiMoi: string
  ngayPV: string
  thamGiaPV: string
  ketQuaPV: string
  dongYDiLam: string
  ngayHenLamViec: string
  uvNhanViec: string
  uvDiLam10Ngay: string
  ngayDiLam10: string
  level: string
}

// ── Đơn hàng — mapping đúng cột sheet "1.1 Đơn hàng" ──────────────────────
export interface OrderRow {
  thang: string          // Cột A (0)
  thangNum: number       // Cột A parse thành số
  team: string           // Cột C (2)
  nguoiDeXuat: string    // Cột D (3)
  viTri: string          // Cột G (6)
  ngayNhanOrder: string  // Tự dò theo header chứa "ngày nhận order"
  lyDoTuyen: string      // Tự dò theo header chứa "lý do tuyển"
  trangThai: string      // Cột J (9):  "Đang tuyển" / "Hoàn thành" / "Tạm dừng"
  soLuong: number        // Cột K (10): Số lượng cần tuyển
  daOffer: number        // Cột L (11): Đã offer
  daNhanViec: number     // Cột M (12): Đã nhận việc
  conLai: number         // Cột N (13): Còn lại cần tuyển
}

export interface DashboardData {
  candidates: Candidate[]
  stats: Stats
  levelStats: LevelStat[]
  byMonth: MonthStat[]
  byWeek: WeekStat[]
  bySource: SourceStat[]
  byPosition: PositionStat[]
  byNV: NVStat[]
  orders: OrderRow[]
  personnel: PersonnelData
  updatedAt: string
}

// ── Tổng quan nhân sự ─────────────────────────────────────────────────────
export interface PersonnelItem { label: string; value: number }
export interface MonthFlow { month: number; hires: number; leaves: number }

export interface PersonnelData {
  total: number
  male: number
  female: number
  fullTime: number
  partTime: number
  reportMonth: number
  reportYear: number
  hiresThisMonth: number
  leavesThisMonth: number
  byAge: PersonnelItem[]
  byLevel: PersonnelItem[]      // Cấp bậc
  byDivision: PersonnelItem[]   // Khối chức năng
  byDepartment: PersonnelItem[] // Bộ phận
  flow: MonthFlow[]             // 12 tháng: nhận việc / nghỉ việc
}

export const EMPTY_PERSONNEL: PersonnelData = {
  total: 0, male: 0, female: 0, fullTime: 0, partTime: 0,
  reportMonth: 0, reportYear: 0, hiresThisMonth: 0, leavesThisMonth: 0,
  byAge: [], byLevel: [], byDivision: [], byDepartment: [], flow: [],
}

export interface Stats {
  total: number; hrPass: number; hrFail: number
  dongYPV: number; tuChoiPV: number; thamGiaPV: number
  passPV: number; failPV: number; dongYLam: number
  nhanViec: number; d10: number; dropout: number
}

export interface LevelStat {
  level: string; label: string; count: number
  pctTotal: number; pctPrev: number; color: string; bg: string
}

export interface MonthStat {
  month: string; label: string
  total: number; hrPass: number; dongYPV: number
  thamGiaPV: number; passPV: number; dongYLam: number
  nhanViec: number; d10: number
}

export interface WeekStat {
  week: string; label: string; total: number
  hrPass: number; thamGiaPV: number; nhanViec: number
}

export interface SourceStat {
  nguon: string; total: number; hrPass: number
  thamGiaPV: number; nhanViec: number; passRate: number
}

export interface PositionStat {
  viTri: string; total: number; hrPass: number; thamGiaPV: number; nhanViec: number
}

export interface NVStat {
  nvTD: string; total: number; hrPass: number; nhanViec: number
}

function getWeekNumber(dateStr: string): number {
  const parts = dateStr.split('/')
  if (parts.length < 3) return 0
  const d = new Date(+parts[2], +parts[1] - 1, +parts[0])
  const startOfYear = new Date(d.getFullYear(), 0, 1)
  return Math.ceil(((d.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7)
}

function getMonth(dateStr: string): number {
  if (!dateStr) return 0
  // dd/mm/yyyy
  const slash = dateStr.split('/')
  if (slash.length >= 2) { const m = +slash[1]; if (m >= 1 && m <= 12) return m }
  // "Tháng X" hoặc "T X"
  const match = dateStr.match(/\d+/)
  if (match) { const m = +match[0]; if (m >= 1 && m <= 12) return m }
  return 0
}

function calcLevel(c: Omit<Candidate, 'level'>): string {
  if (c.uvDiLam10Ngay  === 'Có')       return 'L9'
  if (c.uvNhanViec     === 'Có')       return 'L8'
  if (c.dongYDiLam     === 'Có')       return 'L7'
  if (c.ketQuaPV       === 'Pass')     return 'L4A'
  if (c.ketQuaPV       === 'Fail')     return 'L4B'
  if (c.thamGiaPV      === 'Có')       return 'L3A'
  if (c.ketQuaGoiMoi   === 'Đồng ý')  return 'L3'
  if (c.ketQuaGoiMoi   === 'Từ chối') return 'L3X'
  if (c.hrLocCV        === 'Pass')     return 'L1'
  return 'L0'
}

// Bỏ dấu tiếng Việt để khớp tên cột linh hoạt (không phụ thuộc dấu / hoa thường)
function normHeader(s: string): string {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .trim()
}

function parseOrders(rows: string[][]): OrderRow[] {
  // Tìm header row — ưu tiên dòng chứa "VỊ TRÍ" (header thật của bảng đơn hàng),
  // tránh khớp nhầm dòng tiêu đề "Đề xuất tuyển dụng tháng ..." (có chữ "tháng").
  let start = 0
  let headerIdx = -1
  for (let i = 0; i < Math.min(rows.length, 20); i++) {
    const h = normHeader(rows[i].join(' '))
    if (h.includes('vi tri')) { headerIdx = i; break }
  }
  // Fallback: nếu không thấy "vị trí", dùng cách dò rộng như cũ
  if (headerIdx === -1) {
    for (let i = 0; i < Math.min(rows.length, 20); i++) {
      const h = normHeader(rows[i].join(' '))
      if (h.includes('thang') || h.includes('team')) { headerIdx = i; break }
    }
  }
  start = headerIdx >= 0 ? headerIdx + 1 : 0

  // Tự dò cột "Ngày nhận order" và "Lý do tuyển" theo tên header.
  // Nếu sau này đổi vị trí cột trong sheet, chỉ cần header còn chứa từ khoá là vẫn nhận đúng.
  let colNgayNhan = -1
  let colLyDo = -1
  if (headerIdx >= 0) {
    const header = rows[headerIdx]
    header.forEach((cell, idx) => {
      const h = normHeader(cell)
      if (colNgayNhan === -1 &&
        (h.includes('ngay de xuat') || h.includes('ngay nhan') ||
         h.includes('nhan order') || h.includes('ngay order') ||
         h.includes('ngay tao'))) {
        colNgayNhan = idx
      }
      if (colLyDo === -1 && (h.includes('ly do') || h.includes('li do'))) {
        colLyDo = idx
      }
    })
  }

  const orders: OrderRow[] = []
  for (let i = start; i < rows.length; i++) {
    const r = rows[i]
    // Bỏ qua hàng rỗng
    if (!r[0] && !r[6]) continue
    // Bỏ qua hàng không có vị trí
    const viTri = r[6] || ''
    if (!viTri) continue

    const thangRaw = r[0] || ''
    const thangNum = getMonth(thangRaw)

    orders.push({
      thang:       thangRaw,
      thangNum,
      team:        r[2]  || '',   // Cột C
      nguoiDeXuat: r[3]  || '',   // Cột D
      viTri,                       // Cột G
      ngayNhanOrder: colNgayNhan >= 0 ? (r[colNgayNhan] || '') : '',
      lyDoTuyen:     colLyDo     >= 0 ? (r[colLyDo]     || '') : '',
      trangThai:   r[9]  || '',   // Cột J
      soLuong:     +r[10] || 0,   // Cột K
      daOffer:     +r[11] || 0,   // Cột L
      daNhanViec:  +r[12] || 0,   // Cột M
      conLai:      +r[13] || 0,   // Cột N
    })
  }
  return orders
}

// Parse sheet "Tổng quan nhân sự" — đọc bảng tóm tắt dạng STT|NỘI DUNG|THÔNG TIN|SỐ LƯỢNG|GHI CHÚ
function parsePersonnel(rows: string[][]): PersonnelData {
  const toInt = (s: string) => parseInt(String(s || '').replace(/[^\d-]/g, '')) || 0

  // Tìm cột "NỘI DUNG" (mỏ neo của bảng tóm tắt)
  let c = -1
  for (const r of rows) {
    const i = r.findIndex(x => normHeader(x) === 'noi dung')
    if (i >= 0) { c = i; break }
  }
  if (c < 0) return { ...EMPTY_PERSONNEL }

  // Tháng / năm báo cáo (ô "Tháng" ở phần đầu)
  let reportMonth = 0, reportYear = 0
  for (let i = 0; i < Math.min(rows.length, 4); i++) {
    const j = rows[i].findIndex(x => normHeader(x) === 'thang')
    if (j >= 0) { reportMonth = toInt(rows[i][j + 1]); reportYear = toInt(rows[i][j + 2]); break }
  }

  const d: PersonnelData = { ...EMPTY_PERSONNEL, reportMonth, reportYear,
    byAge: [], byLevel: [], byDivision: [], byDepartment: [], flow: [] }
  const hires: Record<number, number> = {}
  const leaves: Record<number, number> = {}

  for (const r of rows) {
    const cat = (r[c] || '').trim()
    const lab = (r[c + 1] || '').trim()
    const val = toInt(r[c + 2])
    const note = (r[c + 3] || '').trim()

    // Hai bảng theo tháng phân biệt bằng cột ghi chú
    if (note === 'Thêm mới')  { const m = toInt(r[c]); if (m >= 1 && m <= 12) hires[m]  = val; continue }
    if (note === 'Nghỉ việc') { const m = toInt(r[c]); if (m >= 1 && m <= 12) leaves[m] = val; continue }

    if (!cat || !lab) continue
    const nc = normHeader(cat)
    if (nc === 'nhan su' && normHeader(lab).includes('dang lam')) d.total = val
    else if (nc === 'gioi tinh') {
      if (normHeader(lab).includes('nam')) d.male = val
      else if (normHeader(lab).includes('nu')) d.female = val
    }
    else if (nc === 'do tuoi')  d.byAge.push({ label: lab, value: val })
    else if (nc === 'cap bac')  d.byLevel.push({ label: lab, value: val })
    else if (nc === 'khoi')     d.byDivision.push({ label: lab, value: val })
    else if (nc === 'bo phan')  d.byDepartment.push({ label: lab, value: val })
    else if (nc === 'thoi gian') {
      if (normHeader(lab).includes('full')) d.fullTime = val
      else if (normHeader(lab).includes('part')) d.partTime = val
    }
  }

  for (let m = 1; m <= 12; m++) d.flow.push({ month: m, hires: hires[m] || 0, leaves: leaves[m] || 0 })
  d.hiresThisMonth  = hires[reportMonth] || 0
  d.leavesThisMonth = leaves[reportMonth] || 0

  // --- Ưu tiên dãy thẻ KPI ở đầu sheet (nguồn số liệu chuẩn) ---
  // Layout: hàng giá trị (126 | 55 71 | 69 | 56 | 2 | 2) nằm ngay TRÊN hàng nhãn
  // ("Tổng nhân sự", "Full time", "Part time", "Nhận việc", "Đã nghỉ").
  // Bảng tóm tắt bên dưới chỉ còn là nguồn dự phòng nếu không tìm thấy thẻ.
  const isNum = (s: string | undefined) => {
    const t = (s || '').trim()
    return t !== '' && !t.includes('%') && /^[\d.,\s]+$/.test(t) && /\d/.test(t)
  }
  const findCard = (name: string): { value: number; row: number; col: number } | null => {
    for (let ri = 1; ri < Math.min(rows.length, 12); ri++) {
      const row = rows[ri] || []
      for (let ci = 0; ci < row.length; ci++) {
        if (!normHeader(row[ci]).includes(name)) continue
        // Giá trị nằm phía trên nhãn (lệch tối đa 2 hàng, ±2 cột do merge cell).
        // Quét đúng cột nhãn trước rồi mới lan dần ra hai bên để không
        // vớ nhầm số của thẻ KPI đứng cạnh.
        for (const off of [0, 1, -1, 2, -2]) {
          const cc = ci + off
          if (cc < 0) continue
          for (let up = 1; up <= 2; up++) {
            const vr = rows[ri - up]
            if (vr && isNum(vr[cc])) return { value: toInt(vr[cc]), row: ri - up, col: cc }
          }
        }
      }
    }
    return null
  }
  const cardTotal = findCard('tong nhan su')
  const cardFT    = findCard('full time')
  const cardPT    = findCard('part time')
  const cardHire  = findCard('nhan viec')
  const cardLeave = findCard('da nghi')
  if (cardTotal) d.total           = cardTotal.value
  if (cardFT)    d.fullTime        = cardFT.value
  if (cardPT)    d.partTime        = cardPT.value
  if (cardHire)  d.hiresThisMonth  = cardHire.value
  if (cardLeave) d.leavesThisMonth = cardLeave.value
  // Giới tính: hai số (nam, nữ) nằm giữa cột Tổng nhân sự và Full time trên hàng giá trị
  if (cardTotal && cardFT && cardFT.col > cardTotal.col) {
    const vr = rows[cardTotal.row] || []
    const nums: number[] = []
    for (let cc = cardTotal.col + 1; cc < cardFT.col; cc++) {
      if (isNum(vr[cc])) nums.push(toInt(vr[cc]))
    }
    if (nums.length >= 2) { d.male = nums[0]; d.female = nums[nums.length - 1] }
  }

  return d
}

export async function fetchDashboardData(): Promise<DashboardData> {
  const noCache = {
    cache: 'no-store' as const,
    headers: { 'Cache-Control': 'no-cache, no-store, max-age=0', 'Pragma': 'no-cache' },
  }
  const [resMain, resOrder, resPersonnel] = await Promise.allSettled([
    fetch(getCsvUrl(GID_MAIN),  noCache),
    fetch(getCsvUrl(GID_ORDER), noCache),
    fetch(getCsvUrl(GID_PERSONNEL), noCache),
  ])

  if (resMain.status === 'rejected' || !resMain.value.ok)
    throw new Error('Không thể tải dữ liệu chính')

  const textMain = await resMain.value.text()
  const rows = parseCsv(textMain)

  let orders: OrderRow[] = []
  if (resOrder.status === 'fulfilled' && resOrder.value.ok) {
    const textOrder = await resOrder.value.text()
    orders = parseOrders(parseCsv(textOrder))
  }

  let personnel: PersonnelData = { ...EMPTY_PERSONNEL }
  if (resPersonnel.status === 'fulfilled' && resPersonnel.value.ok) {
    const textPersonnel = await resPersonnel.value.text()
    personnel = parsePersonnel(parseCsv(textPersonnel))
  }

  let dataStart = 0
  for (let i = 0; i < rows.length; i++) {
    if (rows[i][0] === 'STT' || rows[i][0] === '1') { dataStart = i + 1; break }
  }
  if (dataStart === 0) dataStart = 5

  const candidates: Candidate[] = []

  for (let i = dataStart; i < rows.length; i++) {
    const r = rows[i]
    if (!r[0] || isNaN(+r[0])) continue

    const ngayHenLamViec = r[24] || ''
    const ngayDiLam10   = r[27] || ''

    const base: Omit<Candidate, 'level'> = {
      stt:           +r[0],
      ngay:           r[1]  || '',
      thang:          getMonth(r[1] || ''),
      thangNhanViec:  getMonth(ngayHenLamViec),
      thangDiLam10:   getMonth(ngayDiLam10),
      tuan:           getWeekNumber(r[1] || ''),
      nvTD:           r[2]  || '',
      nguon:          r[3]  || 'Khác',
      hinhThuc:       r[4]  || '',
      capBac:         r[6]  || '',
      viTri:          r[7]  || '',
      tenUV:          r[8]  || '',
      team:           r[14] || r[13] || '',
      hrLocCV:        r[15] || '',
      ketQuaGoiMoi:   r[16] || '',
      ngayPV:         r[19] || '',
      thamGiaPV:      r[20] || '',
      ketQuaPV:       r[21] || '',
      dongYDiLam:     r[23] || '',
      ngayHenLamViec,
      uvNhanViec:     r[25] || '',
      uvDiLam10Ngay:  r[26] || '',
      ngayDiLam10,
    }
    candidates.push({ ...base, level: calcLevel(base) })
  }

  const total     = candidates.length
  const hrPass    = candidates.filter(c => c.hrLocCV        === 'Pass').length
  const hrFail    = candidates.filter(c => c.hrLocCV        === 'Fail').length
  const dongYPV   = candidates.filter(c => c.ketQuaGoiMoi   === 'Đồng ý').length
  const tuChoiPV  = candidates.filter(c => c.ketQuaGoiMoi   === 'Từ chối').length
  const thamGiaPV = candidates.filter(c => c.thamGiaPV      === 'Có').length
  const passPV    = candidates.filter(c => c.ketQuaPV       === 'Pass').length
  const failPV    = candidates.filter(c => c.ketQuaPV       === 'Fail').length
  const dongYLam  = candidates.filter(c => c.dongYDiLam     === 'Có').length
  const nhanViec  = candidates.filter(c => c.uvNhanViec     === 'Có').length
  const d10       = candidates.filter(c => c.uvDiLam10Ngay  === 'Có').length
  const dropout   = candidates.filter(c => c.uvNhanViec === 'Có' && c.uvDiLam10Ngay !== 'Có').length

  const pct = (n: number, d: number) => d > 0 ? Math.round(n / d * 10) / 10 : 0

  const levelDefs = [
    { level:'L0',  label:'CV thu thập được (cột B)',              color:'#6B7280', bg:'rgba(107,114,128,0.15)' },
    { level:'L1',  label:'CV Pass lọc HR (cột P = Pass)',         color:'#33A6FF', bg:'rgba(51,166,255,0.15)'  },
    { level:'L3',  label:'UV có lịch hẹn PV (cột Q = Đồng ý)',   color:'#FFAA2B', bg:'rgba(255,170,43,0.15)'  },
    { level:'L3A', label:'UV tới phỏng vấn (cột U = Có)',         color:'#B44CFF', bg:'rgba(180,76,255,0.15)' },
    { level:'L4A', label:'UV Pass PV V1 (cột V = Pass)',          color:'#00E5D0', bg:'rgba(0,229,208,0.15)'  },
    { level:'L7',  label:'UV có lịch hẹn đi làm (cột X = Có)',   color:'#FFAA2B', bg:'rgba(255,170,43,0.13)'  },
    { level:'L8',  label:'UV đi làm ngày đầu (cột Z = Có)',       color:'#00E08F', bg:'rgba(0,224,143,0.15)'  },
    { level:'L9',  label:'UV đi làm đủ 10 ngày (cột AA = Có) ✨', color:'#FFD84D', bg:'rgba(255,216,77,0.15)'  },
  ]
  const prevStage = [total, total, hrPass, dongYPV, thamGiaPV, passPV, dongYLam, nhanViec]
  const levelStats: LevelStat[] = levelDefs.map((def, i) => {
    const count = def.level === 'L0' ? total : candidates.filter(c => c.level === def.level).length
    return { ...def, count, pctTotal: pct(count, total), pctPrev: pct(count, prevStage[i]) }
  })

  const byMonth: MonthStat[] = [1,2,3,4,5,6,7,8,9,10,11,12].map(m => {
    const mc  = candidates.filter(c => c.thang === m)
    const mc8 = candidates.filter(c => c.thangNhanViec === m && c.uvNhanViec === 'Có')
    const mc9 = candidates.filter(c => c.thangDiLam10  === m && c.uvDiLam10Ngay === 'Có')
    return {
      month: String(m), label: `T${m}`,
      total:     mc.length,
      hrPass:    mc.filter(c => c.hrLocCV === 'Pass').length,
      dongYPV:   mc.filter(c => c.ketQuaGoiMoi === 'Đồng ý').length,
      thamGiaPV: mc.filter(c => c.thamGiaPV === 'Có').length,
      passPV:    mc.filter(c => c.ketQuaPV === 'Pass').length,
      dongYLam:  mc.filter(c => c.dongYDiLam === 'Có').length,
      nhanViec:  mc8.length,
      d10:       mc9.length,
    }
  })

  const weeks = [...new Set(candidates.filter(c => c.tuan > 0).map(c => c.tuan))].sort((a,b) => a-b)
  const byWeek: WeekStat[] = weeks.map(w => {
    const wc = candidates.filter(c => c.tuan === w)
    return {
      week: String(w), label: `T${w}`,
      total: wc.length,
      hrPass: wc.filter(c => c.hrLocCV === 'Pass').length,
      thamGiaPV: wc.filter(c => c.thamGiaPV === 'Có').length,
      nhanViec: wc.filter(c => c.uvNhanViec === 'Có').length,
    }
  })

  const nguonMap = new Map<string, SourceStat>()
  for (const c of candidates) {
    const key = c.nguon || 'Khác'
    if (!nguonMap.has(key)) nguonMap.set(key, { nguon:key, total:0, hrPass:0, thamGiaPV:0, nhanViec:0, passRate:0 })
    const s = nguonMap.get(key)!
    s.total++
    if (c.hrLocCV === 'Pass') s.hrPass++
    if (c.thamGiaPV === 'Có') s.thamGiaPV++
    if (c.uvNhanViec === 'Có') s.nhanViec++
  }
  const bySource = [...nguonMap.values()].map(s => ({ ...s, passRate: pct(s.hrPass, s.total) })).sort((a,b) => b.total-a.total)

  const posMap = new Map<string, PositionStat>()
  for (const c of candidates) {
    const key = c.viTri || 'Chưa xác định'
    if (!posMap.has(key)) posMap.set(key, { viTri:key, total:0, hrPass:0, thamGiaPV:0, nhanViec:0 })
    const p2 = posMap.get(key)!
    p2.total++
    if (c.hrLocCV === 'Pass') p2.hrPass++
    if (c.thamGiaPV === 'Có') p2.thamGiaPV++
    if (c.uvNhanViec === 'Có') p2.nhanViec++
  }
  const byPosition = [...posMap.values()].sort((a,b) => b.total-a.total)

  const nvMap = new Map<string, NVStat>()
  for (const c of candidates) {
    const key = c.nvTD || 'Khác'
    if (!nvMap.has(key)) nvMap.set(key, { nvTD:key, total:0, hrPass:0, nhanViec:0 })
    const n = nvMap.get(key)!
    n.total++
    if (c.hrLocCV === 'Pass') n.hrPass++
    if (c.uvNhanViec === 'Có') n.nhanViec++
  }

  return {
    candidates,
    stats: { total, hrPass, hrFail, dongYPV, tuChoiPV, thamGiaPV, passPV, failPV, dongYLam, nhanViec, d10, dropout },
    levelStats, byMonth, byWeek, bySource, byPosition,
    byNV: [...nvMap.values()].sort((a,b) => b.total-a.total),
    orders,
    personnel,
    updatedAt: new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
  }
}
