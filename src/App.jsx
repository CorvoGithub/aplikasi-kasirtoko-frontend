// src/App.jsx
import { Routes, Route, Navigate, BrowserRouter } from "react-router-dom";
import { Toaster } from 'sonner';

// Layout Imports
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from "./components/layout/ProtectedRoute";
import Dashboard from "./pages/content/Dashboard";

// Auth Imports
import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";
import './App.css'

//Content Imports
import Profile from "./pages/content/Profile";

function App() {
  return (
    <BrowserRouter>

    <Toaster 
      position="top-right"
      expand={false}
      richColors
      closeButton
      duration={4000}
    />
    
        <div className="min-h-screen min-w-screen bg-gray-100">
          <Routes>
            {/* Initial Screen */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes - All dashboard routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardLayout />}>

                <Route index element={<Navigate to="main" replace />} />
                <Route path="main" element={<Dashboard />} />
                <Route path="profile" element={<Profile />} />

              </Route>
            </Route>

            {/* Redirect root to login */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* Redirect any unknown routes to dashboard main */}
            <Route path="*" element={<Navigate to="/dashboard/main" replace />} />
          </Routes>
        </div>
    </BrowserRouter>
  );
}

export default App;