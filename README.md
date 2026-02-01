# Stock.app — Minimalist Inventory Management

Stock.app is a modern, high-performance inventory management solution built for teams who value speed and simplicity. It eliminates the complexity of traditional ERP systems, focusing on real-time tracking, stock efficiency, and actionable insights.

![Stock.app Preview](/public/dashboard-preview-photo.png)

![Stock.app Preview](/public/inventory-preview-photo.png)

![Stock.app Preview](/public/add-product-preview-photo.png)



## Features

- **Intuitive Dashboard**: At-a-glance metrics including total inventory value, stock counts, and growth trends.
- **Real-time Inventory Tracking**: Full CRUD functionality for products with automatic stock level status (In Stock, Low Stock, Out of Stock).
- **Smart Analytics**: Visual representations of inventory growth over time using weekly charts.
- **Automated Alerts**: Visual cues and "Action Required" badges for products falling below custom thresholds.
- **Minimalist UX**: Clean, distraction-free interface with a focus on usability and fast data entry.
- **Robust Security**: Authentication and user-specific data isolation powered by Clerk.

## Tech Stack

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Auth**: [Clerk](https://clerk.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Validation**: [Zod](https://zod.dev/)

## Architecture
The project follows a modern Server-First architecture:
- **Server Components**: Used for data fetching to reduce client-side JavaScript.
- **Server Actions**: Handle form submissions and database mutations without API routes.
- **Optimistic UI**: Providing instant feedback on stock updates (if implemented).
- **Streaming & Skeletons**: Custom-built skeleton screens for seamless loading states.

## Getting Started

### Prerequisites

- Node.js 18.x or later
- Next.js 15.x or later
- A PostgreSQL database instance (local or hosted like Supabase/Neon)
- Clerk API keys

### Installation

1. **Clone the repository**
   ```bash
   git clone [https://github.com/savaxc/inventory-management-app.git](https://github.com/savaxc/inventory-management-app.git)
   cd inventory-management-app