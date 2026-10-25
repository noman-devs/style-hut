# STYLE HUT — E-COMMERCE PLATFORM
### *Be Your Own Style* — Premium Women's Fashion & Lifestyle (Bangladesh)

---

## 1. Project Overview

**Style Hut** is a full-featured, database-driven e-commerce application custom-tailored for Bangladesh's luxury women's fashion and lifestyle market. Built with modern React, Vite, TypeScript, Tailwind CSS, and Supabase PostgreSQL with Row Level Security (RLS), it powers both a customer-facing boutique storefront and a comprehensive back-office administrative panel.

- **Brand:** Style Hut
- **Tagline:** Be Your Own Style
- **Target Market:** Bangladesh (Dhaka & nationwide 64 districts)
- **Currency:** BDT (৳)
- **Timezone:** Asia/Dhaka

---

## 2. Technology Stack

- **Frontend:** React 19, TypeScript, Vite
- **Styling & UI:** Tailwind CSS, Lucide React Icons
- **Routing:** React Router v7
- **Database & Backend:** Supabase (PostgreSQL 15+)
- **Authentication:** Supabase Auth (Email & Password with metadata)
- **Storage:** Supabase Storage (Buckets: `products`, `categories`, `banners`, `branding`)
- **Security:** PostgreSQL Row Level Security (RLS) on all tables + `is_admin()` Security Definer functions + atomic RPC order placement `create_order_secure` with inventory row-locking (`FOR UPDATE`).
- **Payment Handling:** Cash on Delivery (COD) + Manual Mobile Banking (bKash, Nagad, Rocket) with TrxID submission and administrator verification.

---

## 3. Design System & Palette

| Token | Hex Code | Purpose |
|---|---|---|
| Primary Pink | `#D6336C` | Primary buttons, active tabs, highlights |
| Deep Rose | `#A61E4D` | Heading accents, hover states, prices |
| Ivory | `#FFF9F2` | Subtle backgrounds, card trims, badges |
| Soft Pink | `#FCE7EF` | Chip badges, secondary buttons, subtle borders |
| Gold | `#C9A34E` | Luxury accents, ratings, special badges |
| Dark Text | `#33242A` | Primary typography, headers |
| Background | `#FDF8F9` | Clean boutique storefront canvas |

---

## 4. Key Features

### Customer Storefront
1. **Responsive Header:** Sticky boutique navigation with brand logo, live search with instant suggestions, account dropdown, wishlist counter, and cart drawer launcher.
2. **Hero Carousel:** Auto-rotating high-fashion banners powered dynamically by Supabase `banners` table.
3. **Category Showcase:** Visual boutique category cards (Saree, Salwar Kameez, Kurti, Hijab, Jewellery, Bags, Shoes, Beauty) linking to dedicated collection catalogs.
4. **Product Catalog & Filtering:** Search by keyword, filter by category, in-stock only, and sort by Newest, Price: Low to High, Price: High to Low.
5. **Product Details & Variation Manager:**
   - Image gallery with clickable thumbnails
   - Dynamic variation selector (Size: S, M, L, XL; Color: Pink, Deep Rose, Black, Emerald)
   - Real-time variation price, SKU, stock count, and image updates
   - Quantity selector with inventory limit prevention
   - Express "Buy Now" and "Add to Cart"
6. **Sliding Cart Drawer & Full Cart Page:** Real-time BDT calculation, editable quantities, delivery charge estimator (Inside Dhaka ৳70, Outside Dhaka ৳130).
7. **Checkout & Order Creation:** Guest and authenticated checkout with Bangladeshi address fields (Division, District, Area/Thana, Street Address).
8. **Manual Mobile Banking:** Step-by-step instructions for bKash, Nagad, and Rocket with TrxID and sender phone submission.
9. **Public Order Tracking:** Look up orders in real-time by Order Number + Phone Number without exposing other customers' records.
10. **Customer Account & Wishlist:** Manage saved favorites, view past orders, and review payment verification statuses.

### Administrator Portal (`/admin`)
1. **Analytics Dashboard:** Total Sales (BDT ৳) computed strictly from valid orders, Total Orders count, Pending Orders, Low-Stock items, and Out-of-Stock alerts.
2. **Product Management:** Dedicated form-based product editor supporting both **Simple Products** and **Variable Products** (attributes, unique SKU, regular/sale price, and stock quantity per variant).
3. **Category Management:** Create, edit, reorder, and safely delete categories (safeguarded against deleting categories containing active products).
4. **Order Fulfillment:** Live status updates (Pending → Confirmed → Processing → Shipped → Delivered → Cancelled).
5. **Payment Verification:** Review bKash/Nagad/Rocket TrxIDs and mark payments as *Paid* or *Rejected*.
6. **Atomic Cancellation & Restock:** Automatically restores stock quantities to the warehouse when an order is cancelled.
7. **Inventory Management:** Live inventory monitor with low-stock alerts (≤ 8 units) and quick inline stock adjustment.
8. **Customer Management:** Customer list with order history and account blocking/unblocking controls.
9. **Banner Management:** Create, reorder, enable, and disable homepage promotional carousels.
10. **Payment Configuration:** Modify bKash, Nagad, and Rocket account numbers, types (Merchant / Personal), and send-money instructions.
11. **Website & Social Settings:** Configure store name, tagline, hotline, WhatsApp, email, Dhaka address, delivery fees, and policy content.

