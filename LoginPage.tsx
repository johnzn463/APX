import { useState, useEffect } from 'react';
import { useApp, verifyAdminCredentials } from '../context/AppContext';
import {
  Mail, Lock, User, Eye, EyeOff, Shield,
  UserPlus, ArrowLeft, KeyRound, CheckCircle2, XCircle, RefreshCw,
  Zap, Sparkles, ChevronRight,
} from 'lucide-react';
import {
  validateEmail,
  validatePassword,
  createAccount,
  findAccount,
  verifyPassword,
  updatePassword,
  hashPasswordSync,
  recordFailedAttempt,
  isAccountLocked,
  clearLoginAttempts,
  secureStorage,
} from '../utils/security';

// ── Google icon SVG ──────────────────────────────────────
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

type PageMode = 'login' | 'register' | 'forgot' | 'reset' | 'admin';

export default function LoginPage() {
  const { login } = useApp();

  const [mode, setMode] = useState<PageMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const [lockTimer, setLockTimer] = useState(0);

  const [recoveryCode, setRecoveryCode] = useState('');
  const [, setGeneratedCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPass, setShowNewPass] = useState(false);

  useEffect(() => {
    if (email && mode === 'login') {
      const lockStatus = isAccountLocked(email);
      if (lockStatus.locked) {
        setLockTimer(lockStatus.remainingTime);
      }
    }
  }, [email, mode]);

  useEffect(() => {
    if (lockTimer > 0) {
      const interval = setInterval(() => {
        setLockTimer((t) => {
          if (t <= 1) {
            clearInterval(interval);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [lockTimer]);

  const handleEmailChange = (val: string) => {
    setEmail(val);
    if (val.length > 5 && !validateEmail(val)) {
      setEmailError('E-mail inválido');
    } else {
      setEmailError('');
    }
  };

  const resetFields = () => {
    setError(''); setSuccess(''); setEmailError('');
    setShowPassword(false); setShowConfirm(false); setShowNewPass(false);
  };

  const switchMode = (m: PageMode) => {
    setMode(m);
    resetFields();
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');

    const lockStatus = isAccountLocked(email);
    if (lockStatus.locked) {
      setLockTimer(lockStatus.remainingTime);
      setError(`Bloqueado por ${lockStatus.remainingTime}s`);
      return;
    }

    if (!validateEmail(email)) {
      setError('E-mail inválido');
      return;
    }

    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid) {
      setError(passwordCheck.message);
      return;
    }

    const account = findAccount(email);
    if (!account) {
      setError('Conta não encontrada');
      return;
    }

    if (!verifyPassword(email, password)) {
      const result = recordFailedAttempt(email);
      if (result.locked) {
        setLockTimer(result.remainingTime);
        setError('Muitas tentativas! Bloqueado por 30s');
      } else {
        setError(`Senha incorreta (${result.attempts}/5)`);
      }
      return;
    }

    clearLoginAttempts(email);
    setLoading(true);
    setTimeout(() => {
      login(account.email, account.name);
      setLoading(false);
    }, 800);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');

    if (!name.trim() || name.trim().length < 3) {
      setError('Nome deve ter no mínimo 3 caracteres');
      return;
    }
    if (!validateEmail(email)) {
      setError('E-mail inválido');
      return;
    }
    if (findAccount(email)) {
      setError('E-mail já cadastrado');
      return;
    }

    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid) {
      setError(passwordCheck.message);
      return;
    }

    if (password !== confirmPassword) {
      setError('Senhas não coincidem');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const created = createAccount(email, name, password);
      if (!created) {
        setError('Erro ao criar conta');
        setLoading(false);
        return;
      }
      setLoading(false);
      setSuccess('Conta criada! Faça login');
      setTimeout(() => {
        switchMode('login');
        setPassword('');
        setConfirmPassword('');
        setSuccess('');
      }, 1500);
    }, 1000);
  };

  const handleGoogleLogin = () => {
    setError(''); setSuccess('');
    setLoading(true);

    setTimeout(() => {
      const randomId = Math.random().toString(36).substring(2, 8);
      const googleName = `Usuário Google`;
      const googleEmail = `user.${randomId}@gmail.com`;
      const googlePass = hashPasswordSync(`google_${randomId}_${Date.now()}`);

      if (!findAccount(googleEmail)) {
        createAccount(googleEmail, googleName, googlePass);
      }

      login(googleEmail, googleName);
      setLoading(false);
    }, 1500);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');

    if (!validateEmail(email)) {
      setError('E-mail inválido');
      return;
    }
    if (!findAccount(email)) {
      setError('Conta não encontrada');
      return;
    }

    setLoading(true);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    secureStorage.setItem(`recovery_${email}`, { code, expiresAt: Date.now() + 10 * 60 * 1000 });

    setTimeout(() => {
      setLoading(false);
      setSuccess(`Código: ${code}`);
      setTimeout(() => {
        switchMode('reset');
        setSuccess('');
      }, 2500);
    }, 1200);
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');

    const storedRecovery = secureStorage.getItem<{ code: string; expiresAt: number } | null>(
      `recovery_${email}`,
      null
    );

    if (!storedRecovery || storedRecovery.code !== recoveryCode) {
      setError('Código inválido');
      return;
    }

    if (Date.now() > storedRecovery.expiresAt) {
      setError('Código expirado');
      secureStorage.removeItem(`recovery_${email}`);
      return;
    }

    const passwordCheck = validatePassword(newPassword);
    if (!passwordCheck.valid) {
      setError(passwordCheck.message);
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError('Senhas não coincidem');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      updatePassword(email, newPassword);
      secureStorage.removeItem(`recovery_${email}`);
      clearLoginAttempts(email);
      
      setLoading(false);
      setSuccess('Senha alterada!');
      setTimeout(() => {
        switchMode('login');
        setPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        setRecoveryCode('');
        setSuccess('');
      }, 1500);
    }, 1000);
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (verifyAdminCredentials(adminUser, adminPass)) {
      setLoading(true);
      setTimeout(() => {
        login('admin@apx.local', 'Administrador', true);
        setLoading(false);
      }, 800);
    } else {
      setError('Credenciais inválidas');
    }
  };

  const getPasswordStrength = (p: string) => {
    if (p.length === 0) return { level: 0, label: '', color: '' };
    let score = 0;
    if (p.length >= 6) score++;
    if (p.length >= 10) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    if (score <= 1) return { level: 1, label: 'Fraca', color: 'bg-red-500' };
    if (score <= 2) return { level: 2, label: 'Média', color: 'bg-yellow-500' };
    if (score <= 3) return { level: 3, label: 'Boa', color: 'bg-blue-500' };
    return { level: 4, label: 'Forte', color: 'bg-green-500' };
  };

  const strength = getPasswordStrength(mode === 'reset' ? newPassword : password);
  const isLocked = lockTimer > 0;

  // ═══════════════════════════════════════════════════════
  // RENDER - NEW MODERN DESIGN
  // ═══════════════════════════════════════════════════════
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/images/hero-bg.jpg)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/90 via-purple-900/80 to-indigo-900/90" />
        
        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center">
              <Zap className="w-6 h-6 text-purple-300" />
            </div>
            <span className="text-2xl font-bold text-white">
              APX<span className="text-purple-300">PROJECT</span>
            </span>
          </div>

          {/* Center Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full px-4 py-2">
                <Sparkles className="w-4 h-4 text-purple-300" />
                <span className="text-sm text-purple-200">Automação Inteligente</span>
              </div>
              <h1 className="text-5xl font-bold text-white leading-tight">
                Revolucione seu<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-300">
                  WhatsApp Business
                </span>
              </h1>
              <p className="text-lg text-purple-200/80 max-w-md">
                Bots inteligentes que automatizam vendas, suporte e engajamento 24/7. Aumente sua produtividade em até 300%.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-3">
              {['Respostas automáticas com IA', 'Gestão de múltiplos grupos', 'Relatórios em tempo real'].map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-500/30 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-purple-300" />
                  </div>
                  <span className="text-purple-200">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <p className="text-purple-300/60 text-sm">© 2024 APX PROJECT</p>
            <div className="flex items-center gap-4">
              <a href="https://wa.me/5571992773339" target="_blank" rel="noopener noreferrer" className="text-purple-300/60 hover:text-purple-300 transition-colors text-sm">
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Forms */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-950">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
              <Zap className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-xl font-bold text-white">
              APX<span className="text-purple-400">PROJECT</span>
            </span>
          </div>

          {/* ═══ LOGIN MODE ═══ */}
          {mode === 'login' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-white">Bem-vindo de volta</h2>
                <p className="text-gray-400">Entre na sua conta para continuar</p>
              </div>

              {/* Social Login */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all disabled:opacity-50"
                >
                  <GoogleIcon className="w-5 h-5" />
                  <span className="text-sm">Google</span>
                </button>
                <button
                  onClick={() => switchMode('admin')}
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all"
                >
                  <Shield className="w-5 h-5 text-purple-400" />
                  <span className="text-sm">Admin</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-xs text-gray-500 uppercase">ou continue com email</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm text-gray-400">E-mail</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="email" value={email}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      placeholder="seu@email.com"
                      className={`w-full pl-12 pr-4 py-3.5 bg-white/5 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${emailError ? 'border-red-500/50 focus:ring-red-500/50' : 'border-white/10 focus:ring-purple-500/50 focus:border-purple-500/50'}`}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-gray-400">Senha</label>
                    <button type="button" onClick={() => switchMode('forgot')} className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
                      Esqueceu?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type={showPassword ? 'text' : 'password'} value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {isLocked && (
                  <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-xl p-3">
                    <Lock className="w-4 h-4 text-orange-400" />
                    <span className="text-sm text-orange-300">Bloqueado por {lockTimer}s</span>
                  </div>
                )}

                {error && (
                  <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                    <XCircle className="w-4 h-4 text-red-400" />
                    <span className="text-sm text-red-300">{error}</span>
                  </div>
                )}

                {success && (
                  <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-xl p-3">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-green-300">{success}</span>
                  </div>
                )}

                <button
                  type="submit" disabled={loading || isLocked}
                  className="w-full py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? <Spinner /> : <><span>Entrar</span><ChevronRight className="w-4 h-4" /></>}
                </button>
              </form>

              <p className="text-center text-gray-400">
                Não tem conta?{' '}
                <button onClick={() => switchMode('register')} className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                  Criar agora
                </button>
              </p>
            </div>
          )}

          {/* ═══ REGISTER MODE ═══ */}
          {mode === 'register' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-white">Criar conta</h2>
                <p className="text-gray-400">Comece gratuitamente hoje</p>
              </div>

              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all disabled:opacity-50"
              >
                <GoogleIcon className="w-5 h-5" />
                <span>Continuar com Google</span>
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-xs text-gray-500 uppercase">ou</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm text-gray-400">Nome completo</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome"
                      className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm text-gray-400">E-mail</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input type="email" value={email} onChange={(e) => handleEmailChange(e.target.value)} placeholder="seu@email.com"
                      className={`w-full pl-12 pr-4 py-3.5 bg-white/5 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${emailError ? 'border-red-500/50 focus:ring-red-500/50' : 'border-white/10 focus:ring-purple-500/50 focus:border-purple-500/50'}`} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm text-gray-400">Senha</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres"
                      className="w-full pl-12 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {password.length > 0 && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 flex gap-1">
                        {[1,2,3,4].map((i) => (
                          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength.level ? strength.color : 'bg-white/10'}`} />
                        ))}
                      </div>
                      <span className={`text-xs ${strength.level <= 1 ? 'text-red-400' : strength.level <= 2 ? 'text-yellow-400' : strength.level <= 3 ? 'text-blue-400' : 'text-green-400'}`}>
                        {strength.label}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm text-gray-400">Confirmar senha</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input type={showConfirm ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repita a senha"
                      className={`w-full pl-12 pr-12 py-3.5 bg-white/5 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${confirmPassword && confirmPassword !== password ? 'border-red-500/50 focus:ring-red-500/50' : 'border-white/10 focus:ring-purple-500/50 focus:border-purple-500/50'}`} />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                      {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                    <XCircle className="w-4 h-4 text-red-400" />
                    <span className="text-sm text-red-300">{error}</span>
                  </div>
                )}

                {success && (
                  <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-xl p-3">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-green-300">{success}</span>
                  </div>
                )}

                <button type="submit" disabled={loading}
                  className="w-full py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {loading ? <Spinner /> : <><UserPlus className="w-4 h-4" /><span>Criar conta</span></>}
                </button>
              </form>

              <p className="text-center text-gray-400">
                Já tem conta?{' '}
                <button onClick={() => switchMode('login')} className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                  Entrar
                </button>
              </p>
            </div>
          )}

          {/* ═══ FORGOT MODE ═══ */}
          {mode === 'forgot' && (
            <div className="space-y-6">
              <button onClick={() => switchMode('login')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                <ArrowLeft className="w-4 h-4" /><span>Voltar</span>
              </button>

              <div className="space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mb-4">
                  <KeyRound className="w-7 h-7 text-yellow-400" />
                </div>
                <h2 className="text-3xl font-bold text-white">Recuperar conta</h2>
                <p className="text-gray-400">Digite seu e-mail para receber o código</p>
              </div>

              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm text-gray-400">E-mail</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input type="email" value={email} onChange={(e) => handleEmailChange(e.target.value)} placeholder="seu@email.com"
                      className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50 transition-all" />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                    <XCircle className="w-4 h-4 text-red-400" />
                    <span className="text-sm text-red-300">{error}</span>
                  </div>
                )}

                {success && (
                  <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-xl p-3">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-green-300">{success}</span>
                  </div>
                )}

                <button type="submit" disabled={loading}
                  className="w-full py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {loading ? <Spinner /> : <><Mail className="w-4 h-4" /><span>Enviar código</span></>}
                </button>
              </form>
            </div>
          )}

          {/* ═══ RESET MODE ═══ */}
          {mode === 'reset' && (
            <div className="space-y-6">
              <button onClick={() => switchMode('forgot')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                <ArrowLeft className="w-4 h-4" /><span>Voltar</span>
              </button>

              <div className="space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-4">
                  <RefreshCw className="w-7 h-7 text-green-400" />
                </div>
                <h2 className="text-3xl font-bold text-white">Nova senha</h2>
                <p className="text-gray-400">Digite o código e crie sua nova senha</p>
              </div>

              <form onSubmit={handleResetSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm text-gray-400">Código</label>
                  <input type="text" value={recoveryCode} onChange={(e) => setRecoveryCode(e.target.value)} placeholder="000000" maxLength={6}
                    className="w-full py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all text-center text-2xl tracking-[0.5em] font-mono" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm text-gray-400">Nova senha</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input type={showNewPass ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Nova senha"
                      className="w-full pl-12 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all" />
                    <button type="button" onClick={() => setShowNewPass(!showNewPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                      {showNewPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm text-gray-400">Confirmar nova senha</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} placeholder="Confirmar"
                      className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all" />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                    <XCircle className="w-4 h-4 text-red-400" />
                    <span className="text-sm text-red-300">{error}</span>
                  </div>
                )}

                {success && (
                  <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-xl p-3">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-green-300">{success}</span>
                  </div>
                )}

                <button type="submit" disabled={loading}
                  className="w-full py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {loading ? <Spinner /> : <><RefreshCw className="w-4 h-4" /><span>Redefinir senha</span></>}
                </button>
              </form>
            </div>
          )}

          {/* ═══ ADMIN MODE ═══ */}
          {mode === 'admin' && (
            <div className="space-y-6">
              <button onClick={() => switchMode('login')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                <ArrowLeft className="w-4 h-4" /><span>Voltar</span>
              </button>

              <div className="space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4">
                  <Shield className="w-7 h-7 text-purple-400" />
                </div>
                <h2 className="text-3xl font-bold text-white">Painel Admin</h2>
                <p className="text-gray-400">Acesso restrito para administradores</p>
              </div>

              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm text-gray-400">Usuário</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input type="text" value={adminUser} onChange={(e) => setAdminUser(e.target.value)} placeholder="Usuário admin"
                      className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm text-gray-400">Senha</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input type={showPassword ? 'text' : 'password'} value={adminPass} onChange={(e) => setAdminPass(e.target.value)} placeholder="••••••••"
                      className="w-full pl-12 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                    <XCircle className="w-4 h-4 text-red-400" />
                    <span className="text-sm text-red-300">{error}</span>
                  </div>
                )}

                <button type="submit" disabled={loading}
                  className="w-full py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {loading ? <Spinner /> : <><Shield className="w-4 h-4" /><span>Acessar painel</span></>}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
