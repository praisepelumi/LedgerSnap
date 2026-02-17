import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  HomeIcon,
  CameraIcon,
  DocumentTextIcon,
  TagIcon,
  ArrowDownTrayIcon,
  ArrowRightStartOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../contexts/AuthContext.js";

const navItems = [
  { to: "/", label: "Dashboard", icon: HomeIcon },
  { to: "/capture", label: "Scan", icon: CameraIcon },
  { to: "/receipts", label: "Receipts", icon: DocumentTextIcon },
  { to: "/categories", label: "Categories", icon: TagIcon },
  { to: "/export", label: "Export", icon: ArrowDownTrayIcon },
];

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleSignOut = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="hidden md:block border-b border-receipt-line bg-receipt-paper/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 flex items-center h-16 gap-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-ink-700 flex items-center justify-center">
            <DocumentTextIcon className="w-5 h-5 text-receipt-cream" />
          </div>
          <span className="font-display text-xl text-ink-800">
            LedgerSnap
          </span>
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-1">
          {navItems.map(({ to, label, icon: Icon }) => {
            const isActive =
              to === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(to);

            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-ink-700 text-receipt-cream"
                    : "text-ink-500 hover:text-ink-700 hover:bg-ink-50"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* User menu */}
        {user && (
          <div className="flex items-center gap-3">
            {user.picture ? (
              <img
                src={user.picture}
                alt={user.name}
                className="w-8 h-8 rounded-full border border-receipt-line"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-ink-200 flex items-center justify-center text-ink-600 text-sm font-medium">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-sm text-ink-600 hidden lg:block max-w-[120px] truncate">
              {user.name}
            </span>
            <button
              onClick={handleSignOut}
              title="Sign out"
              className="p-2 rounded-lg text-ink-400 hover:text-ink-700 hover:bg-ink-50 transition-colors"
            >
              <ArrowRightStartOnRectangleIcon className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
