'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { Leaf, Lock, Mail, ArrowRight, CheckCircle2, AlertCircle, User, Phone } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Register State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regWhatsapp, setRegWhatsapp] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  // Forgot Password State
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        router.push('/');
      } else {
        setErrorMsg(data.message || 'Email atau password salah.');
      }
    } catch {
      setErrorMsg('Gagal terhubung ke server backend.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (regPassword.length < 6) {
      setErrorMsg('Kata sandi admin minimal 6 karakter.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setRegLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          whatsapp: regWhatsapp,
          password: regPassword,
        }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMsg('Akun admin berhasil didaftarkan! Silakan masuk dengan akun baru Anda.');
        setEmail(regEmail);
        setPassword('');
        setActiveTab('login');
        // Reset form registrasi
        setRegName('');
        setRegEmail('');
        setRegWhatsapp('');
        setRegPassword('');
        setRegConfirmPassword('');
      } else {
        setErrorMsg(data.message || 'Pendaftaran admin gagal.');
      }
    } catch {
      setErrorMsg('Gagal terhubung ke server backend.');
    } finally {
      setRegLoading(false);
    }
  };

  const handleGoogleCredentialResponse = async (response: { credential?: string }) => {
    if (!response.credential) {
      setErrorMsg('Login Google gagal: token tidak diterima.');
      setGoogleLoading(false);
      return;
    }
    setGoogleLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: response.credential, forAdmin: true }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        router.push('/');
      } else {
        setErrorMsg(data.message || 'Login Google Admin gagal. Pastikan akun Google terdaftar sebagai admin.');
      }
    } catch {
      setErrorMsg('Gagal terhubung ke server backend.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleSignInClick = () => {
    setGoogleLoading(true);
    setErrorMsg('');

    // @ts-expect-error Google GSI global
    if (typeof window !== 'undefined' && window.google?.accounts?.id) {
      try {
        // @ts-expect-error Google GSI global
        window.google.accounts.id.initialize({
          client_id:
            process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
            '326249737628-v0qtts2k6an7pgap2r6qo70bk0n3r81j.apps.googleusercontent.com',
          callback: handleGoogleCredentialResponse,
        });
        // @ts-expect-error Google GSI global
        window.google.accounts.id.prompt((notification: { isNotDisplayed: () => boolean; isSkippedMoment: () => boolean }) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // Popup Google diblokir — tampilkan pesan, tidak ada fallback dummy
            setGoogleLoading(false);
            setErrorMsg(
              'Popup Google diblokir oleh browser. Coba izinkan popup untuk situs ini atau gunakan email & password.'
            );
          }
        });
      } catch {
        setGoogleLoading(false);
        setErrorMsg('Gagal menginisialisasi Google Sign-In. Coba refresh halaman.');
      }
    } else {
      setGoogleLoading(false);
      setErrorMsg('Google Sign-In belum dimuat. Pastikan koneksi internet aktif dan coba refresh halaman.');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setForgotSuccess(data.message);
      } else {
        setForgotSuccess('Tautan reset password berhasil dikirim jika email terdaftar.');
      }
    } catch {
      setForgotSuccess('Tautan reset password berhasil dikirim jika email terdaftar.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="p-8 pb-5 text-center border-b border-slate-100 bg-linear-to-b from-emerald-50/50 to-white">
          <div className="w-12 h-12 rounded-2xl bg-emerald-700 flex items-center justify-center text-white mx-auto shadow-md shadow-emerald-700/20 mb-3">
            <Leaf className="w-7 h-7 fill-white" />
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            NutriMeal UMKM Admin
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Portal manajemen katering sehat terintegrasi MySQL & Express
          </p>

          {/* Segmented Control: Masuk vs Daftar */}
          <div className="flex bg-slate-100 p-1 rounded-xl mt-5 border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setErrorMsg('');
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'login'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Masuk
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'register'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Daftar Admin Baru
            </button>
          </div>
        </div>

        {/* Notifikasi Global */}
        <div className="px-8 pt-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}
        </div>

        {/* Tab 1: Form Login */}
        {activeTab === 'login' ? (
          <form onSubmit={handleLogin} className="p-8 pt-4 space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Email Admin
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@nutrimeal.id"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50 focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  Kata Sandi
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotSuccess('');
                    setForgotEmail(email);
                    setIsForgotModalOpen(true);
                  }}
                  className="text-[11px] font-semibold text-emerald-800 hover:text-emerald-900"
                >
                  Lupa Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50 focus:bg-white transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full py-2.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs shadow-md shadow-emerald-800/20 flex items-center justify-center gap-1.5 transition-all active:scale-98 disabled:opacity-50"
            >
              <span>{loading ? 'Memverifikasi ke Database...' : 'Masuk ke Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Divider */}
            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-slate-400 font-medium text-[11px]">
                  atau lanjutkan dengan
                </span>
              </div>
            </div>

            {/* Tombol Masuk dengan Google */}
            <button
              type="button"
              disabled={loading || googleLoading}
              onClick={handleGoogleSignInClick}
              className="w-full py-2.5 px-4 rounded-lg border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-xs flex items-center justify-center gap-2.5 transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{googleLoading ? 'Menghubungkan Google...' : 'Masuk dengan Akun Google'}</span>
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('register');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className="text-xs text-emerald-800 hover:text-emerald-900 font-semibold"
              >
                Belum punya akun admin? Daftar di sini
              </button>
            </div>
          </form>
        ) : (
          /* Tab 2: Form Register Admin */
          <form onSubmit={handleRegister} className="p-8 pt-4 space-y-3.5">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Nama Lengkap Admin
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Contoh: Nathanael Eleazar"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50 focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Email Admin Resmi
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="nama.admin@nutrimeal.id"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50 focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                No. WhatsApp / Telepon <span className="text-slate-400 font-normal">(opsional)</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={regWhatsapp}
                  onChange={(e) => setRegWhatsapp(e.target.value)}
                  placeholder="08123456789"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50 focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Kata Sandi
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50 focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Konfirmasi Kata Sandi
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  placeholder="Ulangi kata sandi"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50 focus:bg-white transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={regLoading}
              className="w-full py-2.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs shadow-md shadow-emerald-800/20 flex items-center justify-center gap-1.5 transition-all active:scale-98 disabled:opacity-50 mt-2"
            >
              <span>{regLoading ? 'Mendaftarkan ke Database...' : 'Daftarkan Akun Admin'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  setErrorMsg('');
                }}
                className="text-xs text-emerald-800 hover:text-emerald-900 font-semibold"
              >
                Sudah punya akun? Masuk di sini
              </button>
            </div>
          </form>
        )}
      </div>

      <Script src="https://accounts.google.com/gsi/client" strategy="lazyOnload" />

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="font-bold text-slate-900 text-sm">Reset Kata Sandi</h3>
            <p className="text-xs text-slate-500 mt-1">
              Masukkan email terdaftar Anda untuk menerima link reset kata sandi.
            </p>

            {forgotSuccess ? (
              <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{forgotSuccess}</span>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="mt-4 space-y-3">
                <input
                  type="email"
                  required
                  placeholder="nama@email.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
                />
                <button
                  type="submit"
                  className="w-full py-2 bg-emerald-800 text-white rounded-lg text-xs font-semibold"
                >
                  Kirim Link Reset
                </button>
              </form>
            )}

            <div className="mt-4 pt-3 border-t border-slate-100 text-right">
              <button
                type="button"
                onClick={() => setIsForgotModalOpen(false)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
