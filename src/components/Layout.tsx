import { Outlet } from "react-router-dom";
import { TopNavBar } from "@/components/TopNavBar";
import { BottomNavBar } from "@/components/BottomNavBar";

export default function Layout() {
  return (
    <div className="page-shell flex flex-col min-h-screen">
      <TopNavBar />
      <Outlet />
      <BottomNavBar />
    </div>
  );
}
