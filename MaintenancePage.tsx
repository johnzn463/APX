import { Wrench, Clock, MessageCircle, Shield, Zap } from 'lucide-react';
import { useState } from 'react';
import { useApp, verifyAdminCredentials } from '../context/AppContext';

export default function MaintenancePage() {
  const { login } = useApp();
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [error, setError] = useState('');

  const handleAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyAdminCredentials(adminUser, adminPass)) {
      login('admin@apx.local', 'Administrador', true);
    } else {
      setError('Credenciais inválidas.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/images/hero-bg.jpg)' }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-gray-950/95 via-purple-950/80 to-gray-950/95" />

      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 w-full max-w-lg mx-4 text-center">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
            <Zap className="w-6 h-6 text-purple-400" />
          </div>
          <span className="text-2xl font-bold text-white">
            APX<span className="text-purple-400">PROJECT</span>
          </span>
        </div>

        {/* Animated Icon */}
        <div className="relative inline-flex items-center justify-center mb-8">
          <div className="absolute w-32 h-32 rounded-full bg-orange-500/10 animate-ping" style={{ animationDuration: '3s' }} />
          <div className="absolute w-24 h-24 rounded-full bg-orange-500/20 animate-pulse" />
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-2xl shadow-orange-500/30">
            <Wrench className="w-10 h-10 text-white" />
          </div>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
          Site em <span className="text-orange-400">Manutenção</span>
        </h1>

        <p className="text-lg text-gray-300 mb-8 max-w-md mx-auto leading-relaxed">
          Estamos realizando melhorias para oferecer uma experiência ainda melhor. Voltaremos em breve!
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-5 py-4">
            <Clock className="w-6 h-6 text-orange-400 shrink-0" />
            <div className="text-left">
              <p className="text-white font-semibold text-sm">Previsão de Retorno</p>
              <p className="text-gray-400 text-xs">Em breve — fique ligado!</p>
            </div>
          </div>
          <a
            href="https://wa.me/5571992773339"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 rounded-2xl px-5 py-4 hover:bg-green-500/20 transition-colors"
          >
            <MessageCircle className="w-6 h-6 text-green-400 shrink-0" />
            <div className="text-left">
              <p className="text-white font-semibold text-sm">Fale Conosco</p>
              <p className="text-gray-400 text-xs">WhatsApp disponível</p>
            </div>
          </a>
        </div>

        {/* Hidden admin access */}
        {!showAdmin ? (
          <button
            onClick={() => setShowAdmin(true)}
            className="text-gray-600 hover:text-gray-400 transition-colors text-xs mt-4"
          >
            <Shield className="w-3 h-3 inline mr-1" />
            Admin
          </button>
        ) : (
          <form
            onSubmit={handleAdmin}
            className="mt-4 bg-white/5 border border-white/10 rounded-2xl p-5 max-w-xs mx-auto space-y-3"
          >
            <p className="text-sm text-gray-400 mb-2">Acesso do Administrador</p>
            <input
              type="text"
              value={adminUser}
              onChange={(e) => { setAdminUser(e.target.value); setError(''); }}
              placeholder="Usuário"
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <input
              type="password"
              value={adminPass}
              onChange={(e) => { setAdminPass(e.target.value); setError(''); }}
              placeholder="Senha"
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            {error && <p className="text-xs text-red-400">{error}</p>}
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl font-semibold text-white text-sm bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 transition-all"
            >
              Entrar como Admin
            </button>
            <button
              type="button"
              onClick={() => setShowAdmin(false)}
              className="text-xs text-gray-500 hover:text-gray-300"
            >
              Cancelar
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
