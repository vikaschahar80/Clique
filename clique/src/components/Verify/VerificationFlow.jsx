import { useState, useRef, useCallback, useEffect } from "react";
import Webcam from "react-webcam";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { 
  Shield, Camera, FileText, CheckCircle, RefreshCw, Upload, 
  Image as ImageIcon, Mail, Loader2, AlertCircle, GraduationCap, 
  Briefcase, ChevronRight, X, ArrowLeft 
} from "lucide-react";
import { toast } from "sonner";
import api from '../../lib/axios';

const videoConstraints = {
  width: 720,
  height: 720,
  facingMode: "user"
};

export function VerificationFlow() {
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState(null); // 'face' | 'govt_id' | 'college' | 'work' | null

  // Verification Flags
  const [status, setStatus] = useState({
    isPersonVerified: false,
    isIdVerified: false,
    isCollegeVerified: false,
    isWorkVerified: false,
    college: "",
    work: "",
    requests: []
  });

  // Camera State
  const [selfieBase64, setSelfieBase64] = useState(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isUploadingSelfie, setIsUploadingSelfie] = useState(false);
  const webcamRef = useRef(null);

  // Govt ID State
  const [idCardFile, setIdCardFile] = useState(null);
  const [idCardPreview, setIdCardPreview] = useState(null);
  const [isUploadingId, setIsUploadingId] = useState(false);

  // College Verification Options State
  const [collegeSubMethod, setCollegeSubMethod] = useState(null); // 'email' | 'id_card' | null
  const [collegeIdFile, setCollegeIdFile] = useState(null);
  const [collegeIdPreview, setCollegeIdPreview] = useState(null);
  const [isUploadingCollegeId, setIsUploadingCollegeId] = useState(false);

  // OTP Email State
  const [emailPurpose, setEmailPurpose] = useState(""); // 'college' | 'work'
  const [affiliationEmail, setAffiliationEmail] = useState("");
  const [otpSlots, setOtpSlots] = useState(["", "", "", "", "", ""]);
  const [codeSent, setCodeSent] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpRefs = useRef([]);

  const fetchStatus = async () => {
    try {
      const response = await api.get("/api/verify/status");
      if (response.data.success) {
        setStatus({
          isPersonVerified: response.data.isPersonVerified,
          isIdVerified: response.data.isIdVerified,
          isCollegeVerified: response.data.isCollegeVerified,
          isWorkVerified: response.data.isWorkVerified,
          college: response.data.college || "",
          work: response.data.work || "",
          requests: response.data.requests || []
        });
      }
    } catch (error) {
      console.error("Error fetching verification status:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const captureSelfie = useCallback(() => {
    if (!webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) {
      toast.error("Camera is still loading. Please wait.");
      return;
    }
    setSelfieBase64(imageSrc);
  }, [webcamRef]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIdCardFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setIdCardPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadSelfie = async () => {
    if (!selfieBase64) return;
    setIsUploadingSelfie(true);
    try {
      const formData = new FormData();
      formData.append("method", "face");
      
      const selfieResponse = await fetch(selfieBase64);
      const selfieBlob = await selfieResponse.blob();
      formData.append("selfie", selfieBlob, "selfie.jpg");

      const response = await api.post("/api/verify/request", formData);
      if (response.data.success) {
        toast.success("Selfie submitted successfully! Admin will review shortly.");
        setSelfieBase64(null);
        setActiveSection(null);
        fetchStatus();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to upload selfie.");
    } finally {
      setIsUploadingSelfie(false);
    }
  };

  const handleUploadIdCard = async () => {
    if (!idCardFile) return;
    setIsUploadingId(true);
    try {
      const formData = new FormData();
      formData.append("method", "govt_id");
      formData.append("idCard", idCardFile);

      const response = await api.post("/api/verify/request", formData);
      if (response.data.success) {
        toast.success("ID document uploaded successfully! Admin will review shortly.");
        setIdCardFile(null);
        setIdCardPreview(null);
        setActiveSection(null);
        fetchStatus();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to upload ID document.");
    } finally {
      setIsUploadingId(false);
    }
  };

  const handleCollegeFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCollegeIdFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCollegeIdPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadCollegeId = async () => {
    if (!collegeIdFile) return;
    setIsUploadingCollegeId(true);
    try {
      const formData = new FormData();
      formData.append("method", "college_id");
      formData.append("idCard", collegeIdFile);

      const response = await api.post("/api/verify/request", formData);
      if (response.data.success) {
        toast.success("Student ID card uploaded successfully! Admin will review shortly.");
        setCollegeIdFile(null);
        setCollegeIdPreview(null);
        setCollegeSubMethod(null);
        setActiveSection(null);
        fetchStatus();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to upload Student ID.");
    } finally {
      setIsUploadingCollegeId(false);
    }
  };

  // OTP Logic
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

  const handleSendOtp = async () => {
    if (!affiliationEmail.trim()) { toast.error("Please enter email address."); return; }
    setIsSendingCode(true);
    try {
      await api.post("/api/verify/email/send", {
        email: affiliationEmail.trim().toLowerCase(),
        purpose: emailPurpose
      });
      setCodeSent(true);
      startCooldown();
      toast.success("Verification code dispatched to your inbox.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to dispatch verification code.");
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerifyOtp = async () => {
    const code = otpSlots.join("");
    if (code.length !== 6) { toast.error("Please enter full 6-digit code."); return; }
    setIsVerifyingCode(true);
    try {
      await api.post("/api/verify/email/confirm", {
        email: affiliationEmail.trim().toLowerCase(),
        purpose: emailPurpose,
        code
      });
      toast.success(`${emailPurpose === 'college' ? 'College' : 'Work'} email verified successfully!`);
      setCodeSent(false);
      setAffiliationEmail("");
      setOtpSlots(["", "", "", "", "", ""]);
      setActiveSection(null);
      fetchStatus();
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid or expired code.");
    } finally {
      setIsVerifyingCode(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        <p className="text-slate-500 font-medium animate-pulse">Loading verification details...</p>
      </div>
    );
  }

  // Pending Status checks
  const isFacePending = status.requests.some(r => r.method === 'face' && r.status === 'pending');
  const isIdPending = status.requests.some(r => r.method === 'govt_id' && r.status === 'pending');

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'face':
        return (
          <Card className="border-0 shadow-2xl rounded-3xl bg-white overflow-hidden max-w-xl mx-auto">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white/10 rounded-xl">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl sm:text-2xl font-bold">Face Selfie Verification</CardTitle>
                    <CardDescription className="text-white/80 text-xs sm:text-sm">Capture a live photo to verify your profile identity.</CardDescription>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full" onClick={() => { setActiveSection(null); setSelfieBase64(null); }}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 sm:p-8 space-y-6">
              {!selfieBase64 ? (
                <div className="relative aspect-square max-w-sm mx-auto bg-slate-900 rounded-3xl overflow-hidden shadow-inner border border-slate-200">
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={videoConstraints}
                    onUserMedia={() => setIsCameraReady(true)}
                    onUserMediaError={() => toast.error("Unable to access front webcam.")}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 border-2 border-dashed border-white/20 pointer-events-none m-10 rounded-full" />
                </div>
              ) : (
                <div className="relative aspect-square max-w-sm mx-auto bg-slate-100 rounded-3xl overflow-hidden shadow-inner border border-slate-200">
                  <img src={selfieBase64} className="w-full h-full object-cover" alt="Selfie Preview" />
                  <Button
                    type="button"
                    variant="secondary"
                    className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-md text-slate-700 hover:bg-white rounded-xl shadow-md border border-slate-200"
                    onClick={() => setSelfieBase64(null)}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" /> Retake
                  </Button>
                </div>
              )}

              <div className="flex gap-4">
                <Button type="button" variant="outline" className="flex-1 h-12 rounded-xl" onClick={() => { setActiveSection(null); setSelfieBase64(null); }}>
                  Cancel
                </Button>
                {selfieBase64 ? (
                  <Button type="button" className="flex-[2] h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg" onClick={handleUploadSelfie} disabled={isUploadingSelfie}>
                    {isUploadingSelfie ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Uploading...</> : "Submit Live Photo"}
                  </Button>
                ) : (
                  <Button type="button" className="flex-[2] h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg" onClick={captureSelfie} disabled={!isCameraReady}>
                    Capture Selfie
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );

      case 'govt_id':
        return (
          <Card className="border-0 shadow-2xl rounded-3xl bg-white overflow-hidden max-w-xl mx-auto">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white/10 rounded-xl">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl sm:text-2xl font-bold">Govt ID Verification</CardTitle>
                    <CardDescription className="text-white/80 text-xs sm:text-sm">Upload a driver license, passport or state ID card.</CardDescription>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full" onClick={() => { setActiveSection(null); setIdCardFile(null); setIdCardPreview(null); }}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 sm:p-8 space-y-6">
              {!idCardPreview ? (
                <label className="flex flex-col items-center justify-center aspect-[16/10] border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group">
                  <ImageIcon className="w-12 h-12 text-slate-300 group-hover:text-blue-500 transition-colors mb-2" />
                  <span className="text-slate-600 font-semibold text-sm">Click to choose ID photo</span>
                  <span className="text-slate-400 text-xs mt-1">PNG, JPG, or WEBP up to 5MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              ) : (
                <div className="relative aspect-[16/10] bg-slate-100 rounded-3xl overflow-hidden shadow-inner border border-slate-200">
                  <img src={idCardPreview} className="w-full h-full object-cover" alt="ID Preview" />
                  <label className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-md text-slate-700 hover:bg-white px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer shadow-md border border-slate-200 transition-colors flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" /> Change ID
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
              )}

              <div className="flex gap-4">
                <Button type="button" variant="outline" className="flex-1 h-12 rounded-xl" onClick={() => { setActiveSection(null); setIdCardFile(null); setIdCardPreview(null); }}>
                  Cancel
                </Button>
                <Button type="button" className="flex-[2] h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg" onClick={handleUploadIdCard} disabled={!idCardFile || isUploadingId}>
                  {isUploadingId ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Uploading ID...</> : "Submit ID Card"}
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 'college':
        return (
          <Card className="border-0 shadow-2xl rounded-3xl bg-white overflow-hidden max-w-xl mx-auto">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white/10 rounded-xl">
                    <GraduationCap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl sm:text-2xl font-bold">College Verification</CardTitle>
                    <CardDescription className="text-white/80 text-xs sm:text-sm">Choose how you want to verify your student status.</CardDescription>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full" onClick={() => { setActiveSection(null); setCollegeSubMethod(null); setCollegeIdFile(null); setCollegeIdPreview(null); setCodeSent(false); setAffiliationEmail(""); setOtpSlots(["","","","","",""]); }}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 sm:p-8 space-y-6">
              {collegeSubMethod === null ? (
                <div className="space-y-4">
                  <p className="text-slate-600 text-sm">Select your preferred method to verify your college affiliation:</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Option 1: Email OTP */}
                    <button
                      type="button"
                      onClick={() => setCollegeSubMethod('email')}
                      className="flex flex-col items-center justify-center p-6 bg-slate-50 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-300 rounded-2xl text-center transition-all group active:scale-95"
                    >
                      <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Mail className="w-6 h-6" />
                      </div>
                      <span className="font-bold text-slate-800 text-sm">Institutional Email OTP</span>
                      <span className="text-xs text-slate-400 mt-1">Instant verification via OTP code sent to your student inbox.</span>
                    </button>

                    {/* Option 2: Upload Student ID Card */}
                    <button
                      type="button"
                      onClick={() => setCollegeSubMethod('id_card')}
                      className="flex flex-col items-center justify-center p-6 bg-slate-50 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-300 rounded-2xl text-center transition-all group active:scale-95"
                    >
                      <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                      <span className="font-bold text-slate-800 text-sm">Upload Student ID</span>
                      <span className="text-xs text-slate-400 mt-1">Upload a photo of your physical campus ID card for manual check.</span>
                    </button>
                  </div>

                  <Button type="button" variant="outline" className="w-full h-12 rounded-xl mt-2" onClick={() => setActiveSection(null)}>
                    Cancel
                  </Button>
                </div>
              ) : collegeSubMethod === 'email' ? (
                <div>
                  <button
                    type="button"
                    onClick={() => { setCollegeSubMethod(null); setCodeSent(false); setAffiliationEmail(""); setOtpSlots(["","","","","",""]); }}
                    className="text-xs text-blue-600 font-semibold flex items-center gap-1 hover:underline mb-4"
                  >
                    ← Back to verification choices
                  </button>

                  {!codeSent ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">
                          Your Institutional School Email (.edu / .ac)
                        </Label>
                        <Input
                          type="email"
                          placeholder="you@university.edu"
                          value={affiliationEmail}
                          onChange={(e) => setAffiliationEmail(e.target.value)}
                          className="h-12 rounded-xl border-slate-200 focus-visible:ring-blue-500/20 text-base"
                        />
                      </div>
                      <Button type="button" className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg flex items-center justify-center gap-2" onClick={handleSendOtp} disabled={!affiliationEmail.trim() || isSendingCode}>
                        {isSendingCode ? <><Loader2 className="w-5 h-5 animate-spin" />Sending code...</> : <><Mail className="w-5 h-5" />Send OTP Verification Code</>}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-center">
                        <p className="text-blue-800 text-sm font-medium">We sent a secure verification code to:</p>
                        <p className="text-blue-900 font-bold text-base mt-0.5">{affiliationEmail}</p>
                      </div>
                      <div className="space-y-3">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 text-center block">Enter 6-Digit OTP Code</label>
                        <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                          {otpSlots.map((digit, i) => (
                            <input key={i} ref={el => otpRefs.current[i] = el}
                              type="text" inputMode="numeric" maxLength={1} value={digit}
                              onChange={e => handleOtpChange(i, e.target.value)}
                              onKeyDown={e => handleOtpKey(i, e)}
                              className={`w-12 h-14 text-center text-2xl font-bold border-2 rounded-xl outline-none transition-all ${
                                digit ? "border-blue-500 bg-blue-50/50 text-blue-700" : "border-slate-200 bg-white text-slate-800"
                              } focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20`}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button type="button" disabled={resendCooldown > 0} onClick={handleSendOtp} className="text-xs text-blue-600 hover:underline disabled:text-slate-400 disabled:no-underline font-semibold">
                          {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
                        </button>
                        <Button type="button" className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg" onClick={handleVerifyOtp} disabled={otpSlots.join("").length !== 6 || isVerifyingCode}>
                          {isVerifyingCode ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Verifying...</> : "Verify & Complete"}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  <button
                    type="button"
                    onClick={() => { setCollegeSubMethod(null); setCollegeIdFile(null); setCollegeIdPreview(null); }}
                    className="text-xs text-blue-600 font-semibold flex items-center gap-1 hover:underline mb-4"
                  >
                    ← Back to verification choices
                  </button>

                  {!collegeIdPreview ? (
                    <label className="flex flex-col items-center justify-center aspect-[16/10] border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group">
                      <ImageIcon className="w-12 h-12 text-slate-300 group-hover:text-blue-500 transition-colors mb-2" />
                      <span className="text-slate-600 font-semibold text-sm">Click to choose Student ID photo</span>
                      <span className="text-slate-400 text-xs mt-1">PNG, JPG, or WEBP up to 5MB</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleCollegeFileChange}
                      />
                    </label>
                  ) : (
                    <div className="relative aspect-[16/10] bg-slate-100 rounded-3xl overflow-hidden shadow-inner border border-slate-200">
                      <img src={collegeIdPreview} className="w-full h-full object-cover" alt="ID Preview" />
                      <label className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-md text-slate-700 hover:bg-white px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer shadow-md border border-slate-200 transition-colors flex items-center gap-2">
                        <RefreshCw className="w-4 h-4" /> Change ID
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleCollegeFileChange}
                        />
                      </label>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <Button type="button" variant="outline" className="flex-1 h-12 rounded-xl" onClick={() => { setCollegeSubMethod(null); setCollegeIdFile(null); setCollegeIdPreview(null); }}>
                      Cancel
                    </Button>
                    <Button type="button" className="flex-[2] h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg" onClick={handleUploadCollegeId} disabled={!collegeIdFile || isUploadingCollegeId}>
                      {isUploadingCollegeId ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Uploading ID...</> : "Submit Student ID"}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 'work':
        return (
          <Card className="border-0 shadow-2xl rounded-3xl bg-white overflow-hidden max-w-xl mx-auto">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white/10 rounded-xl">
                    <Briefcase className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl sm:text-2xl font-bold">Work ID Verification</CardTitle>
                    <CardDescription className="text-white/80 text-xs sm:text-sm">Verify your affiliation instantly using corporate email OTP.</CardDescription>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full" onClick={() => { setActiveSection(null); setCodeSent(false); setAffiliationEmail(""); setOtpSlots(["","","","","",""]); }}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 sm:p-8 space-y-6">
              {!codeSent ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">
                      Your Professional Work Email Address
                    </Label>
                    <Input
                      type="email"
                      placeholder="you@company.com"
                      value={affiliationEmail}
                      onChange={(e) => setAffiliationEmail(e.target.value)}
                      className="h-12 rounded-xl border-slate-200 focus-visible:ring-blue-500/20 text-base"
                    />
                  </div>
                  <Button type="button" className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg flex items-center justify-center gap-2" onClick={handleSendOtp} disabled={!affiliationEmail.trim() || isSendingCode}>
                    {isSendingCode ? <><Loader2 className="w-5 h-5 animate-spin" />Sending code...</> : <><Mail className="w-5 h-5" />Send OTP Verification Code</>}
                  </Button>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-center">
                    <p className="text-blue-800 text-sm font-medium">We sent a secure verification code to:</p>
                    <p className="text-blue-900 font-bold text-base mt-0.5">{affiliationEmail}</p>
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 text-center block">Enter 6-Digit OTP Code</label>
                    <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                      {otpSlots.map((digit, i) => (
                        <input key={i} ref={el => otpRefs.current[i] = el}
                          type="text" inputMode="numeric" maxLength={1} value={digit}
                          onChange={e => handleOtpChange(i, e.target.value)}
                          onKeyDown={e => handleOtpKey(i, e)}
                          className={`w-12 h-14 text-center text-2xl font-bold border-2 rounded-xl outline-none transition-all ${
                            digit ? "border-blue-500 bg-blue-50/50 text-blue-700" : "border-slate-200 bg-white text-slate-800"
                          } focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button type="button" disabled={resendCooldown > 0} onClick={handleSendOtp} className="text-xs text-blue-600 hover:underline disabled:text-slate-400 disabled:no-underline font-semibold">
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
                    </button>
                    <Button type="button" className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg" onClick={handleVerifyOtp} disabled={otpSlots.join("").length !== 6 || isVerifyingCode}>
                      {isVerifyingCode ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Verifying...</> : "Verify & Complete"}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 md:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Verification Hub Title */}
        {!activeSection ? (
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-100/60 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5" /> Identity & Credentials
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Verification Portal</h1>
            <p className="text-slate-500 max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
              Verify your physical identity, academic institution, or corporate employer. Choose whichever credentials you want to verify in your own time!
            </p>
          </div>
        ) : (
          <div className="max-w-xl mx-auto">
            <button onClick={() => { setActiveSection(null); setSelfieBase64(null); }} className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 font-semibold transition-colors text-sm mb-4">
              <ArrowLeft className="w-4 h-4" /> Back to Portal
            </button>
          </div>
        )}

        {/* Dynamic Card rendering */}
        {activeSection ? (
          renderActiveSection()
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* CARD 1: Face Verification */}
            <Card className="border-slate-200/60 shadow-md hover:shadow-xl transition-all duration-300 rounded-3xl bg-white flex flex-col justify-between overflow-hidden relative group">
              <div className="h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500" />
              <CardContent className="p-6 sm:p-8 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                      <Camera className="w-6 h-6" />
                    </div>
                    {status.isPersonVerified ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 border border-green-200 text-green-700 text-xs font-bold rounded-full">
                        <CheckCircle className="w-3.5 h-3.5 text-green-600" /> Verified
                      </span>
                    ) : isFacePending ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold rounded-full">
                        <Loader2 className="w-3.5 h-3.5 text-amber-500 animate-spin" /> Pending Review
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold rounded-full">
                        Unverified
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">Face Verification</h3>
                  <p className="text-slate-500 text-xs sm:text-sm">
                    Take a live camera selfie to authenticate your biometric profile. Renders a verified checkmark badge next to your display name.
                  </p>
                </div>

                <div className="pt-4 mt-auto">
                  {status.isPersonVerified ? (
                    <div className="w-full py-3 px-4 bg-green-50 border border-green-100 text-green-800 text-xs sm:text-sm font-semibold rounded-2xl flex items-center justify-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" /> Biometric Identity Secured
                    </div>
                  ) : isFacePending ? (
                    <div className="w-full py-3 px-4 bg-amber-50 border border-amber-100 text-amber-800 text-xs sm:text-sm font-semibold rounded-2xl text-center">
                      Selfie undergoing moderator review
                    </div>
                  ) : (
                    <Button onClick={() => setActiveSection('face')} className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl flex items-center justify-center gap-2 font-semibold">
                      Start Face Check <ChevronRight className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* CARD 2: Govt ID Verification */}
            <Card className="border-slate-200/60 shadow-md hover:shadow-xl transition-all duration-300 rounded-3xl bg-white flex flex-col justify-between overflow-hidden relative group">
              <div className="h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500" />
              <CardContent className="p-6 sm:p-8 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                      <FileText className="w-6 h-6" />
                    </div>
                    {status.isIdVerified ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 border border-green-200 text-green-700 text-xs font-bold rounded-full">
                        <CheckCircle className="w-3.5 h-3.5 text-green-600" /> Verified
                      </span>
                    ) : isIdPending ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold rounded-full">
                        <Loader2 className="w-3.5 h-3.5 text-amber-500 animate-spin" /> Pending Review
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold rounded-full">
                        Unverified
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">Govt ID Verification</h3>
                  <p className="text-slate-500 text-xs sm:text-sm">
                    Upload an official state document (passport, ID, driver license) to unlock highly-trustworthy profile verification permissions.
                  </p>
                </div>

                <div className="pt-4 mt-auto">
                  {status.isIdVerified ? (
                    <div className="w-full py-3 px-4 bg-green-50 border border-green-100 text-green-800 text-xs sm:text-sm font-semibold rounded-2xl flex items-center justify-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" /> Government Identity Confirmed
                    </div>
                  ) : isIdPending ? (
                    <div className="w-full py-3 px-4 bg-amber-50 border border-amber-100 text-amber-800 text-xs sm:text-sm font-semibold rounded-2xl text-center">
                      Document undergoing moderator review
                    </div>
                  ) : (
                    <Button onClick={() => setActiveSection('govt_id')} className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl flex items-center justify-center gap-2 font-semibold">
                      Upload Govt ID <ChevronRight className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* CARD 3: College Email Verification */}
            <Card className="border-slate-200/60 shadow-md hover:shadow-xl transition-all duration-300 rounded-3xl bg-white flex flex-col justify-between overflow-hidden relative group">
              <div className="h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500" />
              <CardContent className="p-6 sm:p-8 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    {status.isCollegeVerified ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 border border-green-200 text-green-700 text-xs font-bold rounded-full">
                        <CheckCircle className="w-3.5 h-3.5 text-green-600" /> Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold rounded-full">
                        Unverified
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 font-semibold">College ID / Student</h3>
                  <p className="text-slate-500 text-xs sm:text-sm">
                    {status.college ? (
                      <>Verify your academic membership at <strong>{status.college}</strong> instantly via a school email address.</>
                    ) : (
                      <>Verify student campus affiliation using your institutional email address. Renders a checkmark beside college name.</>
                    )}
                  </p>
                </div>

                <div className="pt-4 mt-auto">
                  {status.isCollegeVerified ? (
                    <div className="w-full py-3 px-4 bg-green-50 border border-green-100 text-green-800 text-xs sm:text-sm font-semibold rounded-2xl flex items-center justify-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" /> Academic Campus Vetted
                    </div>
                  ) : (
                    <Button 
                      onClick={() => { setActiveSection('college'); setEmailPurpose('college'); }} 
                      className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl flex items-center justify-center gap-2 font-semibold"
                    >
                      Verify College Email <ChevronRight className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* CARD 4: Work Email Verification */}
            <Card className="border-slate-200/60 shadow-md hover:shadow-xl transition-all duration-300 rounded-3xl bg-white flex flex-col justify-between overflow-hidden relative group">
              <div className="h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500" />
              <CardContent className="p-6 sm:p-8 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    {status.isWorkVerified ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 border border-green-200 text-green-700 text-xs font-bold rounded-full">
                        <CheckCircle className="w-3.5 h-3.5 text-green-600" /> Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold rounded-full">
                        Unverified
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">Work ID / Employed</h3>
                  <p className="text-slate-500 text-xs sm:text-sm">
                    {status.work ? (
                      <>Verify your job position / employer at <strong>{status.work}</strong> via corporate domain business email.</>
                    ) : (
                      <>Verify employment using corporate domain business email OTP. Renders a checkmark beside job title.</>
                    )}
                  </p>
                </div>

                <div className="pt-4 mt-auto">
                  {status.isWorkVerified ? (
                    <div className="w-full py-3 px-4 bg-green-50 border border-green-100 text-green-800 text-xs sm:text-sm font-semibold rounded-2xl flex items-center justify-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" /> Professional Status Vetted
                    </div>
                  ) : (
                    <Button 
                      onClick={() => { setActiveSection('work'); setEmailPurpose('work'); }} 
                      className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl flex items-center justify-center gap-2 font-semibold"
                    >
                      Verify Work Email <ChevronRight className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

          </div>
        )}

      </div>
    </div>
  );
}
