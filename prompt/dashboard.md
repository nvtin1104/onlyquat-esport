# 🎮 ARCADE ARENA — Prompt Xây Dựng Admin Dashboard

## React + Tailwind CSS + shadcn/ui + Lucide Icons

> **Hướng dẫn sử dụng:** File này chứa nhiều prompt riêng biệt. Copy từng **PROMPT BLOCK** (đánh số P1, P2, P3...) và paste vào AI để generate code cho từng phần. Mỗi prompt đã bao gồm đủ context (design tokens, types, mock data) để AI output code hoàn chỉnh.

---

## MỤC LỤC PROMPT

| # | Prompt | Mô tả | Độ ưu tiên |
|---|--------|-------|------------|
| P0 | Project Setup | Khởi tạo project + cài đặt + theme | 🔴 Bắt buộc |
| P1 | Sidebar Layout | Sidebar nav + header + layout wrapper | 🔴 Bắt buộc |
| P2 | Overview Dashboard | Trang chính: KPI cards + charts + recent activity | 🔴 Bắt buộc |
| P3 | Players Management | CRUD table tuyển thủ + filter + search | 🔴 Bắt buộc |
| P4 | Player Detail/Edit | Form tạo/sửa player + ảnh upload | 🟡 Quan trọng |
| P5 | Teams Management | CRUD table đội tuyển + roster | 🟡 Quan trọng |
| P6 | Matches Management | CRUD trận đấu + cập nhật kết quả | 🟡 Quan trọng |
| P7 | Ratings Moderation | Duyệt/từ chối đánh giá từ cộng đồng | 🟡 Quan trọng |
| P8 | Points & Rewards | Quản lý điểm thưởng + tặng bonus | 🟢 Mở rộng |
| P9 | Users Management | Quản lý user + phân quyền | 🟢 Mở rộng |
| P10 | Settings | Cấu hình game, roles, tier thresholds | 🟢 Mở rộng |

---

---

## PROMPT P0 — PROJECT SETUP

### Copy toàn bộ block dưới đây:

```
Tôi cần khởi tạo một Admin Dashboard cho nền tảng E-sports "Arcade Arena" với stack sau:

TECH STACK:
- React 18+ (Vite hoặc Next.js App Router)
- TypeScript strict mode
- Tailwind CSS 4
- shadcn/ui (tất cả components cần: Button, Card, Table, Dialog, Input, Select, Badge, Tabs, DropdownMenu, Sheet, Tooltip, Avatar, Skeleton, Separator, Switch, Textarea, Command, Popover, Calendar, Toast)
- Lucide React (icons)
- Recharts (charts)
- React Hook Form + Zod (form validation)
- TanStack Table v8 (data tables)
- date-fns (date formatting)

DESIGN SYSTEM — "High-Contrast Stealth":
Theme tối lấy cảm hứng từ gaming hardware (Razer, ROG). CSS Variables:

:root {
  --bg-base: #121212;
  --bg-elevated: #1A1A1B;
  --bg-surface: #000000;
  --bg-card: #0A0A0A;
  --border-subtle: #2A2A2B;
  --border-hover: #3A3A3B;
  --accent-acid: #CCFF00;
  --accent-lava: #FF4D00;
  --text-primary: #E8E8E8;
  --text-secondary: #888888;
  --text-dim: #555555;
  --tier-s: #CCFF00;
  --tier-a: #00FF88;
  --tier-b: #00AAFF;
  --tier-c: #FFB800;
  --tier-d: #FF4D00;
  --tier-f: #FF4444;
  --success: #00FF88;
  --warning: #FFB800;
  --danger: #FF4444;
  --info: #00AAFF;
}

FONTS (Google Fonts):
- Chakra Petch (700) — headings, page titles
- Be Vietnam Pro (400, 500, 600) — body text (Vietnamese native)
- JetBrains Mono (400, 500, 700) — data, numbers, labels, tables

SHADCN THEME OVERRIDE:
- Tất cả shadcn components phải dùng dark theme
- Card: bg #0A0A0A, border #2A2A2B, hover border #3A3A3B
- Button primary: bg #CCFF00, text #000000, hover glow
- Button destructive: bg #FF4444
- Button ghost: hover bg #1A1A1B
- Table: header bg #0A0A0A, row hover bg #1A1A1B, border #2A2A2B
- Input/Select: bg #0A0A0A, border #2A2A2B, focus ring #CCFF00
- Badge: variants cho tier S/A/B/C/D/F với màu tương ứng
- Dialog: bg #121212, border #2A2A2B, overlay rgba(0,0,0,0.8)

OUTPUT:
1. Danh sách packages cần cài
2. Tailwind config hoàn chỉnh (colors, fonts, extended theme)
3. globals.css với CSS variables + shadcn overrides
4. shadcn theme configuration
5. Folder structure cho dashboard project
```

---

---

## PROMPT P1 — SIDEBAR LAYOUT

### Copy toàn bộ block dưới đây:

