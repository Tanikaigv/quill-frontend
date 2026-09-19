import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const SKIP_AUTH = import.meta.env.VITE_SKIP_AUTH === "true";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, ready } = useAuth();
  const location = useLocation();
  
  if (SKIP_AUTH) return children;
  if (!ready) return null;
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}
