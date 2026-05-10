import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Compass, User } from "lucide-react";

export function BottomNavBar() {
  const location = useLocation();

  const links = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Trips", path: "/trips", icon: Compass },
    { name: "Profile", path: "/profile", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 md:hidden bg-surface/90 backdrop-blur-md border-t border-outline-variant py-sm flex justify-around items-center">
      {links.map((link) => {
        const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
        const Icon = link.icon;
        
        return (
          <Link
            key={link.name}
            to={link.path}
            className={cn(
              "flex flex-col items-center justify-center transition-colors px-4 py-1 rounded-lg min-w-[64px]",
              isActive
                ? "text-primary active:bg-surface-container-high"
                : "text-on-surface-variant active:bg-surface-container-high"
            )}
          >
            <Icon className="w-6 h-6 mb-xs" />
            <span className="font-label-md text-label-md mt-1">{link.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
