import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { toast } from "sonner";
import { Wallet, Mail, Lock, User, ArrowRight, Briefcase } from "lucide-react";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const CURRENCIES = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
];

const RegisterPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    profile_type: "salaried",
    preferred_currency: "INR",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Registration failed");
      }

      toast.success("Account created successfully!");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" data-testid="register-page">
      {/* Left Side - Image */}
      <div className="hidden lg:block w-1/2 bg-[#064E3B] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#064E3B] to-[#064E3B]/80"></div>
        <img
          src="https://images.unsplash.com/photo-1758608631036-7a2370684905?crop=entropy&cs=srgb&fm=jpg&q=85&w=800"
          alt="Finance"
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-30"
        />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-center text-white">
            <h2 className="text-4xl font-black tracking-tight mb-4">
              Smart Expense Management
            </h2>
            <p className="text-white/80 text-lg max-w-md">
              Get pre-configured categories based on your profile type and start
              tracking immediately.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-16 lg:px-24 py-12">
        <Link to="/" className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-[#064E3B] rounded-lg flex items-center justify-center">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight">ExpenseTrack</span>
        </Link>

        <div className="max-w-sm">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">
            Create Account
          </h1>
          <p className="text-muted-foreground mb-6">
            Start your journey to financial clarity
          </p>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-sm font-medium">
                Full Name
              </Label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  className="pl-10 h-12 rounded-lg border-2 border-[#E5E7EB] bg-[#F9FAFB] focus:border-[#064E3B]"
                  required
                  data-testid="name-input"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 h-12 rounded-lg border-2 border-[#E5E7EB] bg-[#F9FAFB] focus:border-[#064E3B]"
                  required
                  data-testid="email-input"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 h-12 rounded-lg border-2 border-[#E5E7EB] bg-[#F9FAFB] focus:border-[#064E3B]"
                  required
                  minLength={6}
                  data-testid="password-input"
                />
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Profile Type</Label>
              <Select
                value={formData.profile_type}
                onValueChange={(value) => handleSelectChange("profile_type", value)}
              >
                <SelectTrigger
                  className="mt-1 h-12 rounded-lg border-2 border-[#E5E7EB] bg-[#F9FAFB] focus:border-[#064E3B]"
                  data-testid="profile-type-select"
                >
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-muted-foreground" />
                    <SelectValue placeholder="Select profile type" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="salaried">Salaried Employee</SelectItem>
                  <SelectItem value="self_employed">Self Employed</SelectItem>
                  <SelectItem value="businessman">Business Owner</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">Preferred Currency</Label>
              <Select
                value={formData.preferred_currency}
                onValueChange={(value) =>
                  handleSelectChange("preferred_currency", value)
                }
              >
                <SelectTrigger
                  className="mt-1 h-12 rounded-lg border-2 border-[#E5E7EB] bg-[#F9FAFB] focus:border-[#064E3B]"
                  data-testid="currency-select"
                >
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.symbol} {currency.name} ({currency.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full bg-[#064E3B] hover:bg-[#064E3B]/90 rounded-lg h-12 text-base font-bold"
              disabled={loading}
              data-testid="register-submit-btn"
            >
              {loading ? (
                <span className="flex items-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Creating account...
                </span>
              ) : (
                <span className="flex items-center">
                  Create Account <ArrowRight className="ml-2 w-5 h-5" />
                </span>
              )}
            </Button>
          </form>

          <p className="text-center text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-[#064E3B] font-semibold hover:underline"
              data-testid="login-link"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
