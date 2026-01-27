import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  PieChart,
  Wallet,
  TrendingUp,
  FileSpreadsheet,
  ArrowRight,
  Check,
  Globe,
  BarChart3,
  Users,
} from "lucide-react";

const LandingPage = () => {
  const features = [
    {
      icon: <PieChart className="w-6 h-6" />,
      title: "Smart Categories",
      description:
        "Multi-level categories tailored to your profile - salaried, self-employed, or business owner.",
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "40+ Currencies",
      description:
        "Track expenses in any currency with real-time conversion rates worldwide.",
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Visual Reports",
      description:
        "Beautiful charts and trends to understand your spending patterns at a glance.",
    },
    {
      icon: <FileSpreadsheet className="w-6 h-6" />,
      title: "CSV Import/Export",
      description:
        "Seamlessly import your data or export detailed reports for accounting.",
    },
  ];

  const profileTypes = [
    {
      title: "Salaried",
      description: "Track personal expenses, utilities, groceries, and entertainment",
      icon: <Wallet className="w-8 h-8" />,
    },
    {
      title: "Self-Employed",
      description: "Manage business operations, client meetings, and tax-deductible expenses",
      icon: <TrendingUp className="w-8 h-8" />,
    },
    {
      title: "Business Owner",
      description: "Monitor operations, payroll, inventory, and multi-department spending",
      icon: <Users className="w-8 h-8" />,
    },
  ];

  return (
    <div className="min-h-screen bg-white" data-testid="landing-page">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#064E3B] rounded-lg flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">ExpenseTrack</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button
                variant="ghost"
                className="text-[#4B5563] hover:text-[#064E3B]"
                data-testid="nav-login-btn"
              >
                Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button
                className="bg-[#064E3B] hover:bg-[#064E3B]/90 rounded-full px-6"
                data-testid="nav-register-btn"
              >
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-[#F3F4F6] via-white to-[#D9F99D]/20">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <p className="text-xs uppercase tracking-widest font-semibold text-[#064E3B] mb-4">
                Smart Expense Management
              </p>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none mb-6">
                Take Control of Your
                <span className="text-[#064E3B]"> Finances</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-lg">
                Track expenses, manage categories, and gain insights with powerful analytics.
                Built for individuals and businesses alike.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register">
                  <Button
                    size="lg"
                    className="bg-[#064E3B] hover:bg-[#064E3B]/90 rounded-full px-8 py-6 text-base font-bold shadow-[0_4px_14px_0_rgba(6,78,59,0.39)] hover:shadow-[0_6px_20px_rgba(6,78,59,0.23)] hover:-translate-y-0.5 transition-all"
                    data-testid="hero-cta-btn"
                  >
                    Start Free <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full px-8 py-6 text-base font-medium border-2 border-[#E5E7EB] hover:bg-[#F3F4F6]"
                >
                  Watch Demo
                </Button>
              </div>
            </div>
            <div className="relative animate-fade-in stagger-2">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1759668358583-09cdcae2ba36?crop=entropy&cs=srgb&fm=jpg&q=85&w=800"
                  alt="Dashboard preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl p-4 shadow-lg border border-[#E5E7EB]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#D9F99D] rounded-full flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-[#064E3B]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Monthly Savings</p>
                    <p className="text-xl font-bold text-[#064E3B]">+23.5%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-[#F9FAFB]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-widest font-semibold text-[#064E3B] mb-4">
              Features
            </p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
              Everything You Need
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Powerful tools to manage, track, and analyze your expenses with precision.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="rounded-2xl border border-[#E5E7EB] bg-white p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                data-testid={`feature-card-${index}`}
              >
                <div className="w-12 h-12 bg-[#D9F99D] rounded-xl flex items-center justify-center text-[#064E3B] mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Profile Types Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-widest font-semibold text-[#064E3B] mb-4">
              Tailored For You
            </p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
              Choose Your Profile
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Get pre-configured categories based on your financial needs.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {profileTypes.map((profile, index) => (
              <div
                key={index}
                className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-8 hover:bg-white transition-colors text-center"
                data-testid={`profile-card-${index}`}
              >
                <div className="w-16 h-16 bg-[#064E3B] rounded-2xl flex items-center justify-center text-white mx-auto mb-6">
                  {profile.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3">{profile.title}</h3>
                <p className="text-muted-foreground">{profile.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-[#064E3B]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-6">
            Start Tracking Today
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of users who have taken control of their finances with ExpenseTrack.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button
                size="lg"
                className="bg-[#D9F99D] text-[#064E3B] hover:bg-[#D9F99D]/90 rounded-full px-8 py-6 text-base font-bold"
                data-testid="cta-register-btn"
              >
                Create Free Account
              </Button>
            </Link>
          </div>
          <div className="flex items-center justify-center gap-8 mt-8 text-white/70 text-sm">
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4" /> Free to start
            </span>
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4" /> Multilevel Catogory
            </span>
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4" /> Track Monthly Expenses
            </span>
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4" /> Import & Export CSV
            </span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#064E3B] rounded-lg flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">ExpenseTrack</span>
          </div>
          <p className="text-muted-foreground text-sm">
            © 2026 ExpenseTracker. All rights reserved. 
            Developed by <a href="https://github.com/shreekunjvaria">@shreekunjvaria</a>.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
