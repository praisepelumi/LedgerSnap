import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar.js";
import { MobileHeader } from "./MobileHeader.js";
import { MobileNav } from "./MobileNav.js";
import { Toaster } from "react-hot-toast";

export function AppShell() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <MobileHeader />
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-6 pb-24 md:pb-6">
        <Outlet />
      </main>
      <MobileNav />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#2A2215",
            color: "#FEFCF3",
            borderRadius: "8px",
            fontFamily: '"DM Sans", sans-serif',
            fontSize: "14px",
          },
        }}
      />
    </div>
  );
}
