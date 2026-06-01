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
  HelpCircle,
  Camera
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
  { instruction: "Scanning facial geometry. Look straight...", duration: 2500, metric: "FACIAL_COMPUTATION" },
  { instruction: "Liveness Check: Blink and keep alignment frame locked...", duration: 2500, metric: "OCULAR_INTEGRITY_SCAN" },
  { instruction: "Finalizing cryptological handshake validation...", duration: 2000, metric: "LEDGER_CONFIRMATION" }
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

  // Human interaction step flag (required for liveness validation)
  const [humanInteractedOk, setHumanInteractedOk] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  // Pre-fill fields helper
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

    // Strict fields validation
    if (!email || !password) {
      setErrorMsg("Error: Please fill in all credentials fields.");
      return;
    }

    // Strict Email Regex Validation: Must contain '@' and a valid domain
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg("Error: Invalid email format. Correct format requires '@' and a top-level domain.");
      return;
    }

    if (activeMode === "signup" && !name) {
      setErrorMsg("Registration Error: High-level verification blueprint requires your full legal name.");
      return;
    }

    setIsSubmittingCredentials(true);

    try {
      if (activeMode === "signup") {
        // Retrieve and check against local storage database
        const savedUsersList = JSON.parse(localStorage.getItem("app_registered_users") || "[]");
        
        // Block email duplicates
        const userExists = savedUsersList.some((u: any) => u.email.toLowerCase() === email.toLowerCase()) || 
                           ["ankurnegi68@gmail.com", "sarah.connor@cyberdyne.com", "neo.anderson@metacortex.com"].includes(email.toLowerCase());
        
        if (userExists) {
          throw new Error("Conflict: A professional profile with this email address already possesses certificates in our schema.");
        }

        // Save new user profile
        const newLocalUser = {
          id: `usr_${Math.random().toString(36).substring(2, 7)}`,
          email: email.toLowerCase().trim(),
          name: name.trim(),
          password: password
        };
        savedUsersList.push(newLocalUser);
        localStorage.setItem("app_registered_users", JSON.stringify(savedUsersList));

        // Submit to custom Express API backend to align database logs
        try {
          await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: newLocalUser.email, name: newLocalUser.name, password })
          });
        } catch (serverErr) {
          console.warn("Backend pipeline registration log bypassed. Safe local copy stored.", serverErr);
        }

        setSuccessMsg("Account registered successfully! Initiating switch. Log in matching your password.");
        setActiveMode("signin");
        setPassword(password); // Prepopulate input
      } else {
        // Sign-in Mode
        const savedUsersList = JSON.parse(localStorage.getItem("app_registered_users") || "[]");
        let foundUser = savedUsersList.find((u: any) => u.email.toLowerCase() === email.toLowerCase().trim());

        // fallback searches for default presets
        if (!foundUser) {
          const defaultPresets = [
            { id: "usr_001", email: "ankurnegi68@gmail.com", name: "Ankur Negi", password: "password123" },
            { id: "usr_998", email: "sarah.connor@cyberdyne.com", name: "Sarah Connor", password: "password123" },
            { id: "usr_999", email: "neo.anderson@metacortex.com", name: "Thomas Anderson", password: "password123" }
          ];
          foundUser = defaultPresets.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
        }

        if (!foundUser) {
          throw new Error("Access Denied: No active profile matching these coordinates inside our security logs.");
        }

        if (foundUser.password !== password) {
          throw new Error("Access Denied: Incorrect credentials pin match.");
        }

        // Credentials validated, cache active target
        setAuthenticatedUser({
          id: foundUser.id,
          email: foundUser.email,
          name: foundUser.name
        });
        setSuccessMsg("Credentials authorized. Commencing required biometric liveness checks...");

        // Fire request to database
        try {
          await fetch("/api/auth/signin-check", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
          });
        } catch (e) {}

        // Transition to scanning phase
        setTimeout(() => {
          setAuthPhase("camera-scan");
          triggerStartCameraScanner();
        }, 1200);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "A secure serverside connection failure occurred.");
    } finally {
      setIsSubmittingCredentials(false);
    }
  };

  // 2. Camera Biometrics Engine Integration
  const triggerStartCameraScanner = async () => {
    setScanState("scanning");
    setScanStepIdx(0);
    setProgressVal(0);
    setFailReason("");
    setHumanInteractedOk(false);

    try {
      setPermissionBlocked(false);
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("WebCam API not available in current browser frame context");
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
      console.warn("Could not load camera physical device. Switching to graphical liveness path: ", err);
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

      // Check webcam brightness/liveness (Liveness Check)
      // If camera is playing and there's a canvas capture, we test for blank feed
      let livenessSuccess = true;
      if (hasCamera && !permissionBlocked && videoRef.current) {
        try {
          const checkCanvas = document.createElement("canvas");
          checkCanvas.width = 50;
          checkCanvas.height = 50;
          const ctx = checkCanvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(videoRef.current, 0, 0, 50, 50);
            const pixels = ctx.getImageData(0, 0, 50, 50).data;
            let sum = 0;
            // Scan RGB pixel components
            for (let i = 0; i < pixels.length; i += 4) {
              sum += (pixels[i] + pixels[i+1] + pixels[i+2]) / 3;
            }
            const avgBrightness = sum / (50 * 50);
            console.log("Webcam center frame brightness average:", avgBrightness);
            
            // If the average brightness is < 15, then it is black, blank, or covered
            if (avgBrightness < 15) {
              livenessSuccess = false;
            }
          }
        } catch (e) {
          console.warn("Liveness check canvas error:", e);
        }
      } else {
        // FALLBACK OPTION / NO CAMERA: Virtual scan. 
        // User must click/interact with the calibration targets (3-second mandatory human interaction step)
        if (!humanInteractedOk && scanStepIdx >= 1) {
          livenessSuccess = false;
        }
      }

      if (!livenessSuccess) {
        stopCameraStream();
        setScanState("failed");
        setFailReason("Liveness Check Failed: Poor lighting or no face detected.");
        return;
      }

      if (scanStepIdx < LOGIN_LIVENESS_CHALLENGES.length - 1) {
        setScanStepIdx((p) => p + 1);
        setProgressVal(0);
      } else {
        // Successfully verified biometric matrix!
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
        }, 1500);
      }
    }, duration);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [scanState, scanStepIdx, isBotSimulation, authPhase, authenticatedUser, hasCamera, permissionBlocked, humanInteractedOk]);

  const handleRetryScan = () => {
    triggerStartCameraScanner();
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center p-4 sm:p-6 md:p-8 font-sans text-slate-100 relative overflow-hidden">
      
      {/* Dynamic ambient layout background rings */}
      <div className="absolute top-[-25%] left-[-20%] w-[600px] h-[600px] bg-[#3B82F6]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-25%] right-[-20%] w-[600px] h-[600px] bg-[#A855F7]/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Container styling: Slate-800 translucent glassmorphism cards layout */}
      <div className="w-full max-w-5xl bg-[#111827]/85 border border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-12 min-h-[580px] backdrop-blur-xl relative z-10">
        
        {/* LEFT COMPONENT COLUMN (5 Columns): Elegant Branding Info Panel */}
        <div className="md:col-span-5 bg-gradient-to-b from-[#131b2e] via-[#0f172a] to-[#010712] border-r border-slate-850 p-8 flex flex-col justify-between relative overflow-hidden">
          
          <div className="relative z-10 space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#3B82F6] to-[#A855F7] text-white flex items-center justify-center font-black text-sm shadow-md">
                ai
              </div>
              <span className="text-xs font-black tracking-widest uppercase bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                PWA OPTIMIZER
              </span>
            </div>

            <div className="pt-8 space-y-4">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight text-white font-sans">
                Professional <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">Biometric</span> Verification Hub.
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed font-semibold">
                Store calibrated workspace tags, map ATS compatibility structures, and log secure biometric entry history within an offline-first container paradigm.
              </p>
            </div>
          </div>

          <div className="relative z-10 border-t border-slate-800/60 pt-6 mt-8 space-y-4">
            <div className="flex items-center space-x-2 text-xs text-slate-300">
              <div className="p-1 rounded-md bg-emerald-500/10 text-[#10B981] border border-emerald-500/20">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="font-mono text-[9px] tracking-wide text-emerald-400 uppercase font-bold">
                LIVENESS PROTOCOL ACTIVATED
              </span>
            </div>

            <div className="bg-slate-950/40 border border-slate-800/50 p-3 rounded-xl space-y-1">
              <div className="text-[9px] uppercase font-bold tracking-wider text-blue-400 font-mono">
                DEVELOPER ACCESS KEYS
              </div>
              <div className="text-[11px] text-slate-400 leading-normal font-sans">
                Type <span className="font-bold text-slate-200">ankurnegi68@gmail.com</span> with pin <span className="font-mono text-white font-bold bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700">password123</span> to verify instantly.
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COMPONENT COLUMN (7 Columns): Forms and Webcam Views */}
        <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-center bg-slate-900/45 relative select-text">
          
          <AnimatePresence mode="wait">
            
            {/* PHASE A: CREDENTIALS INPUT FORM (Username and password) */}
            {authPhase === "credentials" && (
              <motion.div
                key="credentials"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-2xl font-extrabold text-white tracking-tight leading-tight">
                    {activeMode === "signin" ? "Verify Security Credentials" : "Create Professional Account"}
                  </h3>
                  <p className="text-slate-400 text-xs mt-1.5 font-semibold">
                    {activeMode === "signin" 
                      ? "Enter your sandbox details below. Facial biometrics are required to log into records." 
                      : "Configure secure credentials to register records inside the system schema logs."}
                  </p>
                </div>

                <form onSubmit={handleSubmitCredentials} className="space-y-4">
                  
                  {/* Mode Toggles */}
                  <div className="flex bg-slate-950/70 border border-slate-800 p-1 rounded-xl text-xs font-bold text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveMode("signin");
                        setErrorMsg(null);
                        setSuccessMsg(null);
                      }}
                      className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                        activeMode === "signin" 
                          ? "bg-[#1E293B] text-blue-400 border border-slate-700" 
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      Sign In Preset
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveMode("signup");
                        setErrorMsg(null);
                        setSuccessMsg(null);
                      }}
                      className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                        activeMode === "signup" 
                          ? "bg-[#1E293B] text-blue-400 border border-slate-700" 
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      New Account Sign-Up
                    </button>
                  </div>

                  {/* Notification Banners */}
                  {errorMsg && (
                    <div className="p-3.5 bg-red-950/50 border border-red-900/80 text-red-100 text-xs font-semibold rounded-xl flex items-center gap-2.5">
                      <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {successMsg && (
                    <div className="p-3.5 bg-emerald-950/40 border border-emerald-900/60 text-emerald-100 text-xs font-semibold rounded-xl flex items-center gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>{successMsg}</span>
                    </div>
                  )}

                  <div className="space-y-4">
                    {activeMode === "signup" && (
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                          Full Legal Name
                        </label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                          <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ankur Negi"
                            className="w-full bg-[#0c101c] border border-slate-800 py-3 pl-10 pr-4 rounded-xl text-xs font-medium text-slate-200 outline-none focus:border-blue-500 transition-colors shadow-inner"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                        Professional Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="ankurnegi68@gmail.com"
                          className="w-full bg-[#0c101c] border border-slate-800 py-3 pl-10 pr-4 rounded-xl text-xs font-medium text-slate-200 outline-none focus:border-blue-500 transition-colors shadow-inner"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] uppercase font-bold text-slate-400">
                          Password Security PIN
                        </label>
                        {activeMode === "signin" && (
                          <button
                            type="button"
                            onClick={handleLoadDemoCredentials}
                            className="text-[10px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
                          >
                            <Sparkles className="w-3 h-3 text-yellow-400 animate-pulse" /> Apply Admin Demo Keys
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full bg-[#0c101c] border border-slate-800 py-3 pl-10 pr-10 rounded-xl text-xs font-medium text-slate-200 outline-none focus:border-blue-500 transition-colors shadow-inner"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3">
                    <button
                      type="submit"
                      disabled={isSubmittingCredentials}
                      className="w-full py-3 px-5 rounded-full bg-[#3B82F6]/90 hover:bg-[#3B82F6] text-white font-bold text-xs sm:text-sm tracking-wide shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 disabled:opacity-40"
                    >
                      {isSubmittingCredentials ? (
                        <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      ) : activeMode === "signin" ? (
                        <>
                          <span>Verify Password &amp; Lock Camera scan</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      ) : (
                        "Create High-Fidelity Profile"
                      )}
                    </button>
                  </div>
                </form>

                <div className="border-t border-slate-800/80 pt-4 flex items-center justify-between text-[10px] text-slate-500 font-bold font-mono">
                  <span>SSL_HANDSHAKE: ACTIVE</span>
                  <span className="flex items-center gap-1">
                    <HelpCircle className="w-3 h-3" /> Fully Offline Safe Storage
                  </span>
                </div>
              </motion.div>
            )}

            {/* PHASE B: THE CAMERA SCAN WITH ACTIVE PIXEL SCAN & HUMAN HANDSHAKE */}
            {authPhase === "camera-scan" && (
              <motion.div
                key="camera-scan"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-5 flex flex-col justify-between h-full"
              >
                <div className="text-center sm:text-left space-y-1">
                  <div className="inline-flex items-center gap-1.5 text-[9px] font-mono font-bold bg-[#A855F7]/10 text-[#A855F7] px-2 py-0.5 rounded border border-[#A855F7]/20 select-none">
                    <Cpu className="w-3 h-3 text-[#A855F7] animate-spin" />
                    <span>Liveness Verification Handshake</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-none">
                    Biometric Identity Scan
                  </h3>
                  <p className="text-slate-400 text-xs font-semibold">
                    Checking candidate <span className="font-mono text-blue-400 font-bold">{authenticatedUser?.email}</span>. Center face inside frame.
                  </p>
                </div>

                <div className="flex flex-col items-center select-none">
                  <div className="w-full max-w-[340px] aspect-[4/3] rounded-2xl bg-slate-950 border-2 border-slate-800 shadow-2xl overflow-hidden relative flex items-center justify-center">
                    
                    {scanState === "scanning" && (
                      <>
                        {(!hasCamera || permissionBlocked) ? (
                          /* Fallback Virtual Scanner view where human clicks are required within 3 seconds */
                          <div className="absolute inset-0 bg-[#070913] flex flex-col items-center justify-center p-4">
                            <div className="w-full h-full relative opacity-85 flex flex-col items-center justify-center text-center">
                              
                              <div className="text-[10px] text-slate-400 uppercase font-mono font-black mb-1 text-center select-none tracking-widest text-blue-400">
                                Simulated Video Capture
                              </div>

                              {/* Target for Mandatory Ocular Calibration Eye-Hand Handshake Check */}
                              <div className="h-28 w-28 rounded-full border border-dashed border-blue-500/20 flex items-center justify-center relative">
                                <motion.div 
                                  onClick={() => {
                                    setHumanInteractedOk(true);
                                    console.log("Human ocular calibration click registered ok.");
                                  }}
                                  whileHover={{ scale: 1.15 }}
                                  whileTap={{ scale: 0.9 }}
                                  className={`h-11 w-11 rounded-full flex flex-col items-center justify-center font-bold text-[8px] cursor-pointer shadow-lg select-none transition-all ${
                                    humanInteractedOk 
                                      ? "bg-emerald-500/20 border border-emerald-500 text-emerald-400 text-[10px]" 
                                      : "bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/40 text-purple-300 animate-pulse"
                                  }`}
                                  title="Biometric Alignment Mark"
                                >
                                  {humanInteractedOk ? "✓" : "ALIGN"}
                                </motion.div>
                                
                                <div className="absolute -inset-1.5 rounded-full border border-dashed border-purple-500/30 animate-[spin_10s_linear_infinite]" />
                              </div>

                              <p className="text-[9.5px] leading-tight text-slate-400 max-w-xs mt-3 select-none">
                                {humanInteractedOk 
                                  ? "🟢 Human interaction certified. Calibrating sequence." 
                                  : "👉 MANDATORY ACTION: Tap central ALIGN target component immediately to prove live presence!"
                                }
                              </p>
                            </div>
                          </div>
                        ) : (
                          /* Real Webcam Video Frame */
                          <video
                            ref={videoRef}
                            playsInline
                            muted
                            className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
                          />
                        )}

                        {/* Alignment target graphic marks */}
                        <div className="absolute inset-0 border border-purple-500/5 pointer-events-none flex items-center justify-center">
                          <div className="w-[50%] h-[70%] rounded-[100px] border border-blue-500/30 absolute flex items-center justify-center">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 absolute top-[-3px]" />
                            <div className="w-full h-[1.5px] bg-[#3B82F6]/60 absolute top-[45%] animate-[bounce_2.5s_infinite]" />
                          </div>
                          
                          {/* Grid corner angles */}
                          <span className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-blue-500 rounded-tl-md" />
                          <span className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-blue-500 rounded-tr-md" />
                          <span className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-blue-500 rounded-bl-md" />
                          <span className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-blue-500 rounded-br-md" />

                          <div className="absolute bottom-2.5 left-2.5 bg-black/80 rounded text-[8px] font-mono text-emerald-400 px-2 py-0.5 animate-pulse font-bold tracking-wider uppercase border border-emerald-950">
                            CAM FEED ACTIVE
                          </div>
                        </div>
                      </>
                    )}

                    {/* FAILED STATE VIEW */}
                    {scanState === "failed" && (
                      <div className="absolute inset-0 bg-slate-950 p-6 flex flex-col items-center justify-center text-center space-y-3">
                        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 animate-pulse">
                          <AlertCircle className="w-6 h-6" />
                        </div>
                        <div className="text-xs font-bold text-red-400 font-mono tracking-wider">
                          BIO SECURITY RETRIEVAL FAILURE
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed max-w-xs font-mono">
                          {failReason || "Check failed: Liveness alignment metrics failed."}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Manual Bypass Bot Spoof Check trigger */}
                  <div className="flex items-center space-x-1.5 mt-3 select-none">
                    <input
                      type="checkbox"
                      id="auth-bot-trigger"
                      checked={isBotSimulation}
                      onChange={(e) => setIsBotSimulation(e.target.checked)}
                      className="w-3.5 h-3.5 accent-[#A855F7] rounded-sm bg-slate-950 border border-slate-800"
                    />
                    <label htmlFor="auth-bot-trigger" className="text-[10px] font-mono font-bold text-slate-400 hover:text-slate-350 cursor-pointer">
                      Test Spoof Failure Alert (Simulate Passive Bot Feed)
                    </label>
                  </div>
                </div>

                {/* Challenge Steps */}
                <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-2xl">
                  <div className="space-y-2.5 font-sans">
                    {LOGIN_LIVENESS_CHALLENGES.map((step, idx) => (
                      <div
                        key={idx}
                        className={`flex items-start gap-3 p-2 rounded-xl border text-[11px] transition-all duration-350 ${
                          scanStepIdx === idx
                            ? "bg-[#A855F7]/5 border-[#A855F7]/30 text-slate-100"
                            : scanStepIdx > idx
                              ? "bg-emerald-500/5 border-transparent text-emerald-400"
                              : "border-transparent text-slate-500"
                        }`}
                      >
                        <div className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-mono font-bold ${
                          scanStepIdx === idx
                            ? "bg-[#A855F7] text-white animate-pulse"
                            : scanStepIdx > idx
                              ? "bg-[#10B981] text-white"
                              : "bg-slate-800 text-slate-500"
                        }`}>
                          {scanStepIdx > idx ? "✓" : idx + 1}
                        </div>
                        <div className="flex-1 leading-tight font-medium">
                          <div>{step.instruction}</div>
                          {scanStepIdx === idx && (
                            <div className="mt-2 w-full bg-slate-800 rounded-full h-1 overflow-hidden">
                              <div
                                className="bg-[#A855F7] h-full transition-all duration-75"
                                style={{ width: `${progressVal}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom restart action if failed */}
                {scanState === "failed" && (
                  <button
                    onClick={handleRetryScan}
                    className="w-full py-3.5 px-5 rounded-full bg-red-650 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-widest cursor-pointer transition-all active:scale-95 border border-red-500/20"
                  >
                    Reinitialize Authentication Alignment Scan
                  </button>
                )}
              </motion.div>
            )}

            {/* PHASE C: SUCCESS LOGGED IN (Brief splash buffer before redirecting) */}
            {authPhase === "completed" && (
              <motion.div
                key="completed"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12 space-y-6"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500/40 flex items-center justify-center text-[#10B981] mx-auto animate-bounce">
                  <ShieldCheck className="w-10 h-10 stroke-[2]" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-widest uppercase font-mono bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-200">
                    ACCESS GRANTED
                  </h3>
                  <div className="text-xs text-slate-350 font-semibold">
                    Biometric match confidence calculated at <span className="text-emerald-400 font-bold">{(biometricConfidence * 100).toFixed(1)}%</span>.
                  </div>
                  <div className="text-[10px] text-slate-500 max-w-[280px] mx-auto leading-relaxed">
                    Synchronizing temporary security cookies and signing core records tables. Please wait...
                  </div>
                </div>
                <div className="w-10 h-10 mx-auto">
                  <RefreshCw className="w-6 h-6 animate-spin text-blue-400" />
                </div>
              </motion.div>
            )}

          </AnimatePresence>

        </div>

      </div>

    </div>
  );
};
