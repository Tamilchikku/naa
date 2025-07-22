import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

// Contexts
import { AuthProvider } from './context/AuthContext';

// Components
import PublicLayout from './components/layout/PublicLayout';
import AdminLayout from './components/layout/AdminLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Public Pages
import HomePage from './pages/public/HomePage';
import CharitiesPage from './pages/public/CharitiesPage';
import CharityDetailPage from './pages/public/CharityDetailPage';
import DonatePage from './pages/public/DonatePage';
import FoodSlotsPage from './pages/public/FoodSlotsPage';
import FoodSlotDetailPage from './pages/public/FoodSlotDetailPage';
import BookSlotPage from './pages/public/BookSlotPage';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCharities from './pages/admin/AdminCharities';
import AdminDonations from './pages/admin/AdminDonations';
import AdminFoodSlots from './pages/admin/AdminFoodSlots';
import AdminNotifications from './pages/admin/AdminNotifications';
import AdminReports from './pages/admin/AdminReports';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<PublicLayout />}>
              <Route index element={<HomePage />} />
              <Route path="charities" element={<CharitiesPage />} />
              <Route path="charities/:id" element={<CharityDetailPage />} />
              <Route path="donate/:charityId?" element={<DonatePage />} />
              <Route path="food-slots" element={<FoodSlotsPage />} />
              <Route path="food-slots/:id" element={<FoodSlotDetailPage />} />
              <Route path="book-slot/:id" element={<BookSlotPage />} />
            </Route>

            {/* Admin Login */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Protected Admin Routes */}
            <Route 
              path="/admin/*" 
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="charities" element={<AdminCharities />} />
              <Route path="donations" element={<AdminDonations />} />
              <Route path="food-slots" element={<AdminFoodSlots />} />
              <Route path="notifications" element={<AdminNotifications />} />
              <Route path="reports" element={<AdminReports />} />
            </Route>

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          {/* Toast Notifications */}
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
