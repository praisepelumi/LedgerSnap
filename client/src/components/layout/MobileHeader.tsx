import { useNavigate } from "react-router-dom";
import { DocumentTextIcon, ArrowRightStartOnRectangleIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../../contexts/AuthContext.js";

export function MobileHeader() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleSignOut = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="md:hidden border-b border-receipt-line bg-receipt-paper/80 backdrop-blur-md sticky top-0 z-40">
      <div className="flex items-center justify-between h-14 px-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-ink-700 flex items-center justify-center">
            <DocumentTextIcon className="w-4 h-4 text-receipt-cream" />
          </div>
          <span className="font-display text-lg text-ink-800">LedgerSnap</span>
        </div>

        {/* User + Sign Out */}
        {user && (
          <div className="flex items-center gap-2">
            {user.picture ? (
              <img
                src={user.picture}
                alt={user.name}
                className="w-7 h-7 rounded-full border border-receipt-line"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-ink-200 flex items-center justify-center text-ink-600 text-xs font-medium">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <button
              onClick={handleSignOut}
              title="Sign out"
              className="p-1.5 rounded-lg text-ink-400 hover:text-ink-700 hover:bg-ink-50 transition-colors"
            >
              <ArrowRightStartOnRectangleIcon className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