```
Xây dựng Dashboard Layout với Sidebar cho Admin Panel "Arcade Arena" (E-sports platform).

TECH: React + TypeScript + Tailwind CSS + shadcn/ui + Lucide Icons

DESIGN TOKENS (đã setup):
- bg-base: #121212, bg-elevated: #1A1A1B, bg-surface: #000000
- border-subtle: #2A2A2B, accent-acid: #CCFF00, accent-lava: #FF4D00
- text-primary: #E8E8E8, text-secondary: #888888, text-dim: #555555
- Font heading: Chakra Petch 700, Font body: Be Vietnam Pro, Font data: JetBrains Mono

LAYOUT STRUCTURE:

┌──────────────────────────────────────────────────────────────────┐
│ ┌────────────┐ ┌──────────────────────────────────────────────┐  │
│ │            │ │ HEADER (h-16, bg-surface, border-bottom)     │  │
│ │            │ │ ┌────────────────────┐    ┌─────┐┌────────┐ │  │
│ │            │ │ │🔍 Tìm kiếm...     │    │🔔   ││[Avatar]│ │  │
│ │            │ │ └────────────────────┘    └─────┘│Admin ▾ │ │  │
│ │  SIDEBAR   │ │                                  └────────┘ │  │
│ │  (w-64)    │ ├──────────────────────────────────────────────┤  │
│ │            │ │                                              │  │
│ │ ■ Logo     │ │  MAIN CONTENT                               │  │
│ │            │ │  (padding 24px, overflow-y-auto)             │  │
│ │ ────────── │ │                                              │  │
│ │            │ │  Đây là vùng render page content             │  │
│ │ 📊 Tổng quan│ │  (children / Outlet)                        │  │
│ │ 👤 Tuyển thủ│ │                                              │  │
│ │ 🏆 Đội tuyển│ │                                              │  │
│ │ ⚔️ Trận đấu│ │                                              │  │
│ │ ⭐ Đánh giá │ │                                              │  │
│ │ 🎮 Minigame│ │                                              │  │
│ │ 💰 Điểm    │ │                                              │  │
│ │ 👥 Users   │ │                                              │  │
│ │            │ │                                              │  │
│ │ ────────── │ │                                              │  │
│ │ ⚙️ Cài đặt │ │                                              │  │
│ │            │ │                                              │  │
│ └────────────┘ └──────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘

SIDEBAR SPECS:
- Width: 64px (collapsed) ↔ 256px (expanded), animated transition
- Background: bg-surface (#000000)
- Border right: 1px border-subtle
- Logo: "ARCADE ARENA" text hoặc icon, font Chakra Petch
- Nav items dùng Lucide icons:
  - LayoutDashboard → "Tổng quan" (/)
  - Users → "Tuyển thủ" (/players)
  - Shield → "Đội tuyển" (/teams)
  - Swords → "Trận đấu" (/matches)
  - Star → "Đánh giá" (/ratings)
  - Gamepad2 → "Minigame" (/minigame)
  - Coins → "Điểm thưởng" (/points)
  - UserCog → "Người dùng" (/users)
  - Settings → "Cài đặt" (/settings)
- Active item: bg #1A1A1B, border-left 3px accent-acid, text white
- Hover item: bg #1A1A1B
- Collapsed: chỉ hiện icon, tooltip hiện tên
- Badge count trên "Đánh giá" (số pending ratings)

HEADER SPECS:
- Height: 64px, bg-surface, border-bottom border-subtle
- Search bar: shadcn Command component hoặc Input với icon Search
- Notification bell (Lucide Bell) + badge count
- User dropdown (shadcn DropdownMenu): Avatar + tên + role + logout

MOBILE (< 1024px):
- Sidebar thành Sheet (slide from left), trigger bằng hamburger button
- Header luôn hiện

COMPONENTS CẦN TẠO:
1. DashboardLayout.tsx — Wrapper layout
2. Sidebar.tsx — Nav sidebar (collapsible)
3. SidebarItem.tsx — Single nav item
4. DashboardHeader.tsx — Top header bar
5. UserMenu.tsx — Avatar + dropdown menu

Dùng shadcn/ui components: Button, Sheet, Tooltip, DropdownMenu, Avatar, Badge, Separator
Tất cả text tiếng Việt.
Xuất code TypeScript hoàn chỉnh cho từng component.
```

---

---

## PROMPT P2 — OVERVIEW DASHBOARD (Trang Tổng Quan)

### Copy toàn bộ block dưới đây:

