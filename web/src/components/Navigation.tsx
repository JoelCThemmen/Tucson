import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUser, UserButton, SignInButton, SignUpButton } from '../hooks/useAuthProvider';
import { useUserProfile } from '../hooks/useUserProfile';
import {
  HomeIcon,
  ChartBarIcon,
  UserIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  Bars3Icon,
  XMarkIcon,
  BriefcaseIcon,
  ArrowTrendingUpIcon,
  ShieldCheckIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

const navigation = [
  { name: 'Home', href: '/', icon: HomeIcon },
  { name: 'Dashboard', href: '/app', icon: ChartBarIcon, requiresAuth: true },
  { name: 'Verification', href: '/verification/status', icon: ShieldCheckIcon, requiresAuth: true },
  { name: 'Portfolio', href: '/app/portfolio', icon: BriefcaseIcon, requiresAuth: true },
  { name: 'Markets', href: '/app/markets', icon: ArrowTrendingUpIcon, requiresAuth: true },
  { name: 'Network', href: '/app/network', icon: UserGroupIcon, requiresAuth: true },
];

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { isSignedIn, isLoaded } = useUser();
  const { isAdmin, profile, loading: profileLoading } = useUserProfile();

  // Debug logging
  useEffect(() => {
    console.log('[Navigation] State:', {
      isSignedIn,
      isLoaded,
      isAdmin,
      profileLoading,
      profile: profile ? { email: profile.email, role: profile.role } : null,
    });
  }, [isSignedIn, isLoaded, isAdmin, profile, profileLoading]);

  const visibleNavItems = navigation.filter(
    item => !item.requiresAuth || (item.requiresAuth && isSignedIn)
  );

  // Add admin navigation item if user is admin
  const adminNavItem = { 
    name: 'Admin', 
    href: '/app/admin', 
    icon: Cog6ToothIcon, 
    requiresAuth: true 
  };
  
  // Only show admin nav if profile is loaded and user is admin
  const finalNavItems = !profileLoading && isAdmin && isSignedIn 
    ? [...visibleNavItems, adminNavItem]
    : visibleNavItems;

  console.log('[Navigation] Admin check:', {
    profileLoading,
    isAdmin,
    isSignedIn,
    showingAdmin: !profileLoading && isAdmin && isSignedIn,
    finalNavItemsCount: finalNavItems.length,
    hasAdminItem: finalNavItems.some(item => item.name === 'Admin')
  });

  return (
    <nav className="fixed w-full top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200/20 dark:border-gray-700/20 shadow-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          {/* Logo and Desktop Navigation */}
          <div className="flex items-center">
            <div className="flex flex-shrink-0 items-center">
              <Link 
                to="/" 
                className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-400 dark:to-primary-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
              >
                Tucson
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:ml-10 md:flex md:space-x-1">
              {finalNavItems.map((item) => {
                // Special handling for Dashboard (/app) to only match exact /app path
                const isActive = item.href === '/app' 
                  ? location.pathname === '/app'
                  : location.pathname === item.href || 
                    (item.href !== '/' && location.pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={clsx(
                      'group relative flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                      isActive
                        ? 'text-primary-900 dark:text-white bg-primary-50 dark:bg-primary-900/20'
                        : 'text-gray-900 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700/50'
                    )}
                  >
                    <item.icon className={clsx(
                      'mr-2 h-4 w-4 transition-colors',
                      isActive ? 'text-primary-600' : 'text-gray-800 dark:text-gray-500 group-hover:text-gray-900 dark:group-hover:text-gray-300'
                    )} />
                    {item.name}
                    {isActive && (
                      <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-primary-500 to-primary-700 rounded-full" />
                    )}
                    {!isActive && (
                      <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-gray-300 dark:bg-gray-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-full" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {isLoaded && (
              <>
                {isSignedIn ? (
                  <div className="flex items-center space-x-3">
                    <Link
                      to="/app/profile"
                      className={clsx(
                        "relative flex items-center px-3 py-1.5 text-sm font-medium rounded-lg transition-all",
                        location.pathname === '/app/profile'
                          ? 'text-primary-900 dark:text-white'
                          : 'text-gray-800 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700/50'
                      )}
                    >
                      <UserIcon className={clsx(
                        "mr-2 h-4 w-4",
                        location.pathname === '/app/profile' ? 'text-primary-600' : 'text-gray-800 dark:text-gray-500'
                      )} />
                      Profile
                      {location.pathname === '/app/profile' && (
                        <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-gradient-to-r from-primary-500 to-primary-700 rounded-full" />
                      )}
                    </Link>
                    <Link
                      to="/app/settings"
                      className={clsx(
                        "relative flex items-center px-3 py-1.5 text-sm font-medium rounded-lg transition-all",
                        location.pathname === '/app/settings'
                          ? 'text-primary-900 dark:text-white'
                          : 'text-gray-800 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700/50'
                      )}
                    >
                      <Cog6ToothIcon className={clsx(
                        "mr-2 h-4 w-4",
                        location.pathname === '/app/settings' ? 'text-primary-600' : 'text-gray-800 dark:text-gray-500'
                      )} />
                      Settings
                      {location.pathname === '/app/settings' && (
                        <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-gradient-to-r from-primary-500 to-primary-700 rounded-full" />
                      )}
                    </Link>
                    <div className="h-6 w-px bg-gray-400 dark:bg-gray-600" />
                    <UserButton 
                      afterSignOutUrl="/"
                      appearance={{
                        elements: {
                          avatarBox: "w-9 h-9 hover:opacity-80 transition-opacity"
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <SignInButton mode="modal">
                      <button className="px-4 py-2 text-sm font-medium text-gray-800 hover:text-gray-900 transition-colors">
                        Sign In
                      </button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <button className="relative inline-flex items-center justify-center px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 shadow-md transition-all hover:shadow-lg group">
                        <span className="relative">Get Started</span>
                        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary-400 to-primary-600 opacity-0 group-hover:opacity-20 transition-opacity" />
                      </button>
                    </SignUpButton>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-lg shadow-md p-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 transition-all"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden transition-all duration-300 ease-in-out">
          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-t border-gray-400 dark:border-gray-700">
          <div className="space-y-1 px-4 pb-3 pt-2">
            {finalNavItems.map((item) => {
              // Special handling for Dashboard (/app) to only match exact /app path
              const isActive = item.href === '/app' 
                ? location.pathname === '/app'
                : location.pathname === item.href || 
                  (item.href !== '/' && location.pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={clsx(
                    'flex items-center rounded-lg px-3 py-2.5 text-base font-medium transition-all',
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-900 dark:text-white'
                      : 'text-gray-900 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className={clsx(
                    'mr-3 h-5 w-5',
                    isActive ? 'text-primary-600' : 'text-gray-800 dark:text-gray-500'
                  )} />
                  {item.name}
                </Link>
              );
            })}
          </div>
          
          {/* Mobile Auth Section */}
          <div className="border-t border-gray-400 dark:border-gray-700 px-4 pb-3 pt-4">
            {isLoaded && (
              <>
                {isSignedIn ? (
                  <div className="space-y-2">
                    <Link
                      to="/app/profile"
                      className="flex items-center px-3 py-2 text-base font-medium text-gray-800 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-all"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <UserIcon className="mr-3 h-5 w-5 text-gray-800 dark:text-gray-500" />
                      Profile
                    </Link>
                    <Link
                      to="/app/settings"
                      className="flex items-center px-3 py-2 text-base font-medium text-gray-800 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-all"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Cog6ToothIcon className="mr-3 h-5 w-5 text-gray-800 dark:text-gray-500" />
                      Settings
                    </Link>
                    <div className="flex justify-end pt-2">
                      <UserButton afterSignOutUrl="/" />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <SignInButton mode="modal">
                      <button className="block w-full rounded-lg px-3 py-2 text-left text-base font-medium text-gray-800 hover:bg-gray-100 hover:text-gray-900 transition-all">
                        Sign In
                      </button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <button className="block w-full rounded-lg bg-gradient-to-r from-primary-600 to-primary-700 px-3 py-2 text-center text-base font-medium text-white hover:from-primary-700 hover:to-primary-800 transition-all">
                        Get Started
                      </button>
                    </SignUpButton>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      )}
    </nav>
  );
}