import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "./lib/firebase";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import ProfilePersonal from "./pages/ProfilePersonal";
import ProfileBilling from "./pages/ProfileBilling";
import ProfileNotifications from "./pages/ProfileNotifications";
import ProfileSection from "./pages/ProfileSection";
import Dashboard from "./pages/Dashboard";
import CreateTrip from "./pages/CreateTrip";
import MyTrips from "./pages/MyTrips";
import TripItinerary from "./pages/TripItinerary";
import ActivitySearch from "./pages/ActivitySearch";
import Budget from "./pages/Budget";
import PackingChecklist from "./pages/PackingChecklist";

function RequireAuth({ children }: { children: JSX.Element }) {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  if (user === undefined) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-on-background">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Main layout with navigations */}
        <Route element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }>
          <Route path="/" element={<Dashboard />} />
          <Route path="/create" element={<CreateTrip />} />
          <Route path="/trips" element={<MyTrips />} />
          <Route path="/trips/:tripId" element={<TripItinerary />} />
          <Route path="/trips/:tripId/search" element={<ActivitySearch />} />
          <Route path="/trips/:tripId/budget" element={<Budget />} />
          <Route path="/trips/:tripId/packing" element={<PackingChecklist />} />
          <Route path="/profile/personal" element={<ProfilePersonal />} />
          <Route path="/profile/billing" element={<ProfileBilling />} />
          <Route path="/profile/notifications" element={<ProfileNotifications />} />
          <Route path="/profile/:section" element={<ProfileSection />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
        
        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