```
Xây dựng trang Overview Dashboard cho Admin Panel "Arcade Arena" (E-sports rating platform).

TECH: React + TypeScript + Tailwind CSS + shadcn/ui + Lucide Icons + Recharts

DESIGN TOKENS:
- bg-base: #121212, bg-card: #0A0A0A, border-subtle: #2A2A2B
- accent-acid: #CCFF00, accent-lava: #FF4D00
- success: #00FF88, warning: #FFB800, danger: #FF4444, info: #00AAFF
- Font heading: Chakra Petch 700
- Font body: Be Vietnam Pro
- Font data/numbers: JetBrains Mono 700

PAGE LAYOUT:

┌──────────────────────────────────────────────────────────────┐
│ PAGE HEADER                                                  │
│ "Tổng quan" (Chakra Petch 700, 28px)                        │
│ "Chào mừng trở lại, Admin" (Be Vietnam Pro, text-secondary) │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ KPI CARDS (4-column grid, gap-4)                             │
│ ┌──────────────┐┌──────────────┐┌──────────────┐┌──────────────┐
│ │ 👤 2,547     ││ ⭐ 185,420   ││ 💰 1.2M      ││ ⚔️ 48       │
│ │ Tuyển thủ    ││ Đánh giá     ││ Điểm đã phát ││ Trận đấu     │
│ │ +12% ↑       ││ +8.5% ↑      ││ +23% ↑       ││ 5 đang diễn  │
│ │ vs tháng trước││ vs tháng trước││ vs tháng trước││ ra           │
│ └──────────────┘└──────────────┘└──────────────┘└──────────────┘
│                                                              │
│ CHARTS ROW (2-column grid)                                   │
│ ┌────────────────────────────┐ ┌────────────────────────────┐│
│ │ RATING TREND (Line Chart)  │ │ TIER DISTRIBUTION (Donut)  ││
│ │                            │ │                            ││
│ │ Trục X: 6 tháng gần nhất  │ │ S: 12%  ● acid green      ││
│ │ Trục Y: Số rating/tháng   │ │ A: 25%  ● #00FF88         ││
│ │ Line color: accent-acid    │ │ B: 30%  ● #00AAFF         ││
│ │ Grid lines: border-subtle  │ │ C: 20%  ● #FFB800         ││
│ │ Tooltip: dark bg           │ │ D: 10%  ● #FF4D00         ││
│ │                            │ │ F: 3%   ● #FF4444         ││
│ │ Area fill: acid opacity 0.1│ │                            ││
│ └────────────────────────────┘ └────────────────────────────┘│
│                                                              │
│ BOTTOM ROW (2-column: 60/40)                                 │
│ ┌──────────────────────────────┐ ┌──────────────────────────┐│
│ │ RECENT RATINGS               │ │ TOP PLAYERS              ││
│ │ (Table, shadcn Table)        │ │ (List, 5 items)          ││
│ │                              │ │                          ││
│ │ User   Player  Score  Time   │ │ 1. DragonSlayer99  9.8 S ││
│ │ ─────────────────────────── │ │ 2. ThunderAce      9.5 S ││
│ │ NamA   Dragon  9.5   2m ago │ │ 3. KitsunePro      9.3 S ││
│ │ HuyB   Thunder 8.0   5m ago │ │ 4. SakuraWind      9.1 S ││
│ │ LinhC  Kitsune 9.8   8m ago │ │ 5. ShadowViper     8.7 A ││
│ │ ...                          │ │                          ││
│ │ [Xem tất cả đánh giá →]     │ │ [Xem bảng xếp hạng →]   ││
│ └──────────────────────────────┘ └──────────────────────────┘│
│                                                              │
│ QUICK ACTIONS ROW                                            │
│ ┌────────────┐┌────────────┐┌────────────┐┌────────────┐    │
│ │ + Thêm     ││ + Tạo trận ││ 📋 Duyệt   ││ 🎁 Tặng    │    │
│ │ tuyển thủ  ││ đấu mới    ││ đánh giá   ││ điểm       │    │
│ └────────────┘└────────────┘└────────────┘└────────────┘    │
│                                                              │
└──────────────────────────────────────────────────────────────┘

KPI CARD SPEC:
- shadcn Card component
- Background: bg-card (#0A0A0A)
- Border: border-subtle, hover → border-hover
- Icon (Lucide) trong circle bg #1A1A1B, size 20px
- Main number: JetBrains Mono 700, 32px, text-primary
- Label: Be Vietnam Pro 500, 14px, text-secondary
- Change indicator: success green nếu tăng, danger red nếu giảm
- Sub text: text-dim, 12px

CHART SPECS (Recharts):
- Background chart area: transparent
- Grid lines: stroke #2A2A2B
- Axis labels: JetBrains Mono 500, 11px, fill #555555
- Tooltip: bg #0A0A0A, border #2A2A2B, text #E8E8E8
- Line chart: stroke #CCFF00, strokeWidth 2, dot radius 4
- Area chart: fill #CCFF00 opacity 0.08
- Donut chart: innerRadius 60%, colors theo tier colors

MOCK DATA:

const kpiData = {
  totalPlayers: { value: 2547, change: 12.5, label: "Tuyển thủ" },
  totalRatings: { value: 185420, change: 8.5, label: "Đánh giá" },
  totalPoints:  { value: 1200000, change: 23.1, label: "Điểm đã phát" },
  totalMatches: { value: 48, liveCount: 5, label: "Trận đấu" },
};

const ratingTrend = [
  { month: "T8", count: 22400 },
  { month: "T9", count: 25100 },
  { month: "T10", count: 28300 },
  { month: "T11", count: 31200 },
  { month: "T12", count: 29800 },
  { month: "T1", count: 34500 },
];

const tierDistribution = [
  { tier: "S", count: 305, color: "#CCFF00" },
  { tier: "A", count: 637, color: "#00FF88" },
  { tier: "B", count: 764, color: "#00AAFF" },
  { tier: "C", count: 509, color: "#FFB800" },
  { tier: "D", count: 254, color: "#FF4D00" },
  { tier: "F", count: 78, color: "#FF4444" },
];

const recentRatings = [
  { id: "1", userName: "NamAnh", playerName: "DragonSlayer99", score: 9.5, timeAgo: "2 phút trước", status: "pending" },
  { id: "2", userName: "HuyPro", playerName: "ThunderAce", score: 8.0, timeAgo: "5 phút trước", status: "approved" },
  { id: "3", userName: "LinhChi", playerName: "KitsunePro", score: 9.8, timeAgo: "8 phút trước", status: "pending" },
  { id: "4", userName: "DucMinh", playerName: "SakuraWind", score: 7.5, timeAgo: "12 phút trước", status: "approved" },
  { id: "5", userName: "ThuHa", playerName: "ShadowViper", score: 8.9, timeAgo: "15 phút trước", status: "rejected" },
];

const topPlayers = [
  { rank: 1, name: "DragonSlayer99", rating: 9.8, tier: "S", game: "LoL" },
  { rank: 2, name: "ThunderAce", rating: 9.5, tier: "S", game: "Valorant" },
  { rank: 3, name: "KitsunePro", rating: 9.3, tier: "S", game: "Dota 2" },
  { rank: 4, name: "SakuraWind", rating: 9.1, tier: "S", game: "CS2" },
  { rank: 5, name: "ShadowViper", rating: 8.7, tier: "A", game: "Valorant" },
];

COMPONENTS CẦN TẠO:
1. OverviewPage.tsx — Page chính
2. KPICard.tsx — Card thống kê (reusable)
3. RatingTrendChart.tsx — Line/Area chart
4. TierDistributionChart.tsx — Donut/Pie chart
5. RecentRatingsTable.tsx — Table mini
6. TopPlayersList.tsx — List xếp hạng
7. QuickActions.tsx — Nút tắt nhanh

shadcn components dùng: Card, CardHeader, CardTitle, CardContent, Table, TableHeader, TableRow, TableCell, Badge, Button
Tất cả text tiếng Việt. Rating status badge: pending=vàng, approved=xanh, rejected=đỏ.
Xuất code TypeScript hoàn chỉnh cho từng component.
```

