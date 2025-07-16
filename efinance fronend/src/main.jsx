import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from './App'
import Dashboard from './components/dashboard/Dashboard'
import './index.css'
import Transactions from './pages/Transactions'
import Expenses from './pages/Expenses'
import Investment from './pages/Investment'
import Upgrade from './pages/Upgrade'
import ChatBot from './components/dashboard/ChatBot';

/**
 * Application Clerk Authentication Key
 * Retrieved from environment variables for secure authentication handling
 */
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

// Ensure the authentication key is available before proceeding
if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

/**
 * Application Router Configuration
 * 
 * Defines the application's route structure using React Router:
 * - Root route renders the App component (login page)
 * - Dashboard route with nested child routes for different sections
 * - ChatBot is rendered alongside Dashboard for all dashboard routes
 */
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, // Root route - Login page
  },
  {
    path: "/dashboard",
    // Render Dashboard and ChatBot side by side using React Fragment
    element: <>
      <Dashboard />
      <ChatBot />
    </>,
    // Nested child routes within the dashboard
    children: [
      {
        index: true,
        element: <></>, // Overview is handled by Dashboard component itself
      },
      {
        path: "overview",
        element: <></>, // Overview is handled by Dashboard component itself
      },
      {
        path: "transactions",
        element: <Transactions />, // Transactions page
      },
      {
        path: "expenses",
        element: <Expenses />, // Expenses tracking page
      },
      {
        path: "investment",
        element: <Investment />, // Investment portfolio page
      },
      {
        path: "upgrade",
        element: <Upgrade />, // Premium features upgrade page
      }
    ],
  },
]);

/**
 * Application Root Rendering
 * 
 * Renders the application inside:
 * 1. StrictMode - For highlighting potential problems in development
 * 2. ClerkProvider - For authentication services
 * 3. RouterProvider - For navigation handling
 */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ClerkProvider 
      publishableKey={PUBLISHABLE_KEY}
      afterSignInUrl="/dashboard/overview" // Redirect after login
      afterSignUpUrl="/dashboard/overview" // Redirect after registration
      afterSignOutUrl="/" // Redirect after logout
    >
      <RouterProvider router={router} />
    </ClerkProvider>
  </StrictMode>,
);