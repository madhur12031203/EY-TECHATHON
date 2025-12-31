import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './tailwind.css';
import './styles.css';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ProductShowcase } from './components/ProductShowcase';
import { Features } from './components/Features';
import { CTA } from './components/CTA';
import { Footer } from './components/Footer';
import BuyohAI from './components/BuyohAI';
import { SignIn } from './components/SignIn';
import FashionCategoryPage from './components/FashionCategoryPage';

type Route = 'signin' | 'home' | 'chat' | 'fashion';

const useRoute = (): Route => {
  const [route, setRoute] = useState<Route>('home');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    const updateRoute = () => {
      try {
        const hash = window.location.hash.replace('#', '');

        if (hash === '/signin') {
          setRoute('signin');
          return;
        }

        if (hash.startsWith('/chat')) {
          setRoute('chat');
          return;
        }

        if (hash.startsWith('/fashion')) {
          setRoute('fashion');
          return;
        }

        // Default to home page so users land on marketing site first
        setRoute('home');
      } catch (error) {
        console.error('Route error:', error);
        setRoute('home');
      }
    };

    // Set initial route
    updateRoute();
    setMounted(true);

    // Listen for hash changes
    window.addEventListener('hashchange', updateRoute);

    return () => {
      window.removeEventListener('hashchange', updateRoute);
    };
  }, []);

  return mounted ? route : 'home';
};

const SignInPage: React.FC = () => {
  const handleSignIn = (email: string, password: string) => {
    try {
      localStorage.setItem('user_signed_in', 'true');
      localStorage.setItem('user_email', email);
      // Trigger route change via hash
      window.location.hash = '#/home';
    } catch (error) {
      console.error('SignIn error:', error);
    }
  };

  return <SignIn onSignIn={handleSignIn} />;
};

const ChatPage: React.FC = () => {
  return <BuyohAI />;
};

const FashionPage: React.FC = () => {
  return <FashionCategoryPage />;
};

const HomePage: React.FC = () => {
  const handleLogout = () => {
    try {
      localStorage.removeItem('user_signed_in');
      localStorage.removeItem('user_email');
      // Trigger route change via hash
      window.location.hash = '#/signin';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <>
      <Header onLogout={handleLogout} />
      <Hero />
      <ProductShowcase />
      <Features />
      <CTA />
      <Footer />
    </>
  );
};

const App: React.FC = () => {
  const route = useRoute();

  switch (route) {
    case 'signin':
      return <SignInPage />;
    case 'chat':
      return <ChatPage />;
    case 'fashion':
      return <FashionPage />;
    case 'home':
    default:
      return <HomePage />;
  }
};

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '40px 20px', 
          textAlign: 'center', 
          color: 'white',
          background: 'linear-gradient(to br, #0f172a, #1e293b)',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div>
            <h1 style={{ fontSize: '28px', marginBottom: '16px', fontWeight: 'bold' }}>
              Something went wrong
            </h1>
            <p style={{ marginBottom: '24px', opacity: 0.8 }}>
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(to right, #6366f1, #06b6d4)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '500'
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Initialize the app
const container = document.getElementById('app');
if (!container) {
  throw new Error('App container not found');
}

const root = createRoot(container);
root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);