import { useState } from "react";
import Sidebar from "../components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
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
import { User, Globe, Briefcase, Save } from "lucide-react";

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
  { code: "CHF", name: "Swiss Franc", symbol: "CHF" },
  { code: "MXN", name: "Mexican Peso", symbol: "$" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$" },
  { code: "KRW", name: "South Korean Won", symbol: "₩" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$" },
  { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$" },
  { code: "SEK", name: "Swedish Krona", symbol: "kr" },
  { code: "NOK", name: "Norwegian Krone", symbol: "kr" },
  { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$" },
  { code: "ZAR", name: "South African Rand", symbol: "R" },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ" },
  { code: "SAR", name: "Saudi Riyal", symbol: "﷼" },
];

const PROFILE_TYPES = [
  { value: "salaried", label: "Salaried Employee" },
  { value: "self_employed", label: "Self Employed" },
  { value: "businessman", label: "Business Owner" },
];

const SettingsPage = ({ user, setUser }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    profile_type: user?.profile_type || "salaried",
    preferred_currency: user?.preferred_currency || "USD",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to update profile");

      const updatedUser = await response.json();
      setUser({ ...user, ...updatedUser });
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA]" data-testid="settings-page">
      <Sidebar user={user} />

      <main className="lg:ml-64 p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account preferences
          </p>
        </div>

        <div className="max-w-2xl space-y-6">
          {/* Profile Settings */}
          <Card className="rounded-xl border border-[#E5E7EB] bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name">Display Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="mt-1"
                    data-testid="settings-name-input"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    value={user?.email || ""}
                    disabled
                    className="mt-1 bg-[#F9FAFB]"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Email cannot be changed
                  </p>
                </div>

                <div>
                  <Label className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Profile Type
                  </Label>
                  <Select
                    value={formData.profile_type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, profile_type: value })
                    }
                  >
                    <SelectTrigger className="mt-1" data-testid="settings-profile-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PROFILE_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    This affects the default categories shown for new accounts
                  </p>
                </div>

                <div>
                  <Label className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Preferred Currency
                  </Label>
                  <Select
                    value={formData.preferred_currency}
                    onValueChange={(value) =>
                      setFormData({ ...formData, preferred_currency: value })
                    }
                  >
                    <SelectTrigger className="mt-1" data-testid="settings-currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          {currency.symbol} {currency.name} ({currency.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Used for displaying totals and reports
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-[#064E3B] hover:bg-[#064E3B]/90"
                  data-testid="settings-save-btn"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card className="rounded-xl border border-[#E5E7EB] bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Account Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-[#E5E7EB]">
                  <span className="text-muted-foreground">User ID</span>
                  <span className="font-mono text-sm">{user?.user_id}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-[#E5E7EB]">
                  <span className="text-muted-foreground">Profile Type</span>
                  <span className="capitalize">
                    {user?.profile_type?.replace("_", " ")}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-muted-foreground">Currency</span>
                  <span>{user?.preferred_currency}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Currency Converter */}
          <CurrencyConverter />
        </div>
      </main>
    </div>
  );
};

const CurrencyConverter = () => {
  const [amount, setAmount] = useState("");
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("EUR");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleConvert = async () => {
    if (!amount) return;

    setLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/api/currencies/convert?amount=${amount}&from_currency=${fromCurrency}&to_currency=${toCurrency}`,
        { credentials: "include" }
      );

      if (!response.ok) throw new Error("Conversion failed");

      const data = await response.json();
      setResult(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="rounded-xl border border-[#E5E7EB] bg-white">
      <CardHeader>
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Currency Converter
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label>Amount</Label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="mt-1"
              data-testid="converter-amount"
            />
          </div>
          <div>
            <Label>From</Label>
            <Select value={fromCurrency} onValueChange={setFromCurrency}>
              <SelectTrigger className="mt-1" data-testid="converter-from">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>To</Label>
            <Select value={toCurrency} onValueChange={setToCurrency}>
              <SelectTrigger className="mt-1" data-testid="converter-to">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          onClick={handleConvert}
          disabled={loading || !amount}
          className="mt-4 bg-[#064E3B] hover:bg-[#064E3B]/90"
          data-testid="convert-btn"
        >
          Convert
        </Button>

        {result && (
          <div className="mt-4 p-4 bg-[#F9FAFB] rounded-lg">
            <p className="text-sm text-muted-foreground">Result:</p>
            <p className="text-2xl font-bold font-mono">
              {result.converted_amount.toFixed(2)} {result.to}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Rate: 1 {result.from} = {result.rate.toFixed(4)} {result.to}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SettingsPage;
