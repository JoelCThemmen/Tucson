import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import { ThemeProvider } from './contexts/ThemeContext';
import MainLayout from './layouts/MainLayout';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import VerificationWizard from './components/VerificationWizard';
import VerificationSuccess from './pages/VerificationSuccess';
import VerificationStatus from './pages/VerificationStatus';
import AdminDashboard from './pages/AdminDashboard';
import ActivateAccount from './pages/ActivateAccount';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import TestProfile from './pages/TestProfile';
import Welcome from './pages/Welcome';
import Portfolio from './pages/Portfolio';
import Markets from './pages/Markets';
import Network from './pages/Network';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
  throw new Error('Missing Clerk Publishable Key');
}

function App() {
  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <ThemeProvider>
        <Router>
          <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/sign-in/*" element={<SignInPage />} />
          <Route path="/sign-up/*" element={<SignUpPage />} />
          <Route path="/activate" element={<ActivateAccount />} />
          <Route path="/welcome" element={<Welcome />} />
          
          {/* Protected routes */}
          <Route
            path="/app"
            element={
              <>
                <SignedIn>
                  <MainLayout />
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
              </>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
            <Route path="test-profile" element={<TestProfile />} />
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="portfolio" element={<Portfolio />} />
            <Route path="markets" element={<Markets />} />
            <Route path="network" element={<Network />} />
          </Route>
          
          {/* Verification routes - protected */}
          <Route
            path="/verification"
            element={
              <>
                <SignedIn>
                  <VerificationWizard />
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
              </>
            }
          />
          <Route
            path="/verification/success"
            element={
              <>
                <SignedIn>
                  <VerificationSuccess />
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
              </>
            }
          />
          <Route
            path="/verification/status"
            element={
              <>
                <SignedIn>
                  <VerificationStatus />
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
              </>
            }
          />
          
          {/* Redirect /app to dashboard */}
          <Route path="/app" element={<Navigate to="/app" replace />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </ClerkProvider>
  );
}

export default App;