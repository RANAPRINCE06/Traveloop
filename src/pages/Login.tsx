import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, ArrowRight, UserPlus } from "lucide-react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Authentication failed.");
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Google authentication failed.");
    }
  };

  return (
    <div className="page-shell min-h-screen flex items-center justify-center px-margin-mobile py-12">
      <main className="glass-panel w-full max-w-[450px] p-8 sm:p-10">
        <div className="text-center mb-10">
          <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">Traveloop</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-3">A premium travel gateway for curated trips and seamless planning.</p>
        </div>

        {error && (
          <div className="mb-md p-sm bg-error-container text-on-error-container border border-error/20 rounded-lg font-body-sm text-body-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-lg">
          <div className="space-y-sm">
            <label htmlFor="email" className="block font-label-md text-label-md text-on-surface">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-sm top-1/2 -translate-y-1/2 w-6 h-6 text-outline-variant" />
              <input
                type="email"
                id="email"
                name="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-xl pr-sm py-sm bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-fixed-dim transition-colors"
               />
            </div>
          </div>

          <div className="space-y-sm">
            <div className="flex justify-between items-center">
              <label htmlFor="password" className="block font-label-md text-label-md text-on-surface">Password</label>
              {!isSignUp && <a href="#" className="font-label-md text-label-md text-primary hover:text-primary-container transition-colors">Forgot password?</a>}
            </div>
            <div className="relative">
              <Lock className="absolute left-sm top-1/2 -translate-y-1/2 w-6 h-6 text-outline-variant" />
              <input
                type="password"
                id="password"
                name="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-xl pr-sm py-sm bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-fixed-dim transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            className="premium-button w-full justify-center gap-2"
          >
            {isSignUp ? "Sign Up" : "Login"}
            {isSignUp ? <UserPlus className="w-[18px] h-[18px]" /> : <ArrowRight className="w-[18px] h-[18px]" />}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between">
          <span className="w-1/5 border-b border-outline-variant lg:w-1/4"></span>
          <span className="text-xs text-center text-outline font-label-md uppercase">or login with</span>
          <span className="w-1/5 border-b border-outline-variant lg:w-1/4"></span>
        </div>

        <button
          onClick={handleGoogleSignIn}
          type="button"
          className="mt-4 w-full flex items-center justify-center gap-2 py-md premium-button-secondary"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google
        </button>

        <div className="mt-lg text-center border-t border-outline-variant pt-lg">
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button 
              onClick={() => { setIsSignUp(!isSignUp); setError(null); }} 
              className="font-label-md text-label-md text-primary hover:text-primary-container ml-xs transition-colors bg-transparent border-none p-0 cursor-pointer"
            >
              {isSignUp ? "Login instead" : "Sign up"}
            </button>
          </p>
        </div>
      </main>
    </div>
  );
}
