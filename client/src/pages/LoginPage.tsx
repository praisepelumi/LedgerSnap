import { useNavigate } from "react-router-dom";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { DocumentTextIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext.js";

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // If already authenticated, redirect to dashboard
  if (isAuthenticated) {
    navigate("/", { replace: true });
    return null;
  }

  const handleSuccess = async (response: CredentialResponse) => {
    if (!response.credential) {
      toast.error("Google sign-in failed — no credential received");
      return;
    }

    try {
      await login(response.credential);
      toast.success("Welcome to LedgerSnap!");
      navigate("/", { replace: true });
    } catch (err: any) {
      toast.error(err.message || "Sign-in failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-receipt-cream flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-ink-700 flex items-center justify-center">
          <DocumentTextIcon className="w-7 h-7 text-receipt-cream" />
        </div>
        <h1 className="font-display text-3xl text-ink-800">LedgerSnap</h1>
      </div>

      {/* Login card */}
      <div className="receipt-card p-8 max-w-sm w-full text-center">
        <h2 className="font-display text-xl text-ink-800 mb-2">
          Sign in to get started
        </h2>
        <p className="text-sm text-ink-400 mb-8">
          Scan receipts, categorize expenses, and export to CSV — all powered by
          AI.
        </p>

        {/* Google Sign-In button */}
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => toast.error("Google sign-in failed")}
            theme="outline"
            size="large"
            width="280"
            text="signin_with"
            shape="rectangular"
          />
        </div>

        <p className="text-xs text-ink-300 mt-6">
          Your data stays private. We only use your Google account for
          authentication.
        </p>
      </div>

      {/* Footer */}
      <p className="text-xs text-ink-300 mt-8">
        AI-powered receipt parsing with Claude Haiku
      </p>
    </div>
  );
}
