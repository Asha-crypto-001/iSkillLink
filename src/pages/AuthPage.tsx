import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck, Lock, Mail, User, Phone, CheckCircle2,
  AlertCircle, ArrowRight, GraduationCap, BookOpen, MapPin,
  Camera, Upload, X
} from 'lucide-react';
import { Field } from '../components/ui/Field';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import logoUrl from '../assets/logo.png';

interface AuthPageProps {
  onSuccess: (role: string) => void;
  defaultMode?: 'login' | 'register';
}

export const AuthPage: React.FC<AuthPageProps> = ({
  onSuccess,
  defaultMode = 'login'
}) => {
  const { login, register, loginWithGoogle } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);
  const [role, setRole] = useState<'learner' | 'educator'>('learner');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('+256 ');
  const [location, setLocation] = useState('Mbarara City');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleCustomEmail, setGoogleCustomEmail] = useState('');
  const [googleCustomName, setGoogleCustomName] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = Math.min(img.width, img.height);
        const startX = (img.width - size) / 2;
        const startY = (img.height - size) / 2;
        const targetDim = 320;
        canvas.width = targetDim;
        canvas.height = targetDim;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, startX, startY, size, size, 0, 0, targetDim, targetDim);
          setAvatarUrl(canvas.toDataURL('image/jpeg', 0.85));
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleGoogleSignIn = async (gEmail: string, gName: string) => {
    setIsLoading(true);
    setErrorMsg('');
    setShowGoogleModal(false);
    try {
      const loggedInUser = await loginWithGoogle({
        email: gEmail,
        name: gName,
        role: role
      });
      onSuccess(loggedInUser.role);
    } catch (err: any) {
      setErrorMsg(err.message || 'Google sign-in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    if (mode === 'register' && password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      setIsLoading(false);
      return;
    }

    try {
      if (mode === 'login') {
        const loggedInUser = await login(email, password);
        onSuccess(loggedInUser.role);
      } else {
        const newUser = await register({
          name,
          email,
          password,
          role,
          phone,
          location,
          avatar_url: avatarUrl || undefined
        });
        onSuccess(newUser.role);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 bg-white rounded-card shadow-level-1 border border-ink-200/90 p-2.5 mx-auto flex items-center justify-center">
          <img
            src={logoUrl}
            alt="iSkillLink Logo"
            className="w-full h-full object-contain rounded-card"
          />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-ink-900 tracking-tight">
            {mode === 'login' ? 'Sign In to iSkillLink' : 'Create an Account'}
          </h1>
          <p className="text-xs text-ink-500 mt-0.5">
            Where Skills Meet Opportunity • Mbarara, Uganda
          </p>
        </div>
      </div>

      {/* Main Auth Card */}
      <div className="bg-white p-6 sm:p-8 rounded-card border border-ink-200 shadow-level-1 space-y-5">
        {/* Mode Toggle */}
        <div className="flex p-1 bg-ink-50 rounded-card text-xs font-bold">
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMsg(''); }}
            className={`flex-1 py-2 rounded-lg transition ${
              mode === 'login' ? 'bg-white text-ink-900 shadow-level-1' : 'text-ink-500 hover:text-ink-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setErrorMsg(''); }}
            className={`flex-1 py-2 rounded-lg transition ${
              mode === 'register' ? 'bg-white text-ink-900 shadow-level-1' : 'text-ink-500 hover:text-ink-900'
            }`}
          >
            Create New Account
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Official Google Sign-In Button */}
        <button
          type="button"
          onClick={() => setShowGoogleModal(true)}
          disabled={isLoading}
          className="w-full py-2.5 px-4 rounded-card border border-ink-200 bg-white hover:bg-ink-50 text-ink-800 font-semibold text-xs transition shadow-xs flex items-center justify-center gap-2.5 group cursor-pointer"
        >
          {/* Multi-Color Google G SVG */}
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-ink-200 w-full" />
          <span className="bg-white px-2.5 text-[10px] font-bold uppercase tracking-wider text-stone-400 shrink-0">
            Or with email
          </span>
          <div className="border-t border-ink-200 w-full" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {mode === 'register' && (
            <>
              {/* Role Picker */}
              <div>
                <label className="block font-semibold text-ink-700 mb-1.5">Account Role:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('learner')}
                    className={`p-3 rounded-card border flex flex-col items-center gap-1 transition ${
                      role === 'learner'
                        ? 'bg-forest-50 border-forest-600 text-emerald-950 font-bold'
                        : 'border-ink-200 text-ink-600 hover:bg-ink-50'
                    }`}
                  >
                    <BookOpen className="w-4 h-4 text-forest-700" />
                    <span>Student / Learner</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('educator')}
                    className={`p-3 rounded-card border flex flex-col items-center gap-1 transition ${
                      role === 'educator'
                        ? 'bg-forest-50 border-forest-600 text-emerald-950 font-bold'
                        : 'border-ink-200 text-ink-600 hover:bg-ink-50'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4 text-forest-700" />
                    <span>Educator / Artisan</span>
                  </button>
                </div>
              </div>

              {/* Profile Photo (Optional) */}
              <div>
                <label className="block font-semibold text-ink-700 mb-1">Profile Photo (Optional)</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-card overflow-hidden bg-ink-50 border border-ink-200 flex items-center justify-center shrink-0">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-6 h-6 text-ink-400" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-2 rounded-lg border border-ink-200 bg-white hover:bg-ink-50 text-ink-700 font-semibold text-[11px] flex items-center gap-1.5"
                  >
                    <Camera className="w-3.5 h-3.5 text-forest-700" />
                    <span>{avatarUrl ? 'Change Photo' : 'Upload Photo'}</span>
                  </button>
                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={() => setAvatarUrl('')}
                      className="text-ink-400 hover:text-rose-600 text-[11px]"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              <Field label="Full Name" htmlFor="auth-name" required>
                <Input
                  id="auth-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Your Full Name"
                  leftIcon={<User className="w-4 h-4" />}
                  required
                />
              </Field>

              <Field label="Mobile Phone Number" htmlFor="auth-phone" required>
                <Input
                  id="auth-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+256 70X XXX XXX"
                  leftIcon={<Phone className="w-4 h-4" />}
                  required
                />
              </Field>

              <Field label="Location / Division" htmlFor="auth-location" required>
                <Input
                  id="auth-location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Mbarara City, Kakoba, Kampala..."
                  leftIcon={<MapPin className="w-4 h-4" />}
                  required
                />
              </Field>
            </>
          )}

          <Field label="Email Address" htmlFor="auth-email" required>
            <Input
              id="auth-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />
          </Field>

          <Field label="Password" htmlFor="auth-password" required>
            <Input
              id="auth-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />
          </Field>

          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isLoading}
            rightIcon={<ArrowRight className="w-4 h-4" />}
            className="w-full"
          >
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </Button>
        </form>

        <div className="pt-3 border-t border-ink-100 text-center text-xs text-ink-500">
          Protected by iSkillLink Security • Headquartered in Mbarara City
        </div>
      </div>

      {/* Google Sign-In Selector Modal */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-card max-w-sm w-full p-6 shadow-level-3 border border-ink-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <h3 className="font-bold text-ink-900 text-sm">Sign in with Google</h3>
              </div>
              <button
                onClick={() => setShowGoogleModal(false)}
                className="text-stone-400 hover:text-ink-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-ink-600">
              Choose your Google account to continue to <strong>iSkillLink Uganda</strong>:
            </p>

            <div className="space-y-2">
              <button
                onClick={() => handleGoogleSignIn('ashabahebwahassan665@gmail.com', 'Ashabahebwa Hassan')}
                className="w-full p-3 rounded-card border border-ink-200 hover:bg-ink-50 text-left flex items-center gap-3 transition"
              >
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80"
                  alt="Ashabahebwa Hassan"
                  className="w-9 h-9 rounded-full object-cover border border-ink-200"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-ink-900 truncate">Ashabahebwa Hassan (Admin)</div>
                  <div className="text-[11px] text-ink-500 truncate">ashabahebwahassan665@gmail.com</div>
                </div>
              </button>

              <button
                onClick={() => handleGoogleSignIn('iskilllink0@gmail.com', 'iSkillLink Official')}
                className="w-full p-3 rounded-card border border-ink-200 hover:bg-ink-50 text-left flex items-center gap-3 transition"
              >
                <div className="w-9 h-9 rounded-full bg-forest-700 text-white flex items-center justify-center font-bold text-xs">
                  iS
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-ink-900 truncate">iSkillLink Inquiries</div>
                  <div className="text-[11px] text-ink-500 truncate">iskilllink0@gmail.com</div>
                </div>
              </button>
            </div>

            <div className="pt-2 border-t border-stone-100">
              <label className="block text-[11px] font-semibold text-ink-700 mb-1">
                Or enter another Google account:
              </label>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Your Name (e.g. Brian Tumusiime)"
                  value={googleCustomName}
                  onChange={(e) => setGoogleCustomName(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-ink-200 focus:outline-none focus:ring-1 focus:ring-forest-700 bg-ink-50"
                />
                <input
                  type="email"
                  placeholder="name@gmail.com"
                  value={googleCustomEmail}
                  onChange={(e) => setGoogleCustomEmail(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-ink-200 focus:outline-none focus:ring-1 focus:ring-forest-700 bg-ink-50"
                />
                <button
                  type="button"
                  disabled={!googleCustomEmail || !googleCustomName}
                  onClick={() => handleGoogleSignIn(googleCustomEmail, googleCustomName)}
                  className="w-full py-2 bg-forest-700 hover:bg-forest-800 disabled:opacity-40 text-white text-xs font-bold rounded-lg transition"
                >
                  Continue as {googleCustomName || 'New User'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
