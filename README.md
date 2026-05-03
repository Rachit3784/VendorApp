# Vintage Vendors - Premium Service Ecosystem 🌟

**Vintage Vendors** is a professional, high-end multi-vendor appointment management application built with React Native. It features a "Classic Vintage" premium aesthetic and provides a seamless bridge between local service professionals and their clients.

## 🚀 Key Features

### 👤 For Customers
- **Advanced Search**: Debounced search with suggestions and history for finding local professionals.
- **LinkedIn-Style Profiles**: Professional profiles with cover images, verified badges, and overlapping profile pictures.
- **Smart Booking**: Interactive slot selection with real-time availability checks.
- **Rating System**: Interactive star-rating and review system with live average calculation.
- **Notification Inbox**: Organized summary/detail view for appointment updates.

### 💼 For Professionals (Vendors)
- **Live Dashboard**: Real-time stats on pending, confirmed, and cancelled requests.
- **Booking Management**: Multi-tab interface (All, Pending, Confirmed, Cancelled) with instant state updates.
- **Profile Management**: Customizable gallery (up to 4 images), business description, and location settings.
- **Notification Center**: Instant alerts for new booking requests and cancellations.

## 🛠️ Tech Stack
- **Frontend**: React Native (CLI)
- **State Management**: Redux Toolkit (RTK)
- **Navigation**: React Navigation (Stack & Tabs)
- **Icons**: Lucide React Native
- **Networking**: Axios
- **Storage**: AsyncStorage

## 📦 Installation & Setup

1. **Clone the repository**
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Configure Environment**
   Update `src/services/api.js` with your backend URL.
4. **Run the application**
   ```bash
   # Start Metro Bundler
   npx react-native start
   
   # Run on Android
   npx react-native run-android
   ```

## 📸 Design Philosophy
The app follows a **"Classic Vintage"** design language:
- Dark slate color palettes.
- High-density information cards.
- Premium typography with increased letter-spacing.
- Micro-animations for feedback and transitions.

---
Built with ❤️ for a premium service experience.
