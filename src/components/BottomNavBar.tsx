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
    <nav className="fixed bottom-0 left-0 w-full z-50 md:hidden bg-white/10 backdrop-blur-xl border-t border-white/10 py-3 flex justify-around items-center shadow-[0_-15px_40px_rgba(0,0,0,0.22)]">
      {links.map((link) => {
        const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
        const Icon = link.icon;
        
        return (
          <Link
            key={link.name}
            to={link.path}
            className={cn(
              "flex flex-col items-center justify-center transition-all duration-300 px-4 py-2 rounded-2xl min-w-[64px]",
              isActive
                ? "text-primary bg-surface-container-lowest shadow-[0_18px_40px_rgba(77,168,255,0.16)]"
                : "text-on-background/50 hover:text-primary hover:bg-white/10"
            )}
          >
            <Icon className="w-6 h-6 mb-1" />
            <span className="font-label-md text-label-md">{link.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
