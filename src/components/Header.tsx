import React from 'react';
import { LogOut } from 'lucide-react';

interface HeaderProps {
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onLogout }) => {
  const isBrowser = typeof window !== 'undefined';
  const isLoggedIn = isBrowser && localStorage.getItem('user_signed_in');
  const user = isBrowser ? localStorage.getItem('user') : null;
  const userObj = user ? (() => { try { return JSON.parse(user); } catch { return null; } })() : null;
  const displayName = userObj?.name || userObj?.email || (isBrowser ? localStorage.getItem('user_email') : '') || 'User';
  const initial = displayName?.trim()?.charAt(0)?.toUpperCase() || 'U';

  return (
    <header className="header">
      <nav className="navbar">
        <div className="container">
          <div className="nav-brand">
            <h1 className="logo">Buyoh</h1>
          </div>
          <ul className="nav-menu">
            <li><a href="#/home" className="nav-link">Home</a></li>
            <li><a href="#products" className="nav-link">Products</a></li>
            <li><a href="#features" className="nav-link">Features</a></li>
            <li><a href="#contact" className="nav-link">Contact</a></li>
            <li><a href="#/chat" className="nav-link">Chat with AI</a></li>
          </ul>
          <div className="nav-actions">
            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 text-white flex items-center justify-center font-bold shadow-md">
                  {initial}
                </div>
                <button 
                  onClick={onLogout}
                  className="btn-primary flex items-center gap-2"
                  title="Logout"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            ) : (
              <a href="#/signin" className="btn-primary">
                Sign In
              </a>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};