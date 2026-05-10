import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";

export function TopNavBar() {
  const location = useLocation();

  const links = [
    { name: "Dashboard", path: "/" },
    { name: "My Trips", path: "/trips" },
    { name: "Profile", path: "/profile" },
  ];

  return (
    <header className="bg-surface border-b border-outline-variant sticky top-0 z-50">
      <div className="flex items-center justify-between px-margin-mobile md:px-margin-desktop py-md max-w-[1200px] mx-auto w-full">
        {/* Brand */}
        <div className="flex items-center gap-sm">
          <Link to="/" className="text-headline-md font-headline-lg text-primary tracking-tight">
            Traveloop
          </Link>
        </div>

        {/* Navigation Links (Web) */}
        <nav className="hidden md:flex items-center gap-lg">
          {links.map((link) => {
            const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
            return (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "font-label-md text-label-md px-3 py-2 rounded-lg transition-colors flex flex-col items-center",
                  isActive
                    ? "text-primary border-b-2 border-primary rounded-none pb-1"
                    : "text-secondary hover:text-primary hover:bg-surface-container-low"
                )}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Trailing Action */}
        <div className="hidden md:flex items-center">
          <Link
            to="/create"
            className="bg-primary text-on-primary font-label-md text-label-md px-md py-sm rounded-lg hover:bg-primary-container transition-colors flex items-center justify-center shadow-sm"
          >
            Plan New Trip
          </Link>
        </div>

        {/* Mobile Menu Icon */}
        <button className="md:hidden text-secondary p-xs rounded-lg hover:bg-surface-container-low transition-colors">
          <Menu className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
}
