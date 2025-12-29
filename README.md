# OPOS - Point of Sale System

A modern, responsive Point of Sale (POS) system built with Next.js, Tailwind CSS, and MongoDB for bike and car service management.

## Features

- **Dashboard**: Clean interface with service selection (Bike/Car)
- **Dynamic Pricing**: Predefined prices with custom amount option
- **Real-time Checkout**: Live order summary and transaction processing
- **Admin Dashboard**: Sales analytics, transaction history, and settings management
- **Print Functionality**: Thermal receipt printing support
- **Notifications**: Toast notifications for user feedback
- **Responsive Design**: Optimized for tablets and desktops

## Tech Stack

- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS
- **Database**: MongoDB with Mongoose
- **State Management**: Zustand
- **Charts**: Recharts
- **Notifications**: React Hot Toast

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or cloud instance)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create `.env.local` with:
   ```
   MONGODB_URI=mongodb://localhost:27017/opos
   ```

4. Start MongoDB service

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## Usage

- Navigate to the dashboard and select Bike or Car service
- Choose from predefined prices or enter a custom amount
- Review the order summary and place the order
- Print the receipt or close the modal
- Access admin panel at `/admin` for analytics and settings

## API Routes

- `GET/POST /api/orders` - Manage orders
- `GET/PUT /api/settings` - Manage pricing settings

## Build

```bash
npm run build
```

## Deploy on Vercel

Ensure MongoDB connection string is set in environment variables.
