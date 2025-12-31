import React, { useState } from 'react';
import { LogIn, UserPlus, Mail, Lock, User, Phone, Sparkles } from 'lucide-react';
import { API_BASE_URL } from '../api/client';

type AuthMode = 'login' | 'register';

interface SignInProps {
  onSignIn?: (email: string, password: string) => void;
}

export const SignIn: React.FC<SignInProps> = ({ onSignIn }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Registration form state
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Login failed');
      } else {
        setSuccess('Login successful!');
        localStorage.setItem('token', data.token || 'session');
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('user_signed_in', 'true');
        localStorage.setItem('user_email', loginEmail);

        setTimeout(() => {
          if (onSignIn) {
            onSignIn(loginEmail, loginPassword);
          } else {
            window.location.hash = '#/home';
          }
        }, 700);
      }
    } catch (err) {
      setError('Network error. Please check if the server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (registerPassword !== registerConfirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (registerPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: registerName,
          email: registerEmail,
          phone: registerPhone,
          password: registerPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Registration failed');
      } else {
        setSuccess('Registration successful! Please login.');
        setTimeout(() => {
          setMode('login');
          setRegisterName('');
          setRegisterEmail('');
          setRegisterPhone('');
          setRegisterPassword('');
          setRegisterConfirmPassword('');
        }, 1000);
      }
    } catch (err) {
      setError('Network error. Please check if the server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 flex flex-col relative overflow-hidden" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Header */}
      <header className="relative border-b border-white/5 bg-black/30 backdrop-blur-xl sticky top-0 z-10 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-5 flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '-0.02em' }}>
            buyoh<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">.ai</span>
          </h1>
          <a 
            href="#/home" 
            className="text-sm text-white/70 hover:text-white transition-colors duration-200 hover:underline underline-offset-4 font-medium tracking-wide"
          >
            ← Back to Home
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative flex-1 flex items-center justify-center px-6 py-12 sm:py-16">
        <div className="w-full max-w-lg">
          {/* Welcome Section */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500/20 via-cyan-500/20 to-purple-500/20 border border-white/10 mb-8 shadow-2xl backdrop-blur-md">
              <Sparkles className="text-cyan-400" size={42} />
            </div>
            <h2 className="text-5xl sm:text-6xl font-bold text-white mb-4 bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent" style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '-0.02em', lineHeight: '1.1' }}>
              {mode === 'login' ? 'Welcome Back' : 'Join Buyoh'}
            </h2>
            <p className="text-white/70 text-base sm:text-lg max-w-md mx-auto" style={{ lineHeight: '1.6' }}>
              {mode === 'login' 
                ? 'Sign in to access your AI-powered shopping experience' 
                : 'Create your account and unlock the future of retail'}
            </p>
          </div>

          {/* Toggle Buttons */}
          <div className="flex gap-3 mb-7 bg-white/5 backdrop-blur-xl rounded-2xl p-2 border border-white/10 shadow-2xl">
            <button
              onClick={() => {
                setMode('login');
                setError('');
                setSuccess('');
              }}
              className={`flex-1 py-4 px-6 rounded-xl font-semibold text-sm transition-all duration-300 ${
                mode === 'login'
                  ? 'bg-gradient-to-r from-indigo-600 via-cyan-600 to-indigo-600 text-white shadow-xl shadow-cyan-600/40 scale-[1.02]'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center justify-center gap-2.5">
                <LogIn size={18} />
                <span>Login</span>
              </div>
            </button>
            <button
              onClick={() => {
                setMode('register');
                setError('');
                setSuccess('');
              }}
              className={`flex-1 py-4 px-6 rounded-xl font-semibold text-sm transition-all duration-300 ${
                mode === 'register'
                  ? 'bg-gradient-to-r from-indigo-600 via-cyan-600 to-indigo-600 text-white shadow-xl shadow-cyan-600/40 scale-[1.02]'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center justify-center gap-2.5">
                <UserPlus size={18} />
                <span>Register</span>
              </div>
            </button>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-6 p-5 bg-red-500/10 backdrop-blur-xl border border-red-500/30 rounded-2xl text-red-300 text-sm shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></div>
                <span className="font-semibold">{error}</span>
              </div>
            </div>
          )}
          {success && (
            <div className="mb-6 p-5 bg-emerald-500/10 backdrop-blur-xl border border-emerald-500/30 rounded-2xl text-emerald-300 text-sm shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                <span className="font-semibold">{success}</span>
              </div>
            </div>
          )}

          {/* Login Form */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 sm:p-10 border border-white/10 shadow-2xl hover:shadow-cyan-500/10 transition-all duration-500">
              <div className="space-y-6">
                <div>
                  <label className="block text-[11px] font-bold text-cyan-400 uppercase tracking-[0.2em] mb-3.5 flex items-center gap-2.5">
                    <Mail size={15} className="text-indigo-400" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    className="w-full px-6 py-4.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-200 hover:border-white/20 text-[15px] sm:text-base"
                    placeholder="you@example.com"
                    style={{ lineHeight: '1.5' }}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-cyan-400 uppercase tracking-[0.2em] mb-3.5 flex items-center gap-2.5">
                    <Lock size={15} className="text-indigo-400" />
                    Password
                  </label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    className="w-full px-6 py-4.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-200 hover:border-white/20 text-[15px] sm:text-base"
                    placeholder="Enter your password"
                    style={{ lineHeight: '1.5' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4.5 px-7 bg-gradient-to-r from-indigo-600 via-cyan-600 to-indigo-600 hover:from-indigo-500 hover:via-cyan-500 hover:to-indigo-500 text-white font-bold rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-cyan-600/30 hover:shadow-2xl hover:shadow-cyan-600/40 flex items-center justify-center gap-3 text-base"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <LogIn size={20} />
                      <span>Sign In</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Registration Form */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 sm:p-10 border border-white/10 shadow-2xl hover:shadow-cyan-500/10 transition-all duration-500">
              <div className="space-y-6">
                <div>
                  <label className="block text-[11px] font-bold text-cyan-400 uppercase tracking-[0.2em] mb-3.5 flex items-center gap-2.5">
                    <User size={15} className="text-indigo-400" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    required
                    className="w-full px-6 py-4.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-200 hover:border-white/20 text-[15px] sm:text-base"
                    placeholder="John Doe"
                    style={{ lineHeight: '1.5' }}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-cyan-400 uppercase tracking-[0.2em] mb-3.5 flex items-center gap-2.5">
                    <Mail size={15} className="text-indigo-400" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    required
                    className="w-full px-6 py-4.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-200 hover:border-white/20 text-[15px] sm:text-base"
                    placeholder="you@example.com"
                    style={{ lineHeight: '1.5' }}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-cyan-400 uppercase tracking-[0.2em] mb-3.5 flex items-center gap-2.5">
                    <Phone size={15} className="text-indigo-400" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={registerPhone}
                    onChange={(e) => setRegisterPhone(e.target.value)}
                    required
                    className="w-full px-6 py-4.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-200 hover:border-white/20 text-[15px] sm:text-base"
                    placeholder="+1 (555) 000-0000"
                    style={{ lineHeight: '1.5' }}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-cyan-400 uppercase tracking-[0.2em] mb-3.5 flex items-center gap-2.5">
                    <Lock size={15} className="text-indigo-400" />
                    Password
                  </label>
                  <input
                    type="password"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-6 py-4.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-200 hover:border-white/20 text-[15px] sm:text-base"
                    placeholder="Minimum 6 characters"
                    style={{ lineHeight: '1.5' }}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-cyan-400 uppercase tracking-[0.2em] mb-3.5 flex items-center gap-2.5">
                    <Lock size={15} className="text-indigo-400" />
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={registerConfirmPassword}
                    onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-6 py-4.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-200 hover:border-white/20 text-[15px] sm:text-base"
                    placeholder="Confirm your password"
                    style={{ lineHeight: '1.5' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4.5 px-7 bg-gradient-to-r from-indigo-600 via-cyan-600 to-indigo-600 hover:from-indigo-500 hover:via-cyan-500 hover:to-indigo-500 text-white font-bold rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-cyan-600/30 hover:shadow-2xl hover:shadow-cyan-600/40 flex items-center justify-center gap-3 text-base"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Creating account...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus size={20} />
                      <span>Create Account</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Footer */}
          <div className="mt-8 text-center text-white/50 text-sm">
            <p style={{ lineHeight: '1.6' }}>
              By continuing, you agree to Buyoh's{' '}
              <a href="#" className="text-cyan-400 hover:text-cyan-300 transition-colors underline-offset-4 hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-cyan-400 hover:text-cyan-300 transition-colors underline-offset-4 hover:underline">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};