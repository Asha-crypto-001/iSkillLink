import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck, Lock, Mail, User, Phone, CheckCircle2,
  AlertCircle, ArrowRight, GraduationCap, BookOpen, MapPin,
  Camera, Upload
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
  const { login, register } = useAuth();
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

        <div className="text-center text-xs font-semibold text-ink-600">
          Sign in securely with your email and password.
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-ink-200 w-full" />
          <span className="bg-white px-2.5 text-[10px] font-bold uppercase tracking-wider text-stone-400 shrink-0">
            Email and password
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
    </div>
  );
};
