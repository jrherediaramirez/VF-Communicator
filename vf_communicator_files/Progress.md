# Project Setup Log - Batch-Tracking App

**Date:** May 20, 2025
**Time:** 8:30 AM
**Phase:** Step 0 - Project Setup & Core Infrastructure

---

## I. Project Initialization & Firebase Setup

1.  **Initialized Next.js Project:**
    *   Command: `npx create-next-app@latest batch-tracking-app`
    *   Selected options:
        *   TypeScript: No
        *   ESLint: Yes
        *   Tailwind CSS: No
        *   `src/` directory: No
        *   App Router: No (Opted for Pages Router)
        *   Import alias: No
    *   Navigated into project: `cd batch-tracking-app`

2.  **Firebase Project Setup (Manual in Firebase Console):**
    *   Created a new Firebase project (e.g., `batch-tracking-app-dev`).
    *   Registered a new Web App (`</>`) within the Firebase project.
    *   Copied the `firebaseConfig` object values provided by Firebase.
    *   Enabled **Authentication** methods:
        *   Email/Password
        *   Google
    *   Set up **Cloud Firestore Database**:
        *   Started in **test mode**.
        *   Selected a Cloud Firestore location.

3.  **Installed Firebase SDK:**
    *   Command: `npm install firebase`

## II. Directory Structure & Configuration

1.  **Created Basic Directory Structure:**
    *   Command: `mkdir -p components/layout components/common contexts lib/firebase styles`
    *   Ensured directories `components/layout`, `contexts`, `lib/firebase`, and `styles` were created.

2.  **Firebase Client Configuration:**
    *   **`.env.local` File:**
        *   Created: `touch .env.local`
        *   Populated with Firebase project configuration keys (e.g., `NEXT_PUBLIC_FIREBASE_API_KEY`, etc.).
        *   **Note:** This file is gitignored and stores sensitive credentials.
    *   **`lib/firebase/config.js`:**
        *   Created: `touch lib/firebase/config.js`
        *   Added code to initialize the Firebase app using environment variables from `.env.local`.
        *   Exported Firebase services: `app`, `auth`, `db`.

## III. Global Styles & Application Layout

1.  **Global Stylesheets:**
    *   **`styles/globals.css`:**
        *   Created: `touch styles/globals.css`
        *   Added basic HTML/body resets, box-sizing, default link styling, and a sample `.container` class.
    *   **`styles/variables.css`:**
        *   Created: `touch styles/variables.css`
        *   Defined CSS custom properties (variables) for colors, fonts, spacing, etc., under `:root`.

2.  **Core Next.js Page Files (Pages Router):**
    *   **`pages/_app.jsx`:**
        *   Modified the existing `_app.js` (or created `_app.jsx`).
        *   Imported `styles/variables.css` and `styles/globals.css`.
        *   Wrapped the `Component` with `<AuthProvider>` and `<AppLayout>` components.
    *   **`pages/_document.jsx`:**
        *   Created: `touch pages/_document.jsx`
        *   Customized the `Html`, `Head`, `Main`, and `NextScript` components for the server-rendered document structure. Added basic meta tags and a favicon link.
    *   **`pages/index.jsx`:**
        *   Created: `touch pages/index.jsx`
        *   Added a basic home page component as a placeholder.

3.  **Layout Components:**
    *   **`components/layout/AppLayout.jsx` & `components/layout/AppLayout.css`:**
        *   Created files.
        *   `AppLayout.jsx`: Defines the main application structure (Navbar, main content area, Footer).
        *   `AppLayout.css`: Styles for the flex layout and footer.
    *   **`components/layout/Navbar.jsx` & `components/layout/Navbar.css`:**
        *   Created files.
        *   `Navbar.jsx`: Implemented a basic navigation bar with a logo and placeholder links.
        *   `Navbar.css`: Styles for the navbar appearance and layout.

## IV. Authentication Context Shell

1.  **`contexts/AuthContext.jsx`:**
    *   Created: `touch contexts/AuthContext.jsx`
    *   Set up a React Context (`AuthContext`) and an `AuthProvider` component.
    *   Initialized state for `user`, `role`, and `loading`.
    *   Included a placeholder `useEffect` to simulate the end of initial loading.
    *   Defined and exported a `useAuth` custom hook to consume the context.

## V. Initial Verification & Cleanup (Correction from previous state)

*   **Router Consolidation:** Identified and resolved a conflict where both Pages Router (`pages/`) and App Router (`src/app/`) files were present.
    *   **Deleted:** The entire `src/` directory and its contents (`rm -rf src`). This removed App Router specific files like `src/app/layout.js`, `src/app/page.js`, etc.
    *   **Ensured Correct Placement:**
        *   `favicon.ico` moved/confirmed to be in `public/`.
        *   `globals.css` used is `styles/globals.css` (imported in `pages/_app.jsx`).
    *   **Renamed Environment File:** Renamed `.env` to `.env.local` (`mv .env .env.local`) to adhere to Next.js conventions for local, gitignored environment variables.

*   **Initial Test:**
    *   Started the development server: `npm run dev`.
    *   Verified the application loads at `http://localhost:3000` without errors, displaying the basic layout and home page content.
    *   Confirmed Firebase initializes correctly (checked browser console).

---

**Outcome:** A foundational Next.js project (using Pages Router) is established with Firebase configured, basic global styles, a main application layout, and an initial shell for authentication context. The project structure is now consistent with the Pages Router approach.