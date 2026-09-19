import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { MarketDataProvider } from "./context/MarketDataContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import DashboardLayout from "./components/layout/DashboardLayout";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import MarketsPage from "./pages/MarketsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import CorrelationPage from "./pages/CorrelationPage";
import BacktestPage from "./pages/BacktestPage";

export default function App() {
  return (
    <AuthProvider>
      <MarketDataProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            <Route
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/markets" element={<MarketsPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/correlation" element={<CorrelationPage />} />
              <Route path="/backtest" element={<BacktestPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </MarketDataProvider>
    </AuthProvider>
  );
}
