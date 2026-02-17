import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext.js";
import { ProtectedRoute } from "./components/auth/ProtectedRoute.js";
import { AppShell } from "./components/layout/AppShell.js";
import LoginPage from "./pages/LoginPage.js";
import DashboardPage from "./pages/DashboardPage.js";
import CapturePage from "./pages/CapturePage.js";
import ReceiptListPage from "./pages/ReceiptListPage.js";
import ReceiptDetailPage from "./pages/ReceiptDetailPage.js";
import CategoriesPage from "./pages/CategoriesPage.js";
import ExportPage from "./pages/ExportPage.js";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected routes */}
          <Route
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<DashboardPage />} />
            <Route path="/capture" element={<CapturePage />} />
            <Route path="/receipts" element={<ReceiptListPage />} />
            <Route path="/receipts/:id" element={<ReceiptDetailPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/export" element={<ExportPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