---

## 5. Supabase Setup & Database Migrations

### Step 1: Create a Supabase Project
1. Go to [https://supabase.com](https://supabase.com) and create a new project.
2. Select your preferred database region (e.g., Singapore `ap-southeast-1` for lowest latency to Bangladesh).

### Step 2: Run Database Migrations
Execute the SQL migration files located in `supabase/migrations/` in the Supabase SQL Editor in the following order:

1. `supabase/migrations/20261025000001_initial_schema.sql`
   - Creates the 20 core tables, foreign keys, triggers, and performance indexes.
2. `supabase/migrations/20261025000002_rls_policies.sql`
   - Enables Row Level Security on all tables and creates secure `is_admin()` helper.
3. `supabase/migrations/20261025000003_order_functions.sql`
   - Deploys the atomic `create_order_secure`, `cancel_order_and_restock`, and `track_order_public` PostgreSQL functions.
4. `supabase/migrations/20261025000004_storage_setup.sql`
   - Configures storage buckets (`products`, `categories`, `banners`, `branding`) with public read access and admin-only upload policies.
5. *(Optional)* `supabase/seed.sql`
   - Seeds initial Bangladeshi fashion data (Sarees, Kurtis, Kundan sets, payment settings, store settings, and banners).

---

## 6. Environment Configuration

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your Supabase project credentials (found in **Project Settings -> API**):
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key
   ```

> **Security Note:** Never expose the Supabase `service_role` secret in `.env` or frontend files. The application uses atomic PostgreSQL RPC functions (`create_order_secure`) with `SECURITY DEFINER` and RLS to execute checkout and order placement safely with the anon publishable key.

---

## 7. How to Create the First Administrator Securely

1. In the storefront, register a customer account at `/register` (e.g., `admin@stylehutbd.com`).
2. Open your Supabase Dashboard -> **SQL Editor** and run:
   ```sql
   UPDATE public.profiles
   SET role = 'admin'
   WHERE id = (
     SELECT id FROM auth.users WHERE email = 'admin@stylehutbd.com'
   );
   ```
3. Sign in with that account. You will now have administrative privileges and access to `/admin`.
4. *(Local Preview Mode)* When Supabase is not yet connected, click the **"Switch to Admin"** button in the top announcement bar to preview the admin panel immediately.

---

## 8. Local Development Commands

```bash
# Install dependencies
npm install

# Start Vite local development server
npm run dev

# Run TypeScript check and production build
npm run build

# Preview production build locally
npm run preview
```

---

## 9. Deployment Instructions

### Deploy to Vercel
1. Push your repository to GitHub.
2. Import the project into [Vercel](https://vercel.com).
3. Framework Preset: **Vite**.
4. Set Environment Variables:
   - `VITE_SUPABASE_URL`: `https://your-project.supabase.co`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`: `your-anon-key`
5. Click **Deploy**. Single Page Application (SPA) routing is supported automatically.

### Deploy to Netlify
1. Connect your repository to Netlify.
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add a `_redirects` file in `public/_redirects`:
   ```text
   /*    /index.html   200
   ```
5. Configure the environment variables in Netlify Site Settings.

---

## 10. Manual Payment Verification Workflow

1. Customer chooses **bKash**, **Nagad**, or **Rocket** at checkout.
2. The customer sends money from their mobile app to the boutique account displayed on the screen.
3. The customer inputs their **Transaction ID (TrxID)** and submits the order.
4. The order is recorded in the database with status `pending` and payment status `awaiting_verification`.
5. The administrator opens `/admin/orders`, clicks **Details** on the order, cross-checks the TrxID with their bKash/Nagad statement, and clicks **Approve Payment (Mark Paid)**.
6. The status updates in real-time, allowing the customer to see that their payment has been verified on `/track-order`.

---

## 11. Security & Anti-Fraud Architecture

- **Price Verification:** Prices submitted by the browser are never trusted blindly; the server-side RPC reads published catalog prices and variant records.
- **Atomic Stock Deduction:** Database row locking (`SELECT ... FOR UPDATE`) prevents concurrent overselling.
- **Idempotency Protection:** Repeated submissions using the same transaction ID are prevented from duplicating orders.
- **No Direct Table Exposure:** Customers can only read active products, active categories, and active banners. Order tracking is guarded by order number and phone matching.

---

## 12. License & Ownership

© 2026 Style Hut Bangladesh. All rights reserved.
