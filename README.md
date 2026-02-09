# SHECS - Smart Home Energy Control System

SHECS (Smart Home Energy Control System) is a high-fidelity energy monitoring and management platform designed for **Green Hills Academy**. It provides real-time insights, administrative oversight, and a seamless user experience for electricity consumption tracking and credit management.

## 🚀 Features

### For Administrators
- **Interactive Insights**: Real-time dashboards with professional analytics powered by Recharts.
- **Trend Monitoring**: Dual-series charts for Active Meters, Total Balance (kWh), and Estimated Revenue (RWF).
- **Utility Tracking**: All-access oversight of registered meters, top-up histories, and system alerts.
- **User Management**: Role-based access control with secure profile creation and automated notification triggers.
- **Data Export**: Support for exporting utility data and transaction logs to CSV.

### For Users
- **Real-Time Dashboards**: Monitor live power telemetry (kW, Voltage, Amperage) directly from the smart meter.
- **Intuitive Metering**: Easy meter registration and multi-meter support for various units/blocks.
- **Smart Top-Ups**: Instant credit generation with RURA 2025 tariff calculations and automated RWF to kWh conversion.
- **Low Balance Alerts**: Automated visual alerts when energy levels drop below critical thresholds.

### Global Enhancements
- **Multi-Theme Support**: Full integration of Light, Dark, and System themes using `next-themes` and semantic Tailwind v4 tokens.
- **High-Fidelity UI**: A modern, responsive design built with Tailwind CSS v4 and Lucide React.
- **Real-Time Updates**: Seamless data synchronization powered by Supabase PostgreSQL and Real-time subscriptions.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Database / Auth**: [Supabase](https://supabase.com/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **State Management**: React Hooks & Server Actions
- **Theming**: `next-themes`

## 🏁 Getting Started

### Prerequisites
- Node.js 18.x or higher
- A Supabase Project (PostgreSQL + Auth)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/thealphamich/SHECS.git
   cd SHECS
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env.local` file in the root directory and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open the application**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Architecture

The project follows a modern Next.js architecture:
- `src/app`: Application routes, layouts, and Server Components.
- `src/components`: UI components organized by feature (admin, dashboard, shared).
- `src/lib`: Shared utilities, database clients, and tariff calculators.
- `supabase/migrations`: Database schema, RLS policies, and SQL triggers.

## ⚖️ License

Distributed under the MIT License.

---
Built with ❤️ for Green Hills Academy.
