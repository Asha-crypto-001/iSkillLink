import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { Button } from './ui/Button';

interface SignInPromptProps {
  title: string;
  description: string;
  /** Where to return after signing in or creating an account. */
  next: string;
  onClose: () => void;
}

/** Asks a signed-out visitor to sign in before they fill in a form that needs an account. */
export const SignInPrompt: React.FC<SignInPromptProps> = ({ title, description, next, onClose }) => {
  const navigate = useNavigate();
  const go = (mode: 'login' | 'register') => {
    onClose();
    const params = new URLSearchParams({ next });
    if (mode === 'register') params.set('mode', 'register');
    navigate(`/auth?${params.toString()}`);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 sm:p-8 text-center space-y-5">
      <span className="mx-auto w-12 h-12 rounded-full bg-forest-50 text-forest-700 flex items-center justify-center" aria-hidden="true">
        <LogIn className="w-6 h-6" />
      </span>
      <div className="space-y-1.5 max-w-sm mx-auto">
        <h3 className="text-lg font-bold text-ink-900 font-display">{title}</h3>
        <p className="text-sm text-ink-600 leading-relaxed">{description}</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-2 justify-center">
        <Button variant="primary" onClick={() => go('login')}>Sign in</Button>
        <Button variant="outline" onClick={() => go('register')}>Create a free account</Button>
      </div>
    </div>
  );
};

export default SignInPrompt;
