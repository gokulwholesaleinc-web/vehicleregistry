import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import { Eye, EyeOff } from "lucide-react";
import { Link } from "wouter";
import { setAuthToken } from "@/lib/auth";

export default function SignIn() {
  const [error, setError] = useState<string | null>(null);
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    firstName: "",
    lastName: "",
    usernameOrEmail: "",
  });

  const handleSignInSuccess = (user?: any) => {
    // Redirect based on user role - admin users go to admin dashboard
    console.log("Redirecting user:", user);
    console.log("Is admin?", user?.role === "admin");
    
    if (user?.role === "admin") {
      console.log("Redirecting to admin dashboard");
      window.location.href = "/admin";
    } else {
      console.log("Redirecting to user dashboard");
      window.location.href = "/";
    }
  };

  const handleSignInError = (errorMsg: string) => {
    setError(errorMsg);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const payload = isLogin 
        ? { email: formData.usernameOrEmail, password: formData.password }
        : { 
            username: formData.username,
            email: formData.email, 
            password: formData.password,
            firstName: formData.firstName,
            lastName: formData.lastName
          };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log("Login response:", data);

      if (!response.ok || !data.ok) {
        console.error("Login failed:", data);
        throw new Error(data.error?.message || "Authentication failed");
      }

      // Store token using proper auth system
      if (data.token) {
        setAuthToken(data.token);
        console.log("Token stored successfully");
      }

      console.log("User data:", data.user);
      console.log("User role:", data.user?.role);
      
      handleSignInSuccess(data.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen grid place-items-center bg-slate-50 dark:bg-slate-900 p-6">
      <div className="w-full max-w-sm bg-white dark:bg-slate-800 border rounded-2xl p-6 shadow-sm">
        <div className="flex justify-center mb-4">
          <img src="/vintage-badge.png" alt="VINtage Garage" className="h-16 w-auto"/>
        </div>
        <h1 className="text-xl font-semibold text-center">Welcome back</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 text-center">Sign in to manage your builds and logs</p>

        {/* Google */}
        <div className="mt-4">
          <GoogleSignInButton onSuccess={() => handleSignInSuccess()} onError={handleSignInError} />
        </div>

        {/* Divider */}
        <div className="my-4 flex items-center gap-3 text-xs text-slate-500">
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700"/><span>or</span><div className="h-px flex-1 bg-slate-200 dark:bg-slate-700"/>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Toggle between login and register */}
        <div className="mb-4 flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
          <button
            type="button"
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              isLogin 
                ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm' 
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              !isLogin 
                ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm' 
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            Register
          </button>
        </div>

        {/* Email/Password form */}
        <form className="space-y-3" onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="firstName" className="text-sm">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="First"
                    required={!isLogin}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-sm">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Last"
                    required={!isLogin}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="username" className="text-sm">Username</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Username"
                  required={!isLogin}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-sm">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Email"
                  required={!isLogin}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
            </>
          )}

          {isLogin && (
            <div>
              <Label htmlFor="usernameOrEmail" className="text-sm">Email or Username</Label>
              <Input
                id="usernameOrEmail"
                name="usernameOrEmail"
                type="text"
                value={formData.usernameOrEmail}
                onChange={handleInputChange}
                placeholder="Email or Username"
                required={isLogin}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
          )}

          <div>
            <Label htmlFor="password" className="text-sm">Password</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Password"
                required
                className="w-full border rounded-lg px-3 py-2 pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full bg-slate-900 text-white rounded-lg py-2 hover:bg-slate-800 disabled:opacity-50"
          >
            {loading ? "Loading..." : isLogin ? "Sign in" : "Register"}
          </Button>
        </form>

        <div className="mt-3 text-center text-sm">
          <Link href="/privacy-policy" className="text-slate-700 hover:underline">Privacy Policy</Link>
          <span className="text-slate-400"> · </span>
          <a href="/reset" className="text-slate-700 hover:underline">Forgot password?</a>
        </div>
      </div>
    </main>
  );
}