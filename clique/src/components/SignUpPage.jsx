import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Shield, Mail, Lock, User, AlertCircle, CheckCircle2, ArrowLeft, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import api from '../lib/axios';
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from '@react-oauth/google';

// Step 1: Email entry
// Step 2: OTP verification
// Step 3: Name + Password

const STEPS = {
  EMAIL: 1,
  OTP: 2,
  DETAILS: 3,
};

export function SignUpPage({ onSignUpSuccess }) {
  const [step, setStep] = useState(STEPS.EMAIL);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const otpRefs = useRef([]);

  // --- OTP input handlers ---
  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) otpRefs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6).split("");
    const next = [...otp];
    digits.forEach((d, i) => { next[i] = d; });
    setOtp(next);
    const nextFocus = Math.min(digits.length, 5);
    otpRefs.current[nextFocus]?.focus();
  };

  const otpCode = otp.join("");

  // --- Step 1: Send OTP ---
  const handleSendOtp = async (e) => {
    e?.preventDefault();
    setError("");
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }
    setIsLoading(true);
    try {
      await api.post("/api/auth/send-otp", { email });
      toast.success("Verification code sent! Check your inbox.");
      setStep(STEPS.OTP);
      startCooldown();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send code. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const startCooldown = () => {
    setResendCooldown(60);
    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  // --- Step 2: Verify OTP ---
  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    setError("");
    if (otpCode.length !== 6) {
      setError("Please enter the full 6-digit code");
      return;
    }
    setIsLoading(true);
    try {
      await api.post("/api/auth/verify-otp", { email, code: otpCode });
      toast.success("Email verified!");
      setStep(STEPS.DETAILS);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired code");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Step 3: Create Account ---
  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) { setError("Passwords do not match"); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    if (!fullName.trim()) { setError("Please enter your full name"); return; }

    setIsLoading(true);
    try {
      const response = await api.post("/api/auth/signup", { email, password, fullName });
      toast.success("Account created successfully!");
      const { token, user } = response.data;
      localStorage.setItem("authToken", token);
      localStorage.setItem("user", JSON.stringify(user));
      onSignUpSuccess(user);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    try {
      const response = await api.post("/api/auth/google", { credential: credentialResponse.credential });
      const { token, user } = response.data;
      localStorage.setItem("authToken", token);
      localStorage.setItem("user", JSON.stringify(user));
      onSignUpSuccess(user);
      toast.success(`Welcome, ${user.fullName}!`);
      navigate(user.isProfileComplete ? "/dashboard" : "/complete-profile");
    } catch {
      toast.error("Google login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const stepTitles = {
    [STEPS.EMAIL]: { title: "Join Clique", desc: "Enter your email to get started" },
    [STEPS.OTP]: { title: "Check your inbox", desc: `We sent a 6-digit code to ${email}` },
    [STEPS.DETAILS]: { title: "Almost there!", desc: "Set your name and password" },
  };

  const { title, desc } = stepTitles[step];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12 bg-gradient-to-br from-cyan-50 via-white to-blue-50">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 to-blue-600">
            {title}
          </h1>
          <p className="text-slate-500">{desc}</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2">
          {[STEPS.EMAIL, STEPS.OTP, STEPS.DETAILS].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step > s ? "bg-green-500 text-white" : step === s ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white" : "bg-slate-200 text-slate-500"
              }`}>
                {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
              </div>
              {s < 3 && <div className={`w-12 h-0.5 transition-all ${step > s ? "bg-green-400" : "bg-slate-200"}`} />}
            </div>
          ))}
        </div>

        <Card className="border-0 shadow-xl shadow-slate-200/60 rounded-3xl bg-white/80 backdrop-blur-xl">
          <CardContent className="p-8">
            {error && (
              <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* ── STEP 1: EMAIL ── */}
            {step === STEPS.EMAIL && (
              <form onSubmit={handleSendOtp} className="space-y-5">
                <div className="space-y-2">
                  <Label className="font-semibold text-slate-700">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 rounded-xl border-slate-200 focus-visible:ring-cyan-500/30"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl h-12 font-semibold shadow-md hover:shadow-lg transition-all"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Mail className="w-4 h-4 mr-2" />}
                  {isLoading ? "Sending code..." : "Send Verification Code"}
                </Button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
                  <div className="relative flex justify-center text-sm"><span className="px-3 bg-white text-slate-400">or</span></div>
                </div>

                <div className="flex justify-center">
                  <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => toast.error("Google Signup Failed")} useOneTap text="signup_with" theme="outline" shape="pill" width="100%" />
                </div>

                <p className="text-center text-sm text-slate-500 pt-2">
                  Already have an account?{" "}
                  <button type="button" onClick={() => navigate("/login")} className="text-cyan-600 font-semibold hover:underline">Sign in</button>
                </p>
              </form>
            )}

            {/* ── STEP 2: OTP ── */}
            {step === STEPS.OTP && (
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div className="bg-cyan-50 border border-cyan-200 rounded-2xl p-5 text-center space-y-1">
                  <Mail className="w-8 h-8 text-cyan-600 mx-auto" />
                  <p className="text-slate-700 font-medium text-sm">Code sent to</p>
                  <p className="text-cyan-700 font-bold">{email}</p>
                </div>

                <div className="space-y-3">
                  <Label className="font-semibold text-slate-700 text-center block">Enter 6-digit code</Label>
                  <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => (otpRefs.current[i] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        className={`w-12 h-14 text-center text-2xl font-bold border-2 rounded-xl outline-none transition-all ${
                          digit ? "border-cyan-500 bg-cyan-50 text-cyan-700" : "border-slate-200 bg-slate-50 text-slate-800"
                        } focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20`}
                      />
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || otpCode.length !== 6}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl h-12 font-semibold"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                  {isLoading ? "Verifying..." : "Verify Code"}
                </Button>

                <div className="flex items-center justify-between text-sm">
                  <button type="button" onClick={() => { setStep(STEPS.EMAIL); setOtp(["","","","","",""]); setError(""); }} className="flex items-center gap-1 text-slate-500 hover:text-slate-700">
                    <ArrowLeft className="w-4 h-4" /> Change email
                  </button>
                  <button
                    type="button"
                    disabled={resendCooldown > 0}
                    onClick={handleSendOtp}
                    className="flex items-center gap-1 text-cyan-600 hover:text-cyan-800 font-medium disabled:text-slate-400 disabled:cursor-not-allowed"
                  >
                    <RefreshCw className="w-4 h-4" />
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
                  </button>
                </div>
              </form>
            )}

            {/* ── STEP 3: DETAILS ── */}
            {step === STEPS.DETAILS && (
              <form onSubmit={handleSignUp} className="space-y-5">
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Email <strong>{email}</strong> verified ✓</span>
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold text-slate-700">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="Your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-10 rounded-xl border-slate-200 focus-visible:ring-cyan-500/30"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold text-slate-700">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      type="password"
                      placeholder="At least 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 rounded-xl border-slate-200 focus-visible:ring-cyan-500/30"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold text-slate-700">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      type="password"
                      placeholder="Repeat your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 rounded-xl border-slate-200 focus-visible:ring-cyan-500/30"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl h-12 font-semibold shadow-md hover:shadow-lg transition-all"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="text-center space-y-2">
          <p className="text-xs text-slate-500">By signing up, you agree to our Terms of Service and Privacy Policy</p>
          <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
            <Shield className="w-4 h-4 text-green-600" />
            <span>Your data is encrypted and never shared</span>
          </div>
        </div>
      </div>
    </div>
  );
}