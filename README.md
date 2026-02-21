# ReadHub Mobile App 📱

A React Native (Expo) mobile client for the ReadHub platform, featuring real-time news aggregation, category filtering, and user authentication.

## 🚀 Overview

ReadHub Mobile is designed to provide a premium news reading experience. It integrates with a custom backend to fetch paginated news articles, supports user registration with personalized avatars, and offers a smooth, responsive UI.

## 🛠 Tech Stack

- **Framework**: [Expo](https://expo.dev/) (React Native)
- **Navigation**: [React Navigation](https://reactnavigation.org/) (Native Stack)
- **Icons**: Expo Vector Icons (Feather)
- **Language**: TypeScript
- **Styling**: Native StyleSheet with a focus on premium aesthetics.

## 📂 Project Structure

```text
readhub-app/
├── assets/             # Images, fonts, and splash screens
├── constants/          # Application constants
│   ├── categories.ts   # News categories definition
│   └── user.ts         # User-related constants (e.g., Avatar options)
├── navigation/         # Navigation configuration
│   └── rootNavigator.tsx# Main Stack Navigator
├── screens/            # Application screens
│   ├── home.tsx        # News feed with pagination and categories
│   ├── login.tsx       # User login with keyboard handling
│   └── register.tsx    # User registration with avatar picker
├── services/           # API service layer
│   ├── news.ts         # Paginated news fetching logic
│   └── userService.ts  # Login and Registration API calls
├── types/              # TypeScript interfaces/types
│   ├── news.ts         # News-related data structures
│   └── user.ts         # User/Auth-related data structures
└── .env                # Environment variables (GitIgnored)
```

## ✨ Features Implemented (Till Date)

### 1. **Authentication System**

- **Login screen**: Features email/password inputs, toggleable password visibility, and full keyboard handling (`TouchableWithoutFeedback` + `KeyboardAvoidingView`).
- **Registration screen**: Allows new users to join. Includes a custom **Avatar Selection** UI with multiple pre-defined options.
- **User Service**: Fully integrated with the backend API for `login` and `addUser` (register).

### 2. **Home Screen & News Feed**

- **Live Data**: Fetches news from the ReadHub backend.
- **Efficient Lists**: Uses `FlatList` for high-performance rendering.
- **Pagination**: Implemented **Infinite Scrolling** (loads more news as you scroll).
- **Category Filtering**: Horizontal scrolling categories to filter news by topic (Tech, Business, Sports, etc.).
- **Pull-to-Refresh**: Seamlessly reload the latest news.

### 3. **Infrastructure**

- **Environment Variables**: Integrated `expo-constants` to handle different base URLs (Production vs. Local Development).
- **Theming**: Premium UI with glassmorphism touches, clean typography, and consistent spacing.

## ⚙️ Setup & Development

### Environment Variables

Create a `.env` file in the root directory:

```env
# Production
EXPO_PUBLIC_API_BASE_URL=https://readhub-backend.onrender.com/api

# Local Development (Android Emulator)
# EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:5000/api
```

### Running the Project

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npx expo start
   ```
3. Open on your device/emulator (typically by pressing `a` for Android or `i` for iOS).

## 📝 Troubleshooting Cache

If `.env` changes are not reflecting, restart the server with:

```bash
npx expo start -c
```

## 🛠 Code Quality

Maintain code standards and type safety with these commands:

- **Linting**:
  ```bash
  npm run lint
  ```
- **Type Checking**:
  ```bash
  npm run type-check
  ```

---

_Last updated: February 21, 2026_
