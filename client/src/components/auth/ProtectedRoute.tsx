import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.js";
import { Spinner } from "../ui/Spinner.js";

/**
 * Route guard — redirects to /login if not authenticated.
 * Shows a loading spinner while checking auth status.
 */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-receipt-cream">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