---

---

## PROMPT P3 — PLAYERS MANAGEMENT (Quản Lý Tuyển Thủ)

### Copy toàn bộ block dưới đây:

```
Xây dựng trang Quản Lý Tuyển Thủ cho Admin Dashboard "Arcade Arena" (E-sports platform).

TECH: React + TypeScript + Tailwind CSS + shadcn/ui + Lucide Icons + TanStack Table v8

DESIGN TOKENS: (như P2)
- Dark theme, bg-base #121212, bg-card #0A0A0A, border-subtle #2A2A2B
- accent-acid #CCFF00, text-primary #E8E8E8
- Font data: JetBrains Mono, Font body: Be Vietnam Pro, Font heading: Chakra Petch

PAGE LAYOUT:

┌──────────────────────────────────────────────────────────────────┐
│ PAGE HEADER                                                      │
│ "Tuyển thủ" (Chakra Petch 700, 28px)     [+ Thêm tuyển thủ]    │
│ "Quản lý 2,547 tuyển thủ" (text-secondary)                      │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│ FILTER BAR                                                       │
│ ┌─────────────────────┐ ┌──────────┐ ┌────────┐ ┌────────┐     │
│ │ 🔍 Tìm tuyển thủ...│ │ Game ▾   │ │ Role ▾ │ │ Tier ▾ │     │
│ └─────────────────────┘ └──────────┘ └────────┘ └────────┘     │
│                                      ┌──────────────┐           │
│ Tab: [Tất cả] [Active] [Inactive]   │ Sắp xếp: ▾   │           │
│                                      └──────────────┘           │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│ DATA TABLE (TanStack Table + shadcn Table)                       │
│ ┌────────────────────────────────────────────────────────────┐   │
│ │ □  #    Player          Game    Role     Rating  Tier  ⋯  │   │
│ │ ─────────────────────────────────────────────────────────  │   │
│ │ □  1    [🐉] DragonS..  LoL     Mid      9.8     [S]   ⋯  │   │
│ │ □  2    [⚡] ThunderA..  VAL     Duelist  9.5     [S]   ⋯  │   │
│ │ □  3    [🦊] KitsuneP.. Dota2   Carry    9.3     [S]   ⋯  │   │
│ │ □  4    [🌸] SakuraW..  CS2     AWPer    9.1     [S]   ⋯  │   │
│ │ □  5    [🐍] ShadowV..  VAL     Control  8.7     [A]   ⋯  │   │
│ │ □  6    [🔥] BlazeQ..   LoL     ADC      8.4     [A]   ⋯  │   │
│ │ □  7    [🐺] IronWolf   Dota2   Offlane  7.9     [B]   ⋯  │   │
│ │ □  8    [💜] NeonRush   CS2     Entry    7.5     [B]   ⋯  │   │
│ │                                                            │   │
│ │ ← Page info: "Hiển thị 1–20 / 2,547"  [◀ 1 2 3 ... 128 ▶]│   │
│ └────────────────────────────────────────────────────────────┘   │
│                                                                  │
│ BULK ACTIONS (hiện khi có checkbox selected)                     │
│ ┌──────────────────────────────────────────────┐                 │
│ │ Đã chọn 3 tuyển thủ   [Xoá] [Đổi trạng thái]│                 │
│ └──────────────────────────────────────────────┘                 │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

TABLE COLUMNS:
1. Checkbox (select row)
2. # (rank number, JetBrains Mono)
3. Player: Avatar (40px circle) + DisplayName + RealName nhỏ bên dưới
4. Game: shortName badge (LoL, VAL, CS2, Dota2)
5. Role: text-secondary
6. Team: Team tag badge hoặc "—" nếu free agent
7. Rating: JetBrains Mono 700, color theo tier
8. Tier: Badge component (S=acid, A=green, B=blue, C=yellow, D=orange, F=red)
9. Total Ratings: JetBrains Mono, text-secondary
10. Status: Badge (Active=green, Inactive=dim)
11. Actions: DropdownMenu (⋯) → Xem, Sửa, Xoá

TABLE FEATURES:
- Sorting: click header để sort (Rating default desc)
- Filtering: Game, Role, Tier dropdowns (shadcn Select)
- Search: debounced 300ms, search theo displayName + realName
- Pagination: 20 items/page, shadcn pagination
- Row click → navigate to player detail
- Checkbox select → show bulk actions bar
- Row hover: bg #1A1A1B

TIER BADGE COMPONENT:
Variant colors:
  S → bg acid/10, text acid, border acid/30
  A → bg #00FF88/10, text #00FF88, border #00FF88/30
  B → bg #00AAFF/10, text #00AAFF, border #00AAFF/30
  C → bg #FFB800/10, text #FFB800, border #FFB800/30
  D → bg #FF4D00/10, text #FF4D00, border #FF4D00/30
  F → bg #FF4444/10, text #FF4444, border #FF4444/30

MOCK DATA (8 players — copy từ frontend spec):

interface Player {
  id: string;
  slug: string;
  displayName: string;
  realName?: string;
  nationality: string;
  imageUrl: string;
  gameId: string;
  gameName: string;
  gameShort: string;
  teamId?: string;
  teamTag?: string;
  role: string;
  rating: number;
  tier: "S" | "A" | "B" | "C" | "D" | "F";
  totalRatings: number;
  rank: number;
  isActive: boolean;
}

const mockPlayers: Player[] = [
  { id:"p1", slug:"dragonslayer99", displayName:"DragonSlayer99", realName:"Nguyễn Minh Đức", nationality:"VN", imageUrl:"/avatars/dragon.webp", gameId:"g1", gameName:"League of Legends", gameShort:"LoL", teamId:"t1", teamTag:"ALP", role:"Mid", rating:9.8, tier:"S", totalRatings:12450, rank:1, isActive:true },
  { id:"p2", slug:"thunderace", displayName:"ThunderAce", realName:"Trần Hoàng Nam", nationality:"VN", imageUrl:"/avatars/thunder.webp", gameId:"g2", gameName:"Valorant", gameShort:"VAL", teamId:"t2", teamTag:"PHX", role:"Duelist", rating:9.5, tier:"S", totalRatings:9830, rank:2, isActive:true },
  { id:"p3", slug:"kitsunepro", displayName:"KitsunePro", realName:"Lê Thị Hương", nationality:"VN", imageUrl:"/avatars/kitsune.webp", gameId:"g3", gameName:"Dota 2", gameShort:"Dota2", teamId:"t3", teamTag:"ORC", role:"Carry", rating:9.3, tier:"S", totalRatings:8200, rank:3, isActive:true },
  { id:"p4", slug:"sakurawind", displayName:"SakuraWind", realName:"Phạm Anh Thư", nationality:"VN", imageUrl:"/avatars/sakura.webp", gameId:"g4", gameName:"CS2", gameShort:"CS2", teamId:"t1", teamTag:"ALP", role:"AWPer", rating:9.1, tier:"S", totalRatings:7650, rank:4, isActive:true },
  { id:"p5", slug:"shadowviper", displayName:"ShadowViper", realName:"Võ Quốc Huy", nationality:"VN", imageUrl:"/avatars/shadow.webp", gameId:"g2", gameName:"Valorant", gameShort:"VAL", teamId:"t2", teamTag:"PHX", role:"Controller", rating:8.7, tier:"A", totalRatings:5420, rank:5, isActive:true },
  { id:"p6", slug:"blazequeen", displayName:"BlazeQueen", realName:"Đặng Thùy Linh", nationality:"VN", imageUrl:"/avatars/blaze.webp", gameId:"g1", gameName:"League of Legends", gameShort:"LoL", teamId:"t3", teamTag:"ORC", role:"ADC", rating:8.4, tier:"A", totalRatings:4890, rank:6, isActive:true },
  { id:"p7", slug:"ironwolf", displayName:"IronWolf", realName:"Bùi Đức Anh", nationality:"VN", imageUrl:"/avatars/ironwolf.webp", gameId:"g3", gameName:"Dota 2", gameShort:"Dota2", teamId:"t1", teamTag:"ALP", role:"Offlane", rating:7.9, tier:"B", totalRatings:3200, rank:7, isActive:true },
  { id:"p8", slug:"neonrush", displayName:"NeonRush", realName:"Hoàng Văn Tùng", nationality:"VN", imageUrl:"/avatars/neon.webp", gameId:"g4", gameName:"CS2", gameShort:"CS2", teamId:"t2", teamTag:"PHX", role:"Entry", rating:7.5, tier:"B", totalRatings:2100, rank:8, isActive:false },
];

COMPONENTS CẦN TẠO:
1. PlayersPage.tsx — Page wrapper
2. PlayersToolbar.tsx — Search + filters + tabs
3. PlayersTable.tsx — TanStack Table với columns
4. PlayerRow.tsx — Custom row render (avatar + name combo)
5. TierBadge.tsx — Reusable tier badge (S/A/B/C/D/F)
6. GameBadge.tsx — Game shortname badge
7. BulkActionsBar.tsx — Bottom sticky bar khi select rows
8. PlayerTablePagination.tsx — Pagination controls

shadcn components: Table, Input, Select, Badge, Button, DropdownMenu, Checkbox, Dialog (confirm delete), Tabs
Tất cả text tiếng Việt. Export full TypeScript code.
```

---

---

## PROMPT P4 — PLAYER DETAIL / EDIT FORM

### Copy toàn bộ block dưới đây:

```
Xây dựng trang Tạo/Sửa Tuyển Thủ cho Admin Dashboard "Arcade Arena".

TECH: React + TypeScript + Tailwind + shadcn/ui + Lucide + React Hook Form + Zod

DESIGN: Dark theme như các prompt trước (bg #121212, card #0A0A0A, accent #CCFF00)

PAGE LAYOUT:

┌──────────────────────────────────────────────────────────────┐
│ BREADCRUMB: Tuyển thủ > DragonSlayer99 > Chỉnh sửa          │
│                                                              │
│ PAGE TITLE: "Chỉnh sửa tuyển thủ"     [Huỷ] [💾 Lưu]       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ FORM (2-column: 60/40)                                       │
│ ┌──────────────────────────────┐ ┌──────────────────────────┐│
│ │ THÔNG TIN CƠ BẢN (Card)     │ │ HÌNH ẢNH (Card)          ││
│ │                              │ │                          ││
│ │ Tên hiển thị *               │ │ ┌──────────────────────┐ ││
│ │ [DragonSlayer99          ]   │ │ │                      │ ││
│ │                              │ │ │    [Player Avatar]   │ ││
│ │ Tên thật                     │ │ │    200×200           │ ││
│ │ [Nguyễn Minh Đức         ]   │ │ │                      │ ││
│ │                              │ │ └──────────────────────┘ ││
│ │ Slug (auto-generate)         │ │ [📤 Tải ảnh đại diện]   ││
│ │ [dragonslayer99          ]   │ │                          ││
│ │                              │ │ Banner:                  ││
│ │ Quốc tịch                    │ │ ┌──────────────────────┐ ││
│ │ [🇻🇳 Việt Nam ▾            ]│ │ │   [Banner Preview]   │ ││
│ │                              │ │ │   wide ratio         │ ││
│ │ Tiểu sử                     │ │ └──────────────────────┘ ││
│ │ [Textarea...             ]   │ │ [📤 Tải banner]         ││
│ │                              │ │                          ││
│ ├──────────────────────────────┤ ├──────────────────────────┤│
│ │ THÔNG TIN THI ĐẤU (Card)    │ │ TRẠNG THÁI (Card)        ││
│ │                              │ │                          ││
│ │ Game *                       │ │ Active: [Toggle Switch]  ││
│ │ [League of Legends ▾     ]   │ │                          ││
│ │                              │ │ Rating hiện tại: 9.8     ││
│ │ Vai trò *                    │ │ Tier: S                  ││
│ │ [Mid ▾                   ]   │ │ Rank: #1                 ││
│ │ (roles load theo game chọn)  │ │ Tổng đánh giá: 12,450   ││
│ │                              │ │ (chỉ hiển thị, không sửa)││
│ │ Đội tuyển                    │ │                          ││
│ │ [Team Alpha (ALP) ▾     ]   │ │ Ngày tạo: 15/01/2025    ││
│ │ [Không có đội] option        │ │ Cập nhật: 18/02/2026    ││
│ │                              │ │                          ││
│ └──────────────────────────────┘ └──────────────────────────┘│
│                                                              │
└──────────────────────────────────────────────────────────────┘

ZOD SCHEMA:

const playerFormSchema = z.object({
  displayName: z.string().min(2, "Tên tối thiểu 2 ký tự").max(30),
  realName: z.string().max(50).optional(),
  slug: z.string().regex(/^[a-z0-9-]+$/, "Chỉ chứa chữ thường, số, gạch ngang"),
  nationality: z.string().min(2),
  bio: z.string().max(500).optional(),
  gameId: z.string().uuid("Vui lòng chọn game"),
  role: z.string().min(1, "Vui lòng chọn vai trò"),
  teamId: z.string().uuid().optional().nullable(),
  isActive: z.boolean().default(true),
});

FEATURES:
- Auto-generate slug từ displayName (debounced)
- Roles dropdown thay đổi theo Game được chọn
- Image upload với preview (chưa cần upload thật, mock FileReader)
- Form validation real-time (hiện lỗi dưới input)
- Nút "Lưu" disabled khi form invalid hoặc chưa thay đổi
- Toast notification khi lưu thành công (shadcn Toast)
- Confirm dialog khi nhấn "Huỷ" nếu form đã thay đổi

COMPONENTS:
1. PlayerFormPage.tsx — Page wrapper (create mode / edit mode)
2. PlayerForm.tsx — React Hook Form + Zod
3. ImageUpload.tsx — Drag & drop hoặc click upload với preview
4. PlayerStatusCard.tsx — Read-only card hiện rating, tier, stats

shadcn: Card, Input, Textarea, Select, Switch, Button, Dialog, Toast, Label, Separator
Lucide: Save, X, Upload, User, Gamepad2, Shield, Flag
Tất cả tiếng Việt.
```

---

---

## PROMPT P5 — TEAMS MANAGEMENT

```
Xây dựng trang Quản Lý Đội Tuyển cho Admin Dashboard "Arcade Arena".
TECH: React + TypeScript + Tailwind + shadcn/ui + Lucide

Tương tự PlayersPage (P3) nhưng cho Teams:

TABLE COLUMNS:
1. Logo (48px)
2. Tên đội + Tag (ví dụ "Team Alpha" [ALP])
3. Tổ chức (Organization name)
4. Region (VN, KR, SEA...)
5. Số tuyển thủ (count)
6. Avg Rating (trung bình rating cả đội)
7. Status (Active/Inactive)
8. Actions (Xem, Sửa, Xoá)

FEATURES ĐẶC BIỆT:
- Click vào team → mở panel bên phải (Sheet) hiện roster (danh sách tuyển thủ trong đội)
- Roster hiện: Avatar + Name + Role + Rating cho mỗi player
- Nút "Thêm tuyển thủ vào đội" mở dialog search player
- Nút "Xoá khỏi đội" cho từng player trong roster

MOCK DATA:
const mockTeams = [
  { id:"t1", name:"Team Alpha", tag:"ALP", slug:"team-alpha", logoUrl:"/logos/alpha.webp", orgName:"Alpha Esports", region:"VN", playerCount:5, avgRating:9.0, isActive:true },
  { id:"t2", name:"Phoenix Rising", tag:"PHX", slug:"phoenix-rising", logoUrl:"/logos/phoenix.webp", orgName:"Phoenix Org", region:"VN", playerCount:5, avgRating:8.6, isActive:true },
  { id:"t3", name:"Orca Gaming", tag:"ORC", slug:"orca-gaming", logoUrl:"/logos/orca.webp", orgName:null, region:"SEA", playerCount:4, avgRating:8.8, isActive:true },
];

shadcn: Table, Sheet, Dialog, Command (search player), Avatar, Badge
```

---

---

## PROMPT P6 — MATCHES MANAGEMENT

```
Xây dựng trang Quản Lý Trận Đấu cho Admin Dashboard "Arcade Arena".
TECH: React + TypeScript + Tailwind + shadcn/ui + Lucide + date-fns

LAYOUT:

TABS: [Sắp diễn ra] [Đang diễn ra 🔴] [Đã kết thúc]

TABLE COLUMNS cho tab "Sắp diễn ra":
1. Game (icon/badge)
2. Team A vs Team B (logo + tag)
3. Giải đấu (tournament name)
4. Thời gian (formatted date)
5. Trạng thái (upcoming badge)
6. Actions (Sửa, Bắt đầu, Xoá)

TABLE COLUMNS cho tab "Đã kết thúc":
1-4: Giống trên
5. Kết quả: "[ALP] 2 - 1 [PHX]" (winner highlighted acid)
6. Actions (Xem chi tiết)

FEATURES ĐẶC BIỆT:
- Nút "Cập nhật kết quả" mở Dialog:
  - Select winner: Team A hoặc Team B
  - Score A + Score B (number input)
  - Nút "Lưu kết quả" → update match + trigger resolve predictions
- Tạo trận mới: Dialog form (Game, Team A, Team B, Tournament, Scheduled time)
- Live matches có badge đỏ nhấp nháy "LIVE"

MOCK DATA:
const mockMatches = [
  { id:"m1", game:"LoL", teamA:{tag:"ALP",name:"Team Alpha"}, teamB:{tag:"PHX",name:"Phoenix Rising"}, tournament:"VCS Mùa Xuân 2026", scheduledAt:"2026-02-20T14:00:00", status:"upcoming" },
  { id:"m2", game:"VAL", teamA:{tag:"PHX",name:"Phoenix Rising"}, teamB:{tag:"ORC",name:"Orca Gaming"}, tournament:"VCT Vietnam", scheduledAt:"2026-02-18T19:00:00", status:"live" },
  { id:"m3", game:"CS2", teamA:{tag:"ALP",name:"Team Alpha"}, teamB:{tag:"ORC",name:"Orca Gaming"}, tournament:"BLAST Open", scheduledAt:"2026-02-15T16:00:00", status:"completed", winner:"ALP", scoreA:2, scoreB:1 },
];

shadcn: Table, Tabs, Dialog, Select, Input, Badge, Button, Calendar/DatePicker
Lucide: Swords, Trophy, Clock, Play, CheckCircle
```

---

---

## PROMPT P7 — RATINGS MODERATION

```
Xây dựng trang Duyệt Đánh Giá cho Admin Dashboard "Arcade Arena".
TECH: React + TypeScript + Tailwind + shadcn/ui + Lucide

MỤC ĐÍCH: Admin duyệt/từ chối đánh giá từ cộng đồng trước khi tính vào BXH.

LAYOUT:

TABS: [Chờ duyệt (23)] [Đã duyệt] [Đã từ chối]

RATING CARD (thay vì table, dùng card list cho dễ review):

┌──────────────────────────────────────────────────────────────┐
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ [Avatar] NamAnh  →  DragonSlayer99 (LoL · Mid)          │ │
│ │ 15 phút trước                                           │ │
│ │                                                          │ │
│ │ Overall: 9.5 /10                                         │ │
│ │ Aim: 96  │  IQ: 92  │  Clutch: 95  │  Team: 88  │ Con: 90│ │
│ │ ████████   ████████   █████████   ████████   ████████    │ │
│ │                                                          │ │
│ │ Comment: "Chơi mid quá đỉnh, carry cả team trong game 3"│ │
│ │                                                          │ │
│ │                              [❌ Từ chối]  [✅ Duyệt]    │ │
│ └──────────────────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ [Avatar] HuyPro  →  ThunderAce (Valorant · Duelist)     │ │
│ │ ...                                                      │ │
│ └──────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘

FEATURES:
- Batch actions: "Duyệt tất cả" button
- Filter by game, by player
- Nút "Từ chối" mở mini dialog nhập lý do
- Stat bars hiện trực quan trong card
- Animation: card fade out khi approve/reject (Framer Motion optional)

COMPONENTS:
1. RatingsModerationPage.tsx
2. RatingCard.tsx — Card đánh giá chi tiết
3. MiniStatBars.tsx — 5 stat bars ngang nhỏ
4. RejectDialog.tsx — Dialog nhập lý do từ chối

shadcn: Card, Button, Badge, Tabs, Dialog, Textarea
Lucide: CheckCircle, XCircle, Star, MessageSquare
```

---

---

## PROMPT P8 — POINTS & REWARDS

```
Xây dựng trang Quản Lý Điểm Thưởng cho Admin Dashboard "Arcade Arena".
TECH: React + TypeScript + Tailwind + shadcn/ui + Lucide + Recharts

LAYOUT:

KPI ROW (3 cards):
- Tổng điểm đã phát: 1,200,000
- Điểm đang lưu hành: 850,000
- Trung bình điểm/user: 245

CHARTS ROW:
- Points trend (line chart — điểm phát ra theo tuần)
- Points by type (bar chart — earn_daily, earn_rating, earn_predict, spend_predict...)

TRANSACTION TABLE:
- Columns: User, Loại, Số điểm (+/-), Balance sau, Thời gian
- Filter: loại giao dịch, user search
- Color: + amount = green, - amount = red

TẶNG ĐIỂM (Admin action):
- Dialog "Tặng điểm":
  - Search & select user (Command component)
  - Số điểm (number input, max 10000)
  - Lý do (textarea)
  - [Xác nhận tặng]
- Toast success sau khi tặng

BXH ĐIỂM:
- Tab "Bảng xếp hạng điểm" — Top 20 users by points
- Columns: Rank, Avatar, Username, Điểm, Streak hiện tại

shadcn: Card, Table, Tabs, Dialog, Command, Input, Textarea, Badge, Button
Lucide: Coins, TrendingUp, Gift, Award, ArrowUpRight, ArrowDownRight
```

