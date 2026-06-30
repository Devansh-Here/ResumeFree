import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Sparkles, Check } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';

const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-2.641-.21-5.236-.611-7.743z" />
    <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.022 35.026 44 30.038 44 24c0-2.641-.21-5.236-.611-7.743z" />
  </svg>
);

const inputClass = "w-full bg-white border border-dove rounded-inputs px-4 py-3 text-sm text-ink placeholder:text-graphite/50 focus:outline-none focus:border-rust focus:ring-2 focus:ring-rust/15 transition-all duration-150";
const labelClass = "block text-[11px] font-semibold tracking-widest uppercase text-graphite mb-2";

// ---------- Live AI Demo (continuous loop) ----------

const DEMO_EXAMPLES = [
  {
    before: 'Worked on database project',
    after: 'Optimized MySQL queries for 500-record system, reduced load 3s → 400ms',
    score: 94,
  },
  {
    before: 'Helped team with coding tasks',
    after: 'Built REST APIs in Node.js, cutting response time by 40%',
    score: 91,
  },
  {
    before: 'Made a website for college event',
    after: 'Shipped responsive event site used by 600+ students in 48 hours',
    score: 96,
  },
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function AIDemoCard() {
  const [phase, setPhase] = useState('typingBefore'); // typingBefore | thinking | typingAfter | scoring | done
  const [beforeText, setBeforeText] = useState('');
  const [afterText, setAfterText] = useState('');
  const [score, setScore] = useState(0);
  const cancelledRef = useRef(false);

  useEffect(() => {
    cancelledRef.current = false;

    async function run() {
      let i = 0;
      while (!cancelledRef.current) {
        const ex = DEMO_EXAMPLES[i % DEMO_EXAMPLES.length];

        setPhase('typingBefore');
        setBeforeText('');
        setAfterText('');
        setScore(0);

        for (let c = 1; c <= ex.before.length; c++) {
          if (cancelledRef.current) return;
          setBeforeText(ex.before.slice(0, c));
          await sleep(26);
        }

        if (cancelledRef.current) return;
        await sleep(550);

        setPhase('thinking');
        await sleep(1100);
        if (cancelledRef.current) return;

        setPhase('typingAfter');
        for (let c = 1; c <= ex.after.length; c++) {
          if (cancelledRef.current) return;
          setAfterText(ex.after.slice(0, c));
          await sleep(16);
        }

        if (cancelledRef.current) return;
        await sleep(450);

        setPhase('scoring');
        const steps = 28;
        for (let s = 1; s <= steps; s++) {
          if (cancelledRef.current) return;
          setScore(Math.round((ex.score * s) / steps));
          await sleep(18);
        }

        setPhase('done');
        await sleep(2300);
        if (cancelledRef.current) return;

        i++;
      }
    }

    run();
    return () => {
      cancelledRef.current = true;
    };
  }, []);

  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const showScore = phase === 'scoring' || phase === 'done';
  const dashOffset = circumference - (Math.min(score, 100) / 100) * circumference;

  return (
    <div className="w-[340px] bg-white/10 backdrop-blur-md border border-white/15 rounded-cards p-5 shadow-[0_8px_30px_rgba(0,0,0,0.25)]">
      {/* header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 rounded-full bg-rust flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="text-[11px] font-semibold tracking-widest uppercase text-white/60">
          AI Bullet Improver
        </span>
      </div>

      {/* before line */}
      <div className="mb-3">
        <div className="text-[10px] uppercase tracking-wider text-white/40 mb-1.5">Before</div>
        <div
          className={`text-sm leading-relaxed font-sohne min-h-[20px] transition-all duration-300 ${
            phase === 'typingAfter' || phase === 'scoring' || phase === 'done'
              ? 'text-white/35 line-through decoration-white/30'
              : 'text-white/85'
          }`}
        >
          {beforeText}
          {phase === 'typingBefore' && (
            <span className="inline-block w-[2px] h-[14px] bg-white/70 ml-0.5 align-middle animate-pulse" />
          )}
        </div>
      </div>

      {/* thinking state */}
      {phase === 'thinking' && (
        <div className="flex items-center gap-2 mb-3 py-1">
          <span className="text-xs text-rust font-medium">AI improving</span>
          <span className="flex gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rust animate-bounce [animation-delay:-0.3s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-rust animate-bounce [animation-delay:-0.15s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-rust animate-bounce" />
          </span>
        </div>
      )}

      {/* after line */}
      {(phase === 'typingAfter' || phase === 'scoring' || phase === 'done') && (
        <div className="mb-4">
          <div className="text-[10px] uppercase tracking-wider text-emerald-300/70 mb-1.5">After</div>
          <div className="text-sm leading-relaxed font-sohne text-white">
            {afterText}
            {phase === 'typingAfter' && (
              <span className="inline-block w-[2px] h-[14px] bg-rust ml-0.5 align-middle animate-pulse" />
            )}
          </div>
        </div>
      )}

      {/* score ring */}
      <div
        className={`flex items-center gap-3 pt-3 border-t border-white/10 transition-opacity duration-300 ${
          showScore ? 'opacity-100' : 'opacity-0 h-0 pt-0 border-t-0 overflow-hidden'
        }`}
      >
        <div className="relative w-12 h-12 flex-shrink-0">
          <svg width="48" height="48" viewBox="0 0 48 48" className="-rotate-90">
            <circle cx="24" cy="24" r={radius} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="4" />
            <circle
              cx="24"
              cy="24"
              r={radius}
              fill="none"
              stroke="#059669"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              style={{ transition: 'stroke-dashoffset 0.15s linear' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">
            {score}
          </div>
        </div>
        <div>
          <div className="text-xs font-semibold text-white flex items-center gap-1">
            ATS Score
            {phase === 'done' && (
              <Check className="w-3.5 h-3.5 text-emerald-400 animate-[popIn_0.3s_ease-out]" />
            )}
          </div>
          <div className="text-[11px] text-white/50">Indian recruiter optimized</div>
        </div>
      </div>
    </div>
  );
}

// ---------- Auth Page ----------

export default function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/dashboard');
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage('Account ban gaya! Apna email check karo verify karne ke liye.');
      }
    } catch (err) {
      setError(err.message || 'Kuch galat ho gaya, dobara try karo.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
    } catch (err) {
      setError(err.message || 'Google sign-in fail ho gaya.');
      setGoogleLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError('Pehle apna email daalo, fir reset link bhejenge.');
      return;
    }
    setError('');
    setMessage('');
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback`,
      });
      if (error) throw error;
      setMessage('Reset link bhej diya — apna inbox check karo.');
    } catch (err) {
      setError(err.message || 'Reset link bhejne mein dikkat aayi.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-fog">
      {/* Left: form */}
      <section className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <h1 className="font-signifier text-3xl sm:text-4xl mb-2 text-ink">
            {mode === 'signin' ? 'Welcome back' : 'Create account'}
          </h1>
          <p className="font-sohne text-sm text-graphite mb-8">
            {mode === 'signin'
              ? 'Apne resumes aur progress tak wapas pahuncho'
              : 'Free mein shuru karo, resume banao seconds mein'}
          </p>

          {error && (
            <div className="mb-5 text-sm text-red-600 bg-red-50 border border-red-200 rounded-inputs px-4 py-3">
              {error}
            </div>
          )}
          {message && (
            <div className="mb-5 text-sm text-rust bg-apricot-wash border border-rust/20 rounded-inputs px-4 py-3">
              {message}
            </div>
          )}

          <form className="space-y-5 font-sohne" onSubmit={handleSubmit}>
            <div>
              <label className={labelClass}>Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`${inputClass} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-graphite hover:text-ink transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {mode === 'signin' && (
              <div className="flex items-center justify-end text-sm">
                <button
                  type="button"
                  onClick={handleResetPassword}
                  className="text-rust hover:underline font-medium"
                >
                  Password bhool gaye?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-buttons bg-ink py-3.5 font-medium text-white hover:bg-ink/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="relative flex items-center justify-center my-7">
            <span className="w-full border-t border-dove"></span>
            <span className="px-4 text-xs text-graphite bg-fog absolute uppercase tracking-widest font-sohne">Or continue with</span>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 border border-dove rounded-buttons py-3.5 hover:bg-white transition-colors disabled:opacity-60 text-ink font-medium bg-white font-sohne"
          >
            {googleLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <GoogleIcon />}
            Continue with Google
          </button>

          <p className="text-center text-sm text-graphite mt-7 font-sohne">
            {mode === 'signin' ? (
              <>New to ResumeFree?{' '}
                <button onClick={() => { setMode('signup'); setError(''); setMessage(''); }} className="text-rust hover:underline font-medium">
                  Create Account
                </button>
              </>
            ) : (
              <>Already have an account?{' '}
                <button onClick={() => { setMode('signin'); setError(''); setMessage(''); }} className="text-rust hover:underline font-medium">
                  Sign In
                </button>
              </>
            )}
          </p>
        </div>
      </section>

      {/* Right: animated panel */}
      <section className="hidden md:block flex-1 relative p-4">
        <div className="absolute inset-4 rounded-cards overflow-hidden bg-ink">
          <div className="absolute inset-0">
            <div className="absolute w-[420px] h-[420px] rounded-full bg-rust/30 blur-[100px] animate-blob1 -top-20 -left-20" />
            <div className="absolute w-[380px] h-[380px] rounded-full bg-graphite/25 blur-[100px] animate-blob2 bottom-0 right-0" />
            <div className="absolute w-[300px] h-[300px] rounded-full bg-rust/20 blur-[90px] animate-blob3 top-1/3 left-1/3" />
          </div>

          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />

          {/* Continuous-loop AI demo card */}
          <div className="absolute inset-0 flex items-center justify-center px-8">
            <AIDemoCard />
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent pointer-events-none" />
          <div className="absolute bottom-10 left-8 right-8">
            <p className="font-signifier text-2xl text-white mb-2">
              Resume jo interview dilaye
            </p>
            <p className="font-sohne text-sm text-white/70">
              AI-improved bullets, Indian ATS templates, JD matching — sab ek jagah.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}