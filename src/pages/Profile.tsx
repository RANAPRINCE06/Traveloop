import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { User as UserIcon, Settings, CreditCard, Bell, HelpCircle, LogOut } from "lucide-react";
import { signOut, onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = () => {
    signOut(auth).then(() => {
       window.location.href = '/login';
    });
  }

  // Helper to get initial
  const getInitial = () => {
    if (user?.displayName) return user.displayName.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return "U";
  };

  return (
    <main className="flex-1 w-full max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop py-xl pb-24 md:pb-xl flex flex-col gap-lg items-center">
      <section className="w-full max-w-[600px] flex flex-col gap-md items-center mb-md">
        <div className="w-[120px] h-[120px] bg-primary text-on-primary rounded-full flex items-center justify-center text-[48px] font-bold shadow-sm mb-xs relative overflow-hidden">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            getInitial()
          )}
        </div>
        <div className="text-center">
          <h1 className="font-headline-lg text-headline-lg text-on-surface">
            {user?.displayName || "Traveler"}
          </h1>
          <p className="font-body-md text-body-md text-secondary">
            {user?.email || "No email available"}
          </p>
        </div>
      </section>

      <section className="w-full max-w-[600px] flex flex-col gap-sm">
        <h2 className="font-label-lg text-label-lg text-secondary px-sm uppercase tracking-wider mb-xs">Account</h2>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
          <Link to="/profile/personal" className="flex items-center justify-between p-md hover:bg-surface-container-low transition-colors border-b border-surface-variant">
            <div className="flex items-center gap-md text-on-surface">
               <UserIcon className="w-[20px] h-[20px] text-primary" />
               <span className="font-body-md text-body-md">Personal Information</span>
            </div>
            <span className="text-secondary">&gt;</span>
          </Link>
          <Link to="/profile/billing" className="flex items-center justify-between p-md hover:bg-surface-container-low transition-colors border-b border-surface-variant">
            <div className="flex items-center gap-md text-on-surface">
               <CreditCard className="w-[20px] h-[20px] text-primary" />
               <span className="font-body-md text-body-md">Billing & Payments</span>
            </div>
            <span className="text-secondary">&gt;</span>
          </Link>
          <Link to="/profile/preferences" className="flex items-center justify-between p-md hover:bg-surface-container-low transition-colors">
            <div className="flex items-center gap-md text-on-surface">
               <Settings className="w-[20px] h-[20px] text-primary" />
               <span className="font-body-md text-body-md">Preferences</span>
            </div>
             <span className="text-secondary">&gt;</span>
          </Link>
        </div>
      </section>

      <section className="w-full max-w-[600px] flex flex-col gap-sm mt-md">
        <h2 className="font-label-lg text-label-lg text-secondary px-sm uppercase tracking-wider mb-xs">Settings & Support</h2>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
          <Link to="/profile/notifications" className="flex items-center justify-between p-md hover:bg-surface-container-low transition-colors border-b border-surface-variant">
            <div className="flex items-center gap-md text-on-surface">
               <Bell className="w-[20px] h-[20px] text-secondary" />
               <span className="font-body-md text-body-md">Notifications</span>
            </div>
            <span className="text-secondary">&gt;</span>
          </Link>
          <Link to="/profile/help" className="flex items-center justify-between p-md hover:bg-surface-container-low transition-colors">
            <div className="flex items-center gap-md text-on-surface">
               <HelpCircle className="w-[20px] h-[20px] text-secondary" />
               <span className="font-body-md text-body-md">Help & Support</span>
            </div>
             <span className="text-secondary">&gt;</span>
          </Link>
        </div>
      </section>
      
      <section className="w-full max-w-[600px] mt-xl">
         <button onClick={handleSignOut} className="w-full flex items-center justify-center gap-sm p-md text-error font-label-md text-label-md hover:bg-error-container/20 rounded-xl transition-colors border border-transparent hover:border-error/30">
           <LogOut className="w-5 h-5"/>
           Sign Out
         </button>
      </section>
    </main>
  );
}
