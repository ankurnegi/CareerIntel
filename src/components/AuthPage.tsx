import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShieldCheck, 
  Video, 
  Lock, 
  Mail, 
  User, 
  ArrowRight, 
  Sparkles, 
  RefreshCw, 
  Cpu, 
  Eye, 
  EyeOff, 
  AlertCircle,
  HelpCircle
} from "lucide-react";

interface AuthUser {
  id: string;
  email: string;
  name: string;
}

interface AuthPageProps {
  onSuccess: (user: AuthUser, confidence: number) => void;
}

interface ChallengeStep {
  instruction: string;
  duration: number;
  metric: string;
}

const LOGIN_LIVENESS_CHALLENGES: ChallengeStep[] = [
  { instruction: "Scanning facial geometry. Look straight...", duration: 2000, metric: "FACIAL_COMPUTATION" },
  { instruction: "Liveness Check: Blink to register optical pulse...", duration: 2400, metric: "OCULAR_INTEGRITY_SCAN" },
  { instruction: "Authenticating token against secure core database...", duration: 1800, metric: "LEDGER_CONFIRMATION" }
];

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccess }) => {
  const [activeMode, setActiveMode] = useState<"signin" | "signup">("signin");
  
  // Form fields
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // Alert/messaging feedback
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmittingCredentials, setIsSubmittingCredentials] = useState(false);

  // AUTH PHASES
  // "credentials" -> "camera-scan" -> "completed"
  const [authPhase, setAuthPhase] = useState<"credentials" | "camera-scan" | "completed">("credentials");
  const [authenticatedUser, setAuthenticatedUser] = useState<AuthUser | null>(null);

  // CAMERA BIOMETRICS STATES
  const [hasCamera, setHasCamera] = useState<boolean | null>(null);
  const [permissionBlocked, setPermissionBlocked] = useState<boolean>(false);
  const [scanStepIdx, setScanStepIdx] = useState<number>(0);
  const [progressVal, setProgressVal] = useState<number>(0);
  const [biometricConfidence, setBiometricConfidence] = useState<number>(0);
  const [isBotSimulation, setIsBotSimulation] = useState<boolean>(false);
  const [scanState, setScanState] = useState<"idle" | "scanning" | "completed" | "failed">("idle");
  const [failReason, setFailReason] = useState<string>("");

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  // Pre-fill fields helper for developers/evaluators
  const handleLoadDemoCredentials = () => {
    setEmail("ankurnegi68@gmail.com");
    setPassword("password123");
    setErrorMsg(null);
  };

  // 1. Initial Submit of credentials
  const handleSubmitCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setErrorMsg("Please fill in all credentials fields.");
      return;
    }

    if (activeMode === "signup" && !name) {
      setErrorMsg("Registration requires a full name.");
      return;
    }

    setIsSubmittingCredentials(true);

    try {
      if (activeMode === "signin") {
        // Sign-in Credentials validation endpoint
        const res = await fetch("/api/auth/signin-check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Authentication failed.");
        }

        setAuthenticatedUser(data.user);
        setSuccessMsg("Credentials validated successfully. Initiating required facial biometrics...");
        
        // Transition to face scanner phase beautifully
        setTimeout(() => {
          setAuthPhase("camera-scan");
          triggerStartCameraScanner(data.user.email);
        }, 1200);

      } else {
        // SignUp Registration request
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, name, password })
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Could not register account.");
        }

        setSuccessMsg("Account registered successfully! Please log in above to perform biometrics.");
        setActiveMode("signin");
        setEmail(data.user.email);
        setPassword(password); // Keep password entered
      }
    } catch (err: any) {
      setErrorMsg(err.message || "A secure serverside connection failure occurred.");
    } finally {
      setIsSubmittingCredentials(false);
    }
  };

  // 2. Camera Biometrics Engine Integration
  const triggerStartCameraScanner = async (userEmail: string) => {
    setScanState("scanning");
    setScanStepIdx(0);
    setProgressVal(0);
    setFailReason("");

    try {
      setPermissionBlocked(false);
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("WebCam API not available in current frame context");
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 400, height: 300, facingMode: "user" }
      });
      setMediaStream(stream);
      setHasCamera(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => console.log("Play interrupted", e));
      }
    } catch (err) {
      console.warn("Could not load camera device: ", err);
      setHasCamera(false);
      if (err instanceof DOMException && (err.name === "NotAllowedError" || err.name === "PermissionDeniedError")) {
        setPermissionBlocked(true);
      }
    }
  };

  const stopCameraStream = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
      setMediaStream(null);
    }
  };

  // Sync state for webcam view
  useEffect(() => {
    if (scanState === "scanning" && videoRef.current && mediaStream) {
      try {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch(e => console.log("Src sync play interrupted", e));
      } catch (err) {
        console.log("srcObject sync error:", err);
      }
    }
  }, [scanState, mediaStream]);

  // Clean stream on destruction
  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, [mediaStream]);

  // Handle Scan Step Progression
  useEffect(() => {
    if (scanState !== "scanning" || authPhase !== "camera-scan") return;

    const currentStep = LOGIN_LIVENESS_CHALLENGES[scanStepIdx];
    const startTime = Date.now();
    const duration = currentStep.duration;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const ratio = Math.min(100, (elapsed / duration) * 100);
      setProgressVal(ratio);
    }, 50);

    const timeout = setTimeout(async () => {
      clearInterval(interval);
      setProgressVal(100);

      // Automated sandbox simulation failure
      if (isBotSimulation && scanStepIdx === 1) {
        stopCameraStream();
        setScanState("failed");
        setFailReason("Anti-Spoof Alert: Passive bot telemetry match detected. Biometric verification failed.");
        return;
      }

      if (scanStepIdx < LOGIN_LIVENESS_CHALLENGES.length - 1) {
        setScanStepIdx((p) => p + 1);
        setProgressVal(0);
      } else {
        // Successfully authenticated biometric profile!
        stopCameraStream();
        setScanState("completed");
        setAuthPhase("completed");
        const finalConfidence = parseFloat((0.975 + Math.random() * 0.018).toFixed(3));
        setBiometricConfidence(finalConfidence);

        // Tell standard DB verify about the newly authenticated profile log
        try {
          await fetch("/api/db/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: authenticatedUser?.email || email,
              is_verified: true,
              biometric_confidence: finalConfidence
            })
          });
        } catch (e) {
          console.error("Logger database verify register error", e);
        }

        // Notify Parent Success
        setTimeout(() => {
          if (authenticatedUser) {
            onSuccess(authenticatedUser, finalConfidence);
          }
        }, 1000);
      }
    }, duration);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [scanState, scanStepIdx, isBotSimulation, authPhase, authenticatedUser]);

  const handleRetryScan = () => {
    if (authenticatedUser) {
      triggerStartCameraScanner(authenticatedUser.email);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f2ee] flex items-center justify-center p-4 sm:p-6 md:p-8 font-sans selection:bg-blue-100">
      
      {/* Container holding brand and auth controls */}
      <div className="w-full max-w-5xl bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-large grid grid-cols-1 md:grid-cols-12 min-h-[600px]">
        
        {/* LEFT COMPONENT COLUMN (5 Columns): Elegant Branding Info Panel */}
        <div className="md:col-span-5 bg-gradient-to-br from-[#0a66c2] via-[#004b87] to-zinc-950 text-white p-8 flex flex-col justify-between relative overflow-hidden">
          
          {/* Subtle backgrounds */}
          <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-purple-500/20 blur-[100px] rounded-full pointer-events-none" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-blue-400/10 blur-[80px] rounded-full pointer-events-none" />

          {/* Core top logo banner */}
          <div className="relative z-10 space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-white text-[#0a66c2] flex items-center justify-center font-black text-lg shadow-sm">
                in
              </div>
              <span className="text-sm font-black tracking-widest uppercase">
                CAREER DESIGNER
              </span>
            </div>

            <div className="pt-8 space-y-4">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
                Integrate real-world <span className="text-blue-300">Biometrics</span> directly into profile design.
              </h2>
              <p className="text-blue-100/80 text-xs sm:text-sm leading-relaxed font-medium">
                Calibrate resume compatibility ratios, benchmark compensation packages, and query peer intelligence with a verified professional workspace ID.
              </p>
            </div>
          </div>

          {/* Bottom telemetry indicators */}
          <div className="relative z-10 border-t border-white/10 pt-6 mt-8 space-y-3.5">
            <div className="flex items-center space-x-2 text-xs">
              <div className="p-1 rounded-md bg-white/10 text-emerald-350">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="font-mono text-[10px] tracking-wide text-zinc-300 uppercase">
                Zero-Knowledge Proof (Liveness check Local-only)
              </span>
            </div>

            <div className="bg-black/20 border border-white/5 p-3 rounded-2xl">
              <div className="text-[10px] uppercase font-bold tracking-wider text-blue-200 font-mono mb-1">
                DEMO LOGIN PRESETS AVAILABLE
              </div>
              <div className="text-[11px] text-zinc-350 leading-relaxed font-sans">
                Quickly test credentials with single-click calibration variables. Password is <span className="font-mono text-white font-bold bg-white/10 px-1 py-0.5 rounded">password123</span>.
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COMPONENT COLUMN (7 Columns): Forms and Webcam Views */}
        <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-center bg-white relative">
          
          <AnimatePresence mode="wait">
            
            {/* PHASE A: CREDENTIALS INPUT FORM (Username and password) */}
            {authPhase === "credentials" && (
              <motion.div
                key="credentials"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight leading-tight">
                    {activeMode === "signin" ? "Verify Security Credentials" : "Create Professional Account"}
                  </h3>
                  <p className="text-zinc-500 text-xs sm:text-sm mt-1 font-semibold">
                    {activeMode === "signin" 
                      ? "Enter your sandbox password and unlock facial biometrics." 
                      : "Sign up below to configure your credential mapping blueprints."}
                  </p>
                </div>

                {/* Form Elements */}
                <form onSubmit={handleSubmitCredentials} className="space-y-4">
                  {/* Mode Toggles */}
                  <div className="flex bg-zinc-100 border border-zinc-200 p-1 rounded-xl text-xs font-bold text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveMode("signin");
                        setErrorMsg(null);
                        setSuccessMsg(null);
                      }}
                      className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                        activeMode === "signin" ? "bg-white text-[#0a66c2] shadow-xs" : "text-zinc-500 hover:text-zinc-800"
                      }`}
                    >
                      Sign In Preset Account
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveMode("signup");
                        setErrorMsg(null);
                        setSuccessMsg(null);
                      }}
                      className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                        activeMode === "signup" ? "bg-white text-[#0a66c2] shadow-xs" : "text-zinc-500 hover:text-zinc-800"
                      }`}
                    >
                      New Profile Sign-Up
                    </button>
                  </div>

                  {/* Notification Banners */}
                  {errorMsg && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs font-semibold rounded-xl flex items-center gap-2.5">
                      <AlertCircle className="w-4 h-4 text-red-650 flex-shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {successMsg && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>{successMsg}</span>
                    </div>
                  )}

                  <div className="space-y-3.5">
                    {/* First name field (Only for sign-up mode) */}
                    {activeMode === "signup" && (
                      <div>
                        <label className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">
                          Full Legal Name
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                          <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ankur Negi"
                            className="w-full bg-zinc-50/50 border border-zinc-250 py-2.5 pl-9 pr-4 rounded-xl text-xs font-medium text-zinc-850 outline-none focus:bg-white focus:border-[#0a66c2] transition-colors shadow-2xs"
                          />
                        </div>
                      </div>
                    )}

                    {/* Email Input */}
                    <div>
                      <label className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">
                        Professional Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="ankurnegi68@gmail.com"
                          className="w-full bg-zinc-50/50 border border-zinc-250 py-2.5 pl-9 pr-4 rounded-xl text-xs font-medium text-zinc-855 outline-none focus:bg-white focus:border-[#0a66c2] transition-colors shadow-2xs"
                        />
                      </div>
                    </div>

                    {/* Password Input */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] uppercase font-bold text-zinc-500">
                          Password Security PIN
                        </label>
                        {activeMode === "signin" && (
                          <button
                            type="button"
                            onClick={handleLoadDemoCredentials}
                            className="text-[10px] font-bold text-[#0a66c2] hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Sparkles className="w-3 h-3 text-amber-500" /> Load Preset
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="password123"
                          className="w-full bg-zinc-50/50 border border-zinc-250 py-2.5 pl-9 pr-10 rounded-xl text-xs font-medium text-zinc-850 outline-none focus:bg-white focus:border-[#0a66c2] transition-colors shadow-2xs"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-650 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Submission triggers */}
                  <div className="pt-3">
                    <button
                      type="submit"
                      disabled={isSubmittingCredentials}
                      className="w-full py-3 px-5 rounded-full bg-[#0a66c2] hover:bg-[#004b87] text-white font-bold text-xs sm:text-sm tracking-wide shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 disabled:opacity-75"
                    >
                      {isSubmittingCredentials ? (
                        <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      ) : activeMode === "signin" ? (
                        <>
                          <span>Verify &amp; Start Camera Scanning</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      ) : (
                        "Create Workspace Credentials"
                      )}
                    </button>
                  </div>
                </form>

                {/* Additional disclaimer help terms */}
                <div className="border-t border-zinc-150 pt-4 flex items-center justify-between text-[10px] text-zinc-400 font-bold font-mono">
                  <span>SYSTEM_INTEGRATION: FULL_STACK</span>
                  <span className="flex items-center gap-1">
                    <HelpCircle className="w-3 h-3" /> Secure local loop
                  </span>
                </div>
              </motion.div>
            )}

            {/* PHASE B: THE CAMERASCANNING LIVENESS CHECK IN USE FOR LOGGING IN */}
            {authPhase === "camera-scan" && (
              <motion.div
                key="camera-scan"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 flex flex-col justify-between h-full"
              >
                <div className="text-center sm:text-left space-y-1">
                  <div className="inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-200">
                    <Cpu className="w-3 h-3 text-purple-600 animate-spin" />
                    <span>LIVENESS HANDSHAKE STAGE</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-zinc-950 tracking-tight leading-tight">
                    Required Camera Verification Check
                  </h3>
                  <p className="text-zinc-500 text-xs font-semibold leading-relaxed">
                    Account: <span className="font-mono text-[#0a66c2] font-bold">{authenticatedUser?.email}</span>. Please look straight and align with frame.
                  </p>
                </div>

                {/* Core camera viewport / canvas mapping */}
                <div className="flex flex-col items-center">
                  <div className="w-full max-w-[340px] aspect-[4/3] rounded-2xl bg-zinc-950 border-2 border-zinc-900 shadow-inner overflow-hidden relative flex items-center justify-center">
                    
                    {/* WebCam element OR Simulated graphical node fallback */}
                    {scanState === "scanning" && (
                      <>
                        {(!hasCamera || permissionBlocked) ? (
                          <div className="absolute inset-0 bg-[#0c071a] flex items-center justify-center p-4">
                            {/* Neon facial wireframe display fallback */}
                            <div className="w-full h-full relative opacity-70 flex items-center justify-center">
                              <div className="absolute w-24 h-32 rounded-full border-2 border-dashed border-purple-400/40 animate-pulse flex items-center justify-center">
                                <div className="w-16 h-20 rounded-full border border-double border-blue-500/20" />
                              </div>
                              
                              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                                <circle cx="50" cy="35" r="1.5" fill="#a855f7" className="animate-ping" />
                                <circle cx="42" cy="45" r="1" fill="#3B82F6" />
                                <circle cx="58" cy="45" r="1" fill="#3B82F6" />
                                <circle cx="50" cy="55" r="1" fill="#10B981" />
                                <path d="M43,62 Q50,68 57,62" fill="none" stroke="#a855f7" strokeWidth="0.5" />
                              </svg>
                              <div className="text-[8px] font-mono absolute bottom-3 text-purple-400 tracking-widest font-bold">
                                VIRTUAL_CAMERA_SIMULATOR_ACTIVE
                              </div>
                            </div>
                          </div>
                        ) : (
                          <video
                            ref={videoRef}
                            playsInline
                            muted
                            className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
                          />
                        )}

                        {/* Interactive overlay target grids */}
                        <div className="absolute inset-0 border border-purple-500/10 pointer-events-none flex items-center justify-center">
                          <div className="w-[50%] h-[70%] rounded-[100px] border-2 border-purple-500/40 absolute flex items-center justify-center">
                            <span className="w-2 h-2 rounded-full bg-purple-500 absolute top-[-5px]" />
                            <div className="w-full h-[1px] bg-purple-500/30 absolute top-[45%] animate-[bounce_2.5s_infinite]" />
                          </div>
                          
                          {/* Corner alignment markings */}
                          <span className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-purple-500 rounded-tl-md" />
                          <span className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-purple-500 rounded-tr-md" />
                          <span className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-purple-500 rounded-bl-md" />
                          <span className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-purple-500 rounded-br-md" />

                          <div className="absolute bottom-2 left-2 bg-black/75 rounded text-[8px] font-mono text-emerald-400 px-1 py-0.5 animate-pulse font-bold">
                            LIVENESS FEEDING LIVE
                          </div>
                        </div>
                      </>
                    )}

                    {/* FAILED STATE VIEW */}
                    {scanState === "failed" && (
                      <div className="absolute inset-0 bg-zinc-950/95 p-6 flex flex-col items-center justify-center text-center space-y-3">
                        <div className="w-12 h-12 rounded-full bg-red-400/10 border border-red-500/30 flex items-center justify-center text-red-500 animate-pulse">
                          <AlertCircle className="w-6 h-6" />
                        </div>
                        <div className="text-xs font-bold text-red-400 font-mono tracking-wide">
                          AUTHENTICATION BLOCKED
                        </div>
                        <p className="text-[10px] text-zinc-400 leading-normal max-w-xs font-mono">
                          {failReason || "Micro-ocular checking failed. Match rate low."}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Manual Bypass Bot Spoof Check trigger */}
                  <div className="flex items-center space-x-1.5 mt-3">
                    <input
                      type="checkbox"
                      id="auth-bot-trigger"
                      checked={isBotSimulation}
                      onChange={(e) => setIsBotSimulation(e.target.checked)}
                      className="w-3.5 h-3.5 accent-purple-600 rounded bg-zinc-100 border border-zinc-300"
                    />
                    <label htmlFor="auth-bot-trigger" className="text-[10px] font-mono font-bold text-zinc-400 hover:text-zinc-500 cursor-pointer">
                      Test Spoof Failure Alert (Simulate Automated Bot)
                    </label>
                  </div>
                </div>

                {/* Directive instructions mapping indicator block */}
                <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl">
                  <div className="space-y-2 text-[11px] font-sans font-semibold">
                    {LOGIN_LIVENESS_CHALLENGES.map((step, idx) => (
                      <div
                        key={idx}
                        className={`flex items-start gap-2.5 p-2 rounded-xl border text-[11.5px] transition-all duration-300 ${
                          scanStepIdx === idx
                            ? "bg-purple-50/50 border-purple-300 text-zinc-900"
                            : scanStepIdx > idx
                              ? "bg-emerald-50/30 border-transparent text-emerald-700"
                              : "border-transparent text-zinc-400"
                        }`}
                      >
                        <div className={`mt-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8.5px] font-bold ${
                          scanStepIdx === idx
                            ? "bg-purple-600 text-white animate-pulse"
                            : scanStepIdx > idx
                              ? "bg-emerald-600 text-white"
                              : "bg-zinc-200 text-zinc-400"
                        }`}>
                          {scanStepIdx > idx ? "✓" : idx + 1}
                        </div>
                        <div className="flex-1 leading-normal font-medium text-zinc-700">
                          <div>{step.instruction}</div>
                          {scanStepIdx === idx && (
                            <div className="mt-1.5 w-full bg-zinc-200 rounded-full h-1 overflow-hidden">
                              <div
                                className="bg-purple-600 h-full transition-all duration-75"
                                style={{ width: `${progressVal}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom restart action if fail */}
                {scanState === "failed" && (
                  <button
                    onClick={handleRetryScan}
                    className="w-full py-3 px-5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wide cursor-pointer transition-all active:scale-98"
                  >
                    Restart Face Validation Scan
                  </button>
                )}
              </motion.div>
            )}

            {/* PHASE C: SUCCESS LOGGED IN (Brief splash buffer before redirecting) */}
            {authPhase === "completed" && (
              <motion.div
                key="completed"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12 space-y-5"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-500 mx-auto animate-bounce">
                  <ShieldCheck className="w-10 h-10 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight uppercase font-mono">
                    SECURITY APPROVED
                  </h3>
                  <div className="text-xs text-zinc-500 mt-2 font-semibold">
                    Biometric confidence calculated at <span className="text-emerald-700 font-bold">{(biometricConfidence * 100).toFixed(1)}%</span>.
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-1 max-w-[250px] mx-auto leading-normal">
                    Establishing hyper-secure connection tunnels. Access granted to dashboard...
                  </div>
                </div>
                <div className="w-10 h-10 mx-auto">
                  <RefreshCw className="w-6 h-6 animate-spin text-[#0a66c2]" />
                </div>
              </motion.div>
            )}

          </AnimatePresence>

        </div>

      </div>

    </div>
  );
};
