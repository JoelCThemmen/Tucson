import { Link } from 'react-router-dom';
import { useUser } from '../hooks/useAuthProvider';
import Navigation from '../components/Navigation';
import { 
  ArrowRightIcon, 
  ChartBarIcon, 
  ShieldCheckIcon, 
  UserGroupIcon,
  BoltIcon,
  CurrencyDollarIcon,
  BuildingLibraryIcon,
  CheckIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';

const features = [
  {
    icon: ChartBarIcon,
    title: 'Advanced Analytics',
    description: 'Real-time market data and sophisticated portfolio analytics at your fingertips.',
    gradient: 'from-blue-500 to-indigo-600',
  },
  {
    icon: ShieldCheckIcon,
    title: 'Bank-Level Security',
    description: 'Your investments protected with enterprise-grade encryption and security protocols.',
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    icon: UserGroupIcon,
    title: 'Exclusive Network',
    description: 'Connect with verified accredited investors and industry professionals.',
    gradient: 'from-purple-500 to-pink-600',
  },
  {
    icon: BoltIcon,
    title: 'Lightning Fast',
    description: 'Execute trades and manage your portfolio with unmatched speed and efficiency.',
    gradient: 'from-amber-500 to-orange-600',
  },
];

const stats = [
  { value: '$2.4B+', label: 'Assets Under Management' },
  { value: '50K+', label: 'Active Investors' },
  { value: '99.9%', label: 'Platform Uptime' },
  { value: '4.9/5', label: 'User Rating' },
];

const testimonials = [
  {
    content: "Tucson has transformed how I manage my investment portfolio. The insights and network are invaluable.",
    author: "Sarah Chen",
    role: "Angel Investor",
    rating: 5,
  },
  {
    content: "The platform's sophisticated tools and exclusive opportunities have significantly improved my returns.",
    author: "Michael Rodriguez",
    role: "Portfolio Manager",
    rating: 5,
  },
  {
    content: "Finally, a platform that understands the needs of serious investors. Exceptional experience.",
    author: "Jennifer Park",
    role: "Real Estate Developer",
    rating: 5,
  },
];

export default function LandingPage() {
  const { isSignedIn, isLoaded } = useUser() || { isSignedIn: false, isLoaded: true };
  const [scrollY, setScrollY] = useState(0);
  
  const showCTA = isLoaded && !isSignedIn;

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 to-white">
      <Navigation />

      {/* Hero Section */}
      <section className="relative h-screen mt-16 overflow-hidden">
        {/* Background Image with Parallax */}
        <div 
          className="absolute inset-0"
          style={{ transform: `translateY(${scrollY * 0.5}px)` }}
        >
          <img
            className="h-full w-full object-cover"
            src="/tucson-cityscape.jpg"
            alt="Tucson Arizona cityscape with mountains in background"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement!.classList.add('bg-gradient-to-br', 'from-primary-900', 'via-primary-800', 'to-primary-700');
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/90 via-neutral-950/60 to-neutral-950/30" />
        </div>

        {/* Hero Content */}
        <div className="relative h-full flex items-center">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="max-w-3xl mx-auto animate-fade-up">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/90 dark:bg-gray-800/10 backdrop-blur-sm border border-white/30 dark:border-white/20 mb-6 shadow-lg">
                <span className="text-xs font-medium text-gray-900 dark:text-white/90">🎯 Exclusive Access for Accredited Investors</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                Invest in Your
                <span className="block text-gradient bg-gradient-to-r from-accent-400 to-accent-500 bg-clip-text text-transparent">
                  Future Today
                </span>
              </h1>
              
              <p className="text-xl text-neutral-200 mb-8 leading-relaxed">
                Join Arizona's premier investment platform. Access exclusive opportunities,
                connect with sophisticated investors, and build wealth with confidence.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                {showCTA && (
                  <>
                    <Link
                      to="/sign-up"
                      className="group inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 shadow-xl transition-all hover:shadow-2xl"
                    >
                      Start Investing Today
                      <ArrowRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link
                      to="/learn-more"
                      className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-white dark:bg-gray-800/10 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white dark:bg-gray-800/20 transition-all"
                    >
                      Watch Demo
                    </Link>
                  </>
                )}
              </div>

              {/* Trust Indicators */}
              <div className="mt-12 flex items-center gap-8">
                <div className="flex items-center gap-2">
                  <ShieldCheckIcon className="h-5 w-5 text-success-400" />
                  <span className="text-sm text-neutral-300">SEC Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <BuildingLibraryIcon className="h-5 w-5 text-success-400" />
                  <span className="text-sm text-neutral-300">FDIC Insured</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white dark:bg-gray-800/50 rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="text-center animate-fade-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-3xl md:text-4xl font-bold text-gradient bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="mt-2 text-sm text-gray-700 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-b from-white to-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Everything You Need to
              <span className="block text-gradient bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                Succeed
              </span>
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Professional tools and exclusive opportunities designed for sophisticated investors
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.gradient} mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-700">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Trusted by Industry Leaders
            </h2>
            <p className="text-xl text-gray-700">
              Join thousands of successful investors on our platform
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-gray-50 to-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-all"
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="h-5 w-5 text-accent-500 fill-current" />
                  ))}
                </div>
                <p className="text-gray-800 mb-6 italic">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full mr-4" />
                  <div>
                    <div className="font-semibold text-gray-900">
                      {testimonial.author}
                    </div>
                    <div className="text-sm text-gray-700">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-primary-900 to-primary-800">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Start Your Investment Journey?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of successful investors building wealth on our platform.
          </p>
          {showCTA && (
            <Link
              to="/sign-up"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-primary-900 bg-white dark:bg-gray-800 rounded-xl hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-900 shadow-xl transition-all hover:shadow-2xl"
            >
              Get Started - It's Free
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-950 text-gray-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Tucson</h3>
              <p className="text-sm">
                Arizona's premier investment platform for accredited investors.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link to="/security" className="hover:text-white transition-colors">Security</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link to="/careers" className="hover:text-white transition-colors">Careers</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
                <li><Link to="/terms" className="hover:text-white transition-colors">Terms</Link></li>
                <li><Link to="/compliance" className="hover:text-white transition-colors">Compliance</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-neutral-800 pt-8 text-center text-sm">
            <p>© 2025 Tucson Investment Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}