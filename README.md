# TaskFlow — Kanban Project Management Board

A modern, full-featured Kanban board application built with **Next.js 16**, **TypeScript**, and **@hello-pangea/dnd** for seamless drag-and-drop functionality.

## 🚀 Features

- **User Authentication** — Register and login with client-side auth
- **Board Management** — Create, edit, and delete boards with custom colors
- **Column Management** — Add, rename, reorder, and delete columns
- **Card Management** — Create, edit, and delete task cards
- **Drag & Drop** — Smooth card movement between columns with visual feedback
- **Column Reordering** — Drag columns to rearrange them
- **Labels** — Color-coded labels for categorizing cards
- **Due Dates** — Set deadlines with visual overdue/soon indicators
- **Assignees** — Assign team members to cards
- **Activity Log** — Track card movements between columns
- **Data Persistence** — All data saved to localStorage, persists on refresh
- **Responsive Design** — Works on desktop, tablet, and mobile
- **Premium Dark UI** — Modern glassmorphism design with smooth animations

## 🛠 Tech Stack

| Technology | Purpose |
|---|---|
| Next.js 16 (App Router) | Framework & SSR |
| TypeScript | Type safety |
| @hello-pangea/dnd | Drag-and-drop |
| localStorage | Data persistence |
| Vanilla CSS | Styling |
| Vercel | Deployment |

## 📋 Technical Decisions

### Why @hello-pangea/dnd?
- Actively maintained fork of react-beautiful-dnd
- Excellent mobile touch support
- Built-in animations and visual drag feedback
- Simple, declarative API

### Ordering Strategy
- Cards maintain order via array index position in columns
- Moving cards between columns: splice from source, splice into destination
- All changes immediately persisted to localStorage

### Data Model
```
User → Board[] → Column[] → Card[]
Each card has: labels, dueDate, assignee, activityLog
```

## 🏃 Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🚀 Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Or connect your GitHub repo to Vercel for automatic deployments.

## 📱 Mobile Support

The application is fully responsive with:
- Touch-friendly drag-and-drop
- Adapted layouts for smaller screens
- Scrollable board with horizontal overflow
