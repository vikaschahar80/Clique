import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Shield, Mail, Lock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import api from '../lib/axios';
import { GoogleLogin } from '@react-oauth/google';
export function SignInPage({ onSignInSuccess, onSwitchToSignUp }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!email || !password) {
      setError("Please enter both email and password");
      setIsLoading(false);
      return;
    }

    try {
      // 1. Send credentials to your backend
      const response = await api.post('/api/auth/login', {
        email,
        password
      });

      // 2. Extract data from the successful response
      // (Matches the structure we built in the server: { success, token, user })
      const { token, user } = response.data;

      // 3. Save the JWT token securely for future requests
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));

      // 4. Update global auth state with REAL user data
      onSignInSuccess(user);

      toast.success(`Welcome back, ${user.fullName}!`);
      if (user.isProfileComplete) {
        // Profile exists -> Go to Dashboard
        navigate('/dashboard');
      } else {
        // Profile missing -> Go to Onboarding/Setup
        navigate('/complete-profile');
      }
    } catch (err) {
      // 5. Handle errors (like "Invalid credentials")
      console.error("Login Error:", err);
      const errorMessage = err.response?.data?.message || "Login failed. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    try {
      const response = await api.post('/api/auth/google', {
        credential: credentialResponse.credential
      });
      const { token, user } = response.data;
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      onSignInSuccess(user);
      toast.success(`Welcome back, ${user.fullName}!`);
      if (user.isProfileComplete) {
        navigate('/dashboard');
      } else {
        navigate('/complete-profile');
      }
    } catch (err) {
      console.error("Google Login Error:", err);
      toast.error("Google login failed");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div onClick={() => { navigate('/') }} className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-slate-900">Clique</h1>
          <p className="text-slate-600">Social spaces where only real people exist — safely.</p>
        </div>

        {/* Sign In Card */}
        <Card className="border-slate-200 shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>Sign in to your verified account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignIn} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <button
                    type="button"
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>

              <div className="flex justify-center pt-2">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => toast.error("Google Login Failed")}
                  useOneTap
                  theme="filled_blue"
                  shape="pill"
                  width="100%"
                />
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-slate-500">New to Clique?</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={onSwitchToSignUp}
              >
                Create an account
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Trust Badge */}
        <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
          <Shield className="w-4 h-4 text-green-600" />
          <span>100% verified humans only</span>
        </div>
      </div>
    </div>
  );
}