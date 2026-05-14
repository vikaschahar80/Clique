import { useState, useRef, useCallback } from "react";
import Webcam from "react-webcam";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Input } from "../ui/input";
import { Shield, Camera, FileText, CheckCircle, RefreshCw, Upload, Image as ImageIcon, Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from '../../lib/axios';

const videoConstraints = {
  width: 720,
  height: 720,
  facingMode: "user"
};

export function VerificationFlow({ onComplete }) {
  const [step, setStep] = useState(1);
  const [selfieBase64, setSelfieBase64] = useState(null);
  const [idCardFile, setIdCardFile] = useState(null);
  const [idCardPreview, setIdCardPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);

  const [proofMode, setProofMode] = useState("document");
  const [emailPurpose, setEmailPurpose] = useState("college");
  const [affiliationEmail, setAffiliationEmail] = useState("");
  const [otpSlots, setOtpSlots] = useState(["", "", "", "", "", ""]);
  const [codeSent, setCodeSent] = useState(false);
  const [emailProofVerified, setEmailProofVerified] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const otpRefs = useRef([]);

  const webcamRef = useRef(null);

  const captureSelfie = useCallback(() => {
    if (!webcamRef.current) return;

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) {
      toast.error("Camera is still loading or unavailable. Please wait.");
      return;
    }
    setSelfieBase64(imageSrc);
  }, [webcamRef]);

  const handleFileChange = (e, setFile, setPreview) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetEmailFlow = () => {
    setAffiliationEmail("");
    setOtpSlots(["", "", "", "", "", ""]);
    setCodeSent(false);
    setEmailProofVerified(false);
    setResendCooldown(0);
  };

  const startCooldown = () => {
    setResendCooldown(60);
    const t = setInterval(() => setResendCooldown(p => { if (p <= 1) { clearInterval(t); return 0; } return p - 1; }), 1000);
  };

  const handleOtpChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otpSlots]; next[i] = val; setOtpSlots(next);
    if (val && i < 5) otpRefs.current[i + 1]?.focus();
  };
  const handleOtpKey = (i, e) => {
    if (e.key === "Backspace" && !otpSlots[i] && i > 0) otpRefs.current[i - 1]?.focus();
  };
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6).split("");
    const next = [...otpSlots]; digits.forEach((d, i) => { next[i] = d; }); setOtpSlots(next);
    otpRefs.current[Math.min(digits.length, 5)]?.focus();
  };
  const otpCode = otpSlots.join("");

  const handleSendEmailCode = async () => {
    if (!affiliationEmail.trim()) { toast.error("Enter the email you want to verify."); return; }
    setIsSendingCode(true);
    try {
      await api.post("/api/verify/email/send", {
        email: affiliationEmail.trim().toLowerCase(),
        purpose: emailPurpose,
      });
      setCodeSent(true);
      startCooldown();
      toast.success("Check your inbox for a verification code.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not send code.", { duration: 6000 });
    } finally { setIsSendingCode(false); }
  };

  const handleConfirmEmailCode = async () => {
    if (otpCode.length !== 6) { toast.error("Enter the full 6-digit code."); return; }
    setIsVerifyingCode(true);
    try {
      await api.post("/api/verify/email/confirm", {
        email: affiliationEmail.trim().toLowerCase(),
        purpose: emailPurpose,
        code: otpCode,
      });
      setEmailProofVerified(true);
      toast.success("Email verified! You can now submit for admin review.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid or expired code.");
    } finally { setIsVerifyingCode(false); }
  };

  const handleSubmit = async () => {
    if (!selfieBase64) {
      toast.error("Please capture a selfie first.");
      return;
    }
    if (proofMode === "document" && !idCardFile) {
      toast.error("Please upload an ID photo, or switch to email verification.");
      return;
    }
    if (proofMode === "email" && !emailProofVerified) {
      toast.error("Verify your email before submitting.");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("method", proofMode === "email" ? "email" : "id_document");

      const selfieResponse = await fetch(selfieBase64);
      const selfieBlob = await selfieResponse.blob();
      formData.append("selfie", selfieBlob, "selfie.jpg");

      if (proofMode === "document" && idCardFile) {
        formData.append("idCard", idCardFile);
      }

      const response = await api.post("/api/verify/request", formData);

      if (response.data.success) {
        setStep(3);
        toast.success("Verification submitted successfully!");
        if (onComplete) onComplete();
      }
    } catch (error) {
      console.error("Verification Error:", error);
      const msg = error.response?.data?.message || "Server connection error. Please try again.";
      toast.error(msg, { duration: 5000 });
    } finally {
      setIsUploading(false);
    }
  };

  const canSubmit =
    proofMode === "document"
      ? !!idCardFile
      : emailProofVerified;

  if (step === 3) {
    return (
      <Card className="w-full max-w-md mx-auto text-center border-green-200 bg-green-50">
        <CardContent className="pt-10 pb-10 space-y-4">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-green-900">Submitted!</h2>
          <p className="text-green-700">
            Our team will review your selfie and proof shortly. You will see a verification badge once approved.
          </p>
          <Button type="button" variant="outline" className="mt-4" onClick={() => window.location.reload()}>
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6 p-4">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider">
          <Shield className="w-3 h-3" /> Step {step} of 2
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Verify your Identity</h1>
        <p className="text-slate-600">
          Take a live selfie, then prove who you are with an ID photo <span className="font-medium">or</span> a verified school / work / other email.
        </p>
      </div>

      <Card className="border-slate-200 shadow-xl overflow-hidden">
        {step === 1 ? (
          <>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-blue-600" />
                Live Selfie
              </CardTitle>
              <CardDescription>
                Take a clear photo of your face.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!selfieBase64 ? (
                <div className="relative aspect-square bg-black rounded-2xl overflow-hidden shadow-inner">
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={videoConstraints}
                    onUserMedia={() => setIsCameraReady(true)}
                    onUserMediaError={(err) => {
                      console.error("Camera Error:", err);
                      toast.error("Could not access camera. Please check browser permissions and use HTTPS or localhost.");
                    }}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 border-2 border-dashed border-white/30 pointer-events-none m-8 rounded-full" />
                </div>
              ) : (
                <div className="relative aspect-square bg-slate-100 rounded-2xl overflow-hidden shadow-inner border border-slate-200">
                  <img src={selfieBase64} className="w-full h-full object-cover" alt="Selfie Preview" />
                  <Button
                    type="button"
                    variant="secondary"
                    className="absolute bottom-4 right-4 bg-white/90 backdrop-blur text-slate-700 hover:bg-white border border-slate-200"
                    onClick={() => setSelfieBase64(null)}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" /> Retake
                  </Button>
                </div>
              )}

              <Button
                type="button"
                className="w-full h-12 text-lg"
                onClick={selfieBase64 ? () => setStep(2) : captureSelfie}
                disabled={isUploading || (!selfieBase64 && !isCameraReady)}
              >
                {!selfieBase64 && !isCameraReady ? "Starting Camera..." : selfieBase64 ? "Next: Add proof" : "Capture Selfie"}
              </Button>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Proof of identity
              </CardTitle>
              <CardDescription>
                Upload an ID document, or verify a school / work / other email—we will still review your selfie manually.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={proofMode === "document" ? "default" : "outline"}
                  className="h-11"
                  onClick={() => {
                    setProofMode("document");
                    resetEmailFlow();
                  }}
                >
                  ID document
                </Button>
                <Button
                  type="button"
                  variant={proofMode === "email" ? "default" : "outline"}
                  className="h-11"
                  onClick={() => {
                    setProofMode("email");
                    setIdCardFile(null);
                    setIdCardPreview(null);
                  }}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Email instead
                </Button>
              </div>

              {proofMode === "document" ? (
                <>
                  {!idCardPreview ? (
                    <label className="flex flex-col items-center justify-center aspect-[16/10] border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group">
                      <ImageIcon className="w-10 h-10 text-slate-300 group-hover:text-blue-500 transition-colors mb-2" />
                      <span className="text-slate-600 font-medium">Tap to upload ID photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileChange(e, setIdCardFile, setIdCardPreview)}
                      />
                    </label>
                  ) : (
                    <div className="relative aspect-[16/10] bg-slate-100 rounded-2xl overflow-hidden shadow-inner border border-slate-200">
                      <img src={idCardPreview} className="w-full h-full object-cover" alt="ID Preview" />
                      <label className="absolute bottom-4 right-4 bg-white/90 backdrop-blur text-slate-700 hover:bg-white px-4 py-2 rounded-md text-sm font-medium cursor-pointer shadow-sm border border-slate-200 transition-colors flex items-center gap-2">
                        <RefreshCw className="w-4 h-4" /> Change
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileChange(e, setIdCardFile, setIdCardPreview)}
                        />
                      </label>
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 block mb-2">What type of email?</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "college", label: "🎓 Student", placeholder: "you@university.edu" },
                        { id: "work", label: "💼 Work", placeholder: "you@company.com" },
                        { id: "other", label: "📧 Other", placeholder: "your@email.com" },
                      ].map((opt) => (
                        <Button key={opt.id} type="button" size="sm"
                          variant={emailPurpose === opt.id ? "default" : "outline"}
                          className={`h-10 text-xs font-semibold transition-all ${emailPurpose === opt.id ? "bg-gradient-to-r from-cyan-500 to-blue-600 border-transparent text-white" : ""}`}
                          onClick={() => { setEmailPurpose(opt.id); resetEmailFlow(); }}
                        >{opt.label}</Button>
                      ))}
                    </div>
                  </div>

                  {!emailProofVerified ? (
                    <>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 block">
                          {emailPurpose === "college" ? "Your .edu / college email" : emailPurpose === "work" ? "Your work email" : "Email to verify"}
                        </label>
                        <div className="flex gap-2">
                          <Input
                            type="email"
                            placeholder={emailPurpose === "college" ? "you@university.edu" : emailPurpose === "work" ? "you@company.com" : "your@email.com"}
                            value={affiliationEmail}
                            onChange={(e) => { setAffiliationEmail(e.target.value); setEmailProofVerified(false); setCodeSent(false); setOtpSlots(["","","","","",""]); }}
                            disabled={codeSent}
                            className="rounded-xl border-slate-200 focus-visible:ring-cyan-500/30"
                          />
                          {codeSent && (
                            <Button type="button" variant="outline" size="sm" onClick={() => { setCodeSent(false); setOtpSlots(["","","","","",""]); }} className="text-xs px-3 whitespace-nowrap">Change</Button>
                          )}
                        </div>
                      </div>

                      {!codeSent ? (
                        <Button type="button" className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl" onClick={handleSendEmailCode} disabled={!affiliationEmail.trim() || isSendingCode}>
                          {isSendingCode ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Sending...</> : <><Mail className="w-4 h-4 mr-2" />Send Verification Code</>}
                        </Button>
                      ) : (
                        <div className="space-y-3">
                          <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-3 text-center">
                            <p className="text-cyan-700 text-sm font-medium">Code sent to <strong>{affiliationEmail}</strong></p>
                          </div>
                          <div>
                            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 block mb-2 text-center">Enter 6-digit code</label>
                            <div className="flex gap-1.5 justify-center" onPaste={handleOtpPaste}>
                              {otpSlots.map((digit, i) => (
                                <input key={i} ref={el => otpRefs.current[i] = el}
                                  type="text" inputMode="numeric" maxLength={1} value={digit}
                                  onChange={e => handleOtpChange(i, e.target.value)}
                                  onKeyDown={e => handleOtpKey(i, e)}
                                  className={`w-11 h-12 text-center text-xl font-bold border-2 rounded-xl outline-none transition-all ${
                                    digit ? "border-cyan-500 bg-cyan-50 text-cyan-700" : "border-slate-200 bg-white text-slate-800"
                                  } focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20`}
                                />
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button type="button" disabled={resendCooldown > 0} onClick={handleSendEmailCode} className="text-xs text-cyan-600 hover:underline disabled:text-slate-400 disabled:no-underline">
                              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
                            </button>
                            <Button type="button" className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl" onClick={handleConfirmEmailCode} disabled={otpCode.length !== 6 || isVerifyingCode}>
                              {isVerifyingCode ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Verifying...</> : "Verify Code"}
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                      <CheckCircle className="w-6 h-6 text-green-600 shrink-0" />
                      <div>
                        <p className="text-green-800 font-semibold text-sm">Email verified!</p>
                        <p className="text-green-700 text-xs">{affiliationEmail}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3">
                <Button type="button" variant="outline" className="flex-1 h-12" onClick={() => setStep(1)} disabled={isUploading}>
                  Back
                </Button>
                <Button
                  type="button"
                  className="flex-[2] h-12"
                  disabled={!canSubmit || isUploading}
                  onClick={handleSubmit}
                >
                  {isUploading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin mr-2" /> Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" /> Submit verification
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </>
        )}
      </Card>

      <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex gap-3 items-start">
        <Shield className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-800 space-y-1">
          <p className="font-bold uppercase tracking-wider">Fast &amp; secure</p>
          <p>Selfie and ID images go to your verification Cloudinary folder for admin review. Email verification confirms you control that address before we queue your request.</p>
        </div>
      </div>
    </div>
  );
}
