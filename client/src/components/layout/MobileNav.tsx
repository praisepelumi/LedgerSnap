import { Link, useLocation } from "react-router-dom";
import {
  HomeIcon,
  CameraIcon,
  DocumentTextIcon,
  TagIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";

const navItems = [
  { to: "/", label: "Home", icon: HomeIcon },
  { to: "/receipts", label: "Receipts", icon: DocumentTextIcon },
  { to: "/capture", label: "Scan", icon: CameraIcon, isPrimary: true },
  { to: "/categories", label: "Tags", icon: TagIcon },
  { to: "/export", label: "Export", icon: ArrowDownTrayIcon },
];

export function MobileNav() {
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 bg-receipt-paper/95 backdrop-blur-md border-t border-receipt-line z-40 safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map(({ to, label, icon: Icon, isPrimary }) => {
          const isActive =
            to === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(to);

          if (isPrimary) {
            return (
              <Link
                key={to}
                to={to}
                className="flex flex-col items-center -mt-6"
              >
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all ${
                    isActive
                      ? "bg-receipt-stamp scale-110"
                      : "bg-ink-700 hover:bg-ink-800"
                  }`}
                >
                  <Icon className="w-6 h-6 text-receipt-cream" />
                </div>
                <span className="text-[10px] font-medium text-ink-500 mt-1">
                  {label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors ${
                isActive ? "text-receipt-stamp" : "text-ink-400"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