---

---

## PROMPT P9 — USERS MANAGEMENT

```
Xây dựng trang Quản Lý Người Dùng cho Admin Dashboard "Arcade Arena".
TECH: React + TypeScript + Tailwind + shadcn/ui + Lucide

TABLE COLUMNS:
1. Avatar + Username
2. Email
3. Role (Badge: user=default, moderator=blue, admin=acid)
4. Điểm (JetBrains Mono)
5. Số rating đã gửi
6. Ngày tham gia
7. Trạng thái (Active/Banned)
8. Actions: Đổi role, Ban/Unban, Xem chi tiết

FEATURES:
- Search by username/email
- Filter by role (User, Moderator, Admin)
- Đổi role: Dialog confirm "Bạn muốn nâng {username} lên Moderator?"
- Ban user: Dialog confirm với lý do
- User detail sheet: Activity timeline (ratings, predictions, points)

MOCK DATA:
const mockUsers = [
  { id:"u1", username:"NamAnh", email:"nam@email.com", role:"user", points:1250, ratingsCount:45, joinedAt:"2025-06-15", isActive:true },
  { id:"u2", username:"HuyPro", email:"huy@email.com", role:"moderator", points:3400, ratingsCount:120, joinedAt:"2025-03-20", isActive:true },
  { id:"u3", username:"AdminThu", email:"thu@arcadearena.vn", role:"admin", points:9999, ratingsCount:5, joinedAt:"2025-01-01", isActive:true },
  { id:"u4", username:"SpamBot99", email:"spam@fake.com", role:"user", points:0, ratingsCount:200, joinedAt:"2026-02-10", isActive:false },
];

shadcn: Table, Dialog, Sheet, Badge, DropdownMenu, Avatar, Command
Lucide: UserCog, Shield, Ban, CheckCircle, History
```

---

---

## PROMPT P10 — REUSABLE COMPONENTS LIBRARY

```
Tạo thư viện Reusable Components cho Admin Dashboard "Arcade Arena".
Đây là các components dùng chung xuyên suốt dashboard.

TECH: React + TypeScript + Tailwind + shadcn/ui + Lucide

COMPONENTS CẦN TẠO:

1. PageHeader.tsx
   Props: title: string, description?: string, actions?: ReactNode
   Layout: Title (Chakra Petch 700, 28px) + description (text-secondary) + actions bên phải

2. TierBadge.tsx
   Props: tier: "S"|"A"|"B"|"C"|"D"|"F", size?: "sm"|"md"|"lg"
   Render: shadcn Badge với color theo tier

3. GameBadge.tsx
   Props: game: string (shortName: "LoL", "VAL", "CS2", "Dota2")
   Render: Pill badge với màu riêng mỗi game

4. StatBar.tsx
   Props: label: string, value: number, max?: number, showValue?: boolean
   Render: Label + bar track (bg border-subtle) + bar fill (bg acid) + value number

5. RatingNumber.tsx
   Props: value: number, size?: "sm"|"md"|"lg"
   Render: JetBrains Mono 700, color auto theo tier từ value

6. StatusBadge.tsx
   Props: status: "active"|"inactive"|"pending"|"approved"|"rejected"|"live"|"upcoming"|"completed"
   Render: shadcn Badge + Lucide icon + color mapping

7. EmptyState.tsx
   Props: icon: LucideIcon, title: string, description: string, action?: ReactNode
   Render: Centered layout khi table/list rỗng

8. ConfirmDialog.tsx
   Props: open, onConfirm, onCancel, title, description, confirmText, variant ("default"|"destructive")
   Render: shadcn AlertDialog styled dark theme

9. DataCard.tsx (KPI Card)
   Props: icon: LucideIcon, value: string|number, label: string, change?: number, subtext?: string
   Render: Card với icon circle + big number + label + change indicator

10. SearchInput.tsx
    Props: placeholder, value, onChange, debounceMs?: number
    Render: Input với Search icon, debounced onChange

Xuất tất cả components với TypeScript props đầy đủ.
Mỗi component có JSDoc comment mô tả.
Đảm bảo consistent với design tokens đã định nghĩa.
```

---

---

## TỔNG KẾT — THỨ TỰ BUILD

```
Bước 1: P0 (Setup) → P10 (Reusable Components) → P1 (Layout)
Bước 2: P2 (Overview Dashboard)
Bước 3: P3 (Players Table) → P4 (Player Form)
Bước 4: P5 (Teams) → P6 (Matches)
Bước 5: P7 (Ratings Moderation)
Bước 6: P8 (Points) → P9 (Users)
```

**Mẹo sử dụng:**
- Mỗi prompt đã self-contained (có đủ types, mock data, design tokens)
- Paste 1 prompt → AI output code → review → paste prompt tiếp theo
- Luôn include P10 (reusable) trước khi build pages (P2–P9)
- Nếu AI output quá dài, thêm dòng: *"Chia thành 2 phần: phần 1 output components, phần 2 output page"*
- Nếu muốn custom, sửa mock data hoặc wireframe trước khi paste prompt