# ReadHub Mobile App 📱

A React Native (Expo) mobile client for the ReadHub platform, featuring real-time news aggregation, category filtering, and user authentication.

## 🚀 Overview

ReadHub Mobile is designed to provide a premium news reading experience. It integrates with a custom backend to fetch paginated news articles, supports user registration with personalized avatars, and offers a smooth, responsive UI.

## 🛠 Tech Stack

- **Framework**: [Expo](https://expo.dev/) (React Native)
- **Navigation**: [React Navigation](https://reactnavigation.org/) (Native Stack)
- **Icons**: Expo Vector Icons (Feather)
- **Language**: TypeScript
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Styling**: Native StyleSheet with a focus on premium aesthetics.

## 📂 Project Structure

```text
readhub-app/
├── assets/             # Images, fonts, and splash screens
├── constants/          # Application constants
│   ├── categories.ts   # News categories definition
│   └── user.ts         # User-related constants (e.g., Avatar options)
├── components/         # Reusable UI components
│   ├── UserDrawer.tsx  # Shadcn-inspired bottom drawer
│   ├── NewsFeed.tsx    # News timeline and filters
│   └── StoriesFeed.tsx # Endless list of AI-generated stories
├── navigation/         # Navigation configuration
│   └── rootNavigator.tsx# Main Stack Navigator
├── screens/            # Application screens
│   ├── home.tsx        # News & Stories tabed home screen
│   ├── login.tsx       # User login with keyboard handling
│   ├── register.tsx    # User registration with avatar picker
│   └── storyDetail.tsx # Detailed viewing of AI stories
├── services/           # API service layer
│   ├── news.ts         # Paginated news fetching logic
│   ├── userService.ts  # Login and Registration API calls
│   └── storyService.ts # Story fetching and endpoint integration
├── store/              # Global state management
│   └── useAuthStore.ts # Zustand store for authentication
├── types/              # TypeScript interfaces/types
│   ├── news.ts         # News-related data structures
│   ├── story.ts        # AI Story schema mappings
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
- **Country Switcher**: Toggle between **US** and **IN** (India) news sources seamlessly.
- **Pull-to-Refresh**: Seamlessly reload the latest news.

### 3. **AI Story Integration**

- **Stories Feed**: A dedicated tab to view infinite worlds created globally by AI constraints. Fetches ongoing global stories with image covers.
- **Robust Integration**: Fallback image loading synced mechanically with the Next.js `readhub_frontend` to handle asset availability.
- **Story Detailed View**: Fully styled markdown-like view showing expansive details, characters, reading chapters with interactive expanding, and AI-generated review ratings.

### 4. **UI/UX & Infrastructure**

- **Shadcn-inspired Drawer**: Reusable bottom drawer for user profile and logout actions.
- **State Management**: Zustand-powered auth state for persistence and accessibility.

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

_Last updated: March 7, 2026_
