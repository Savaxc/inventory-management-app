# Stock.app — Minimalist Inventory Management

Stock.app is a modern, high-performance inventory management solution built for teams who value speed and simplicity. It eliminates the complexity of traditional ERP systems, focusing on real-time tracking, stock efficiency, and actionable insights.

## Previews

### Dashboard
![Stock.app Dashboard](/public/dashboard-preview-photo.png)

### Inventory
![Stock.app Inventory](/public/inventory-v2-preview.png)

### Add-Product
![Stock.app Add-Product](/public/add-product-v2-preview.png)

### Product Categories
![Stock.app Categories](/public/categories-preview.png)

### E-mail Low Stock Alert
![Stock.app Email](/public/email-resend-alert-preview.png)




## Features

- **Intuitive Dashboard**: At-a-glance metrics including total inventory value, stock counts, and growth trends.
- **Real-time Inventory Tracking**: Full CRUD functionality for products with automatic stock level status (In Stock, Low Stock, Out of Stock).
- **Smart Analytics**: Visual representations of inventory growth over time using weekly charts.
- **Automated Alerts**: Visual cues and "Action Required" badges for products falling below custom thresholds.
- **Minimalist UX**: Clean, distraction-free interface with a focus on usability and fast data entry.
- **Robust Security**: Authentication and user-specific data isolation powered by Clerk.
- **Advanced Reporting**: Generate professional **PDF Valuation Reports** and export full inventory data to **CSV** with a single click.
- **Bulk Import**: Quickly populate your database using the **CSV Import** tool with a downloadable template to ensure data consistency.
- **Smart Category Management**: 
    - **Quick Stats**: Real-time insights into total categories, usage frequency, and empty labels.
    - **Search & Sort**: Instantly filter through categories and sort by name or product count.
    - **Safety Dialogs**: Confirmation modals for all destructive actions to prevent data loss.
- **Automated Alerts**: Email notifications powered by **Resend** for products falling below custom thresholds.

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
- Clerk API keys (Authentication)
- Resend API key (Email Alerts)

### Installation

1. **Clone the repository**
   ```bash
   git clone [https://github.com/savaxc/inventory-management-app.git](https://github.com/savaxc/inventory-management-app.git)
   cd inventory-management-app

2. **Install dependencies**
   npm install

3. **Set up environment variables Create a .env.local file in the root directory:**
   DATABASE_URL="your_postgresql_url"
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your_clerk_pub_key"
   CLERK_SECRET_KEY="your_clerk_secret_key"
   RESEND_API_KEY="your_resend_key"

4. **Sync Database Schema**
   npx prisma db push

5. **Run the development server**
   npm run dev