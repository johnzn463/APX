import { useApp } from '../context/AppContext';
import {
  LogOut,
  Shield,
  Users,
  ShoppingBag,
  XCircle,
  LogIn,
  Trash2,
  Zap,
  Activity,
  TrendingUp,
  Clock,
  Filter,
  Power,
  Wifi,
  WifiOff,
  Tag,
  Plus,
  Percent,
  Edit2,
  Check,
  X,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { useState, useMemo } from 'react';

export default function AdminPanel() {
  const {
    logs,
    logout,
    setCurrentPage,
    siteOnline,
    toggleSite,
    coupons,
    addCoupon,
    updateCoupon,
    deleteCoupon,
    toggleCouponActive,
  } = useApp();

  const [filter, setFilter] = useState<'all' | 'login' | 'purchase' | 'cancel'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Coupon form states
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState('');
  const [couponError, setCouponError] = useState('');
  const [editingCoupon, setEditingCoupon] = useState<string | null>(null);
  const [editCode, setEditCode] = useState('');
  const [editDiscount, setEditDiscount] = useState('');

  const filtered = useMemo(() => {
    let result = logs;
    if (filter !== 'all') result = result.filter((l) => l.action === filter);
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (l) =>
          l.userName.toLowerCase().includes(term) ||
          l.userEmail.toLowerCase().includes(term) ||
          l.details.toLowerCase().includes(term)
      );
    }
    return result;
  }, [logs, filter, searchTerm]);

  const stats = useMemo(
    () => ({
      logins: logs.filter((l) => l.action === 'login').length,
      purchases: logs.filter((l) => l.action === 'purchase').length,
      cancels: logs.filter((l) => l.action === 'cancel').length,
      uniqueUsers: new Set(logs.map((l) => l.userEmail)).size,
    }),
    [logs]
  );

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'login':
        return <LogIn className="w-4 h-4 text-blue-400" />;
      case 'purchase':
        return <ShoppingBag className="w-4 h-4 text-green-400" />;
      case 'cancel':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'login':
        return (
          <span className="bg-blue-500/20 text-blue-400 text-xs font-semibold px-2.5 py-1 rounded-full">
            LOGIN
          </span>
        );
      case 'purchase':
        return (
          <span className="bg-green-500/20 text-green-400 text-xs font-semibold px-2.5 py-1 rounded-full">
            COMPRA
          </span>
        );
      case 'cancel':
        return (
          <span className="bg-red-500/20 text-red-400 text-xs font-semibold px-2.5 py-1 rounded-full">
            CANCELAMENTO
          </span>
        );
      default:
        return null;
    }
  };

  const handleLogout = () => {
    setCurrentPage('login');
    logout();
  };

  const clearLogs = () => {
    if (confirm('Tem certeza que deseja limpar todos os logs?')) {
      localStorage.removeItem('zapbot_logs');
      window.location.reload();
    }
  };

  const handleAddCoupon = () => {
    setCouponError('');
    const code = newCouponCode.trim();
    const discount = parseInt(newCouponDiscount);

    if (!code) {
      setCouponError('Digite o código do cupom.');
      return;
    }
    if (code.length < 3) {
      setCouponError('O código deve ter pelo menos 3 caracteres.');
      return;
    }
    if (isNaN(discount) || discount < 1 || discount > 100) {
      setCouponError('O desconto deve ser entre 1% e 100%.');
      return;
    }

    const success = addCoupon(code, discount);
    if (!success) {
      setCouponError('Já existe um cupom com esse código.');
      return;
    }

    setNewCouponCode('');
    setNewCouponDiscount('');
  };

  const handleStartEdit = (coupon: typeof coupons[0]) => {
    setEditingCoupon(coupon.id);
    setEditCode(coupon.code);
    setEditDiscount(coupon.discount.toString());
  };

  const handleSaveEdit = (id: string) => {
    const discount = parseInt(editDiscount);
    if (editCode.trim().length >= 3 && !isNaN(discount) && discount >= 1 && discount <= 100) {
      updateCoupon(id, editCode, discount);
      setEditingCoupon(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingCoupon(null);
    setEditCode('');
    setEditDiscount('');
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Navbar */}
      <nav className="sticky top-0 z-30 bg-gray-900/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-lg">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-white">Painel Admin</span>
              <p className="text-xs text-gray-400">APX PROJECT</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentPage('products')}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition-colors text-sm"
            >
              <Zap className="w-4 h-4" />
              Ver Loja
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">

        {/* ═══ SITE POWER CONTROL ═══ */}
        <div
          className={`relative overflow-hidden rounded-2xl border p-6 transition-all duration-500 ${
            siteOnline
              ? 'bg-gradient-to-r from-green-500/10 via-green-600/5 to-emerald-500/10 border-green-500/30'
              : 'bg-gradient-to-r from-red-500/10 via-red-600/5 to-orange-500/10 border-red-500/30'
          }`}
        >
          <div
            className={`absolute -top-20 -right-20 w-60 h-60 rounded-full blur-3xl transition-all duration-500 ${
              siteOnline ? 'bg-green-500/10' : 'bg-red-500/10'
            }`}
          />

          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div
                className={`relative w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                  siteOnline
                    ? 'bg-green-500/20 shadow-lg shadow-green-500/20'
                    : 'bg-red-500/20 shadow-lg shadow-red-500/20'
                }`}
              >
                {siteOnline ? (
                  <Wifi className="w-7 h-7 text-green-400" />
                ) : (
                  <WifiOff className="w-7 h-7 text-red-400" />
                )}
                <span
                  className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-950 ${
                    siteOnline ? 'bg-green-400 animate-pulse' : 'bg-red-400'
                  }`}
                />
              </div>

              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  Controle do Site
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      siteOnline
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {siteOnline ? '● ONLINE' : '● OFFLINE'}
                  </span>
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  {siteOnline
                    ? 'O site está ligado e acessível para todos os visitantes.'
                    : 'O site está desligado. Visitantes veem uma página de manutenção.'}
                </p>
              </div>
            </div>

            <button
              onClick={toggleSite}
              className={`group relative flex items-center gap-3 px-6 py-3.5 rounded-xl font-bold text-base transition-all duration-300 transform hover:scale-[1.03] active:scale-[0.97] shadow-lg ${
                siteOnline
                  ? 'bg-gradient-to-r from-red-500 to-red-700 text-white shadow-red-500/30 hover:from-red-600 hover:to-red-800'
                  : 'bg-gradient-to-r from-green-500 to-green-700 text-white shadow-green-500/30 hover:from-green-600 hover:to-green-800'
              }`}
            >
              <Power className="w-5 h-5 transition-transform group-hover:rotate-180 duration-500" />
              {siteOnline ? 'Desligar Site' : 'Ligar Site'}
            </button>
          </div>
        </div>

        {/* ═══ COUPONS MANAGEMENT ═══ */}
        <div className="bg-gray-900/50 border border-white/10 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-white/10">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
              <Tag className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Cupons de Desconto</h3>
              <p className="text-xs text-gray-400">Crie e gerencie cupons promocionais</p>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Add New Coupon Form */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-4">
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-green-400" />
                Criar Novo Cupom
              </h4>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <label className="block text-xs text-gray-400 mb-1.5">Código do Cupom</label>
                  <input
                    type="text"
                    value={newCouponCode}
                    onChange={(e) => {
                      setNewCouponCode(e.target.value.toUpperCase());
                      setCouponError('');
                    }}
                    placeholder="Ex: PROMO20"
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent uppercase"
                  />
                </div>
                <div className="w-full sm:w-32">
                  <label className="block text-xs text-gray-400 mb-1.5">Desconto (%)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={newCouponDiscount}
                      onChange={(e) => {
                        setNewCouponDiscount(e.target.value);
                        setCouponError('');
                      }}
                      placeholder="10"
                      min="1"
                      max="100"
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent pr-10"
                    />
                    <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  </div>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleAddCoupon}
                    className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all shadow-lg shadow-yellow-500/20 flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Criar
                  </button>
                </div>
              </div>
              {couponError && (
                <p className="text-sm text-red-400 flex items-center gap-1">
                  <XCircle className="w-4 h-4" />
                  {couponError}
                </p>
              )}
            </div>

            {/* Coupons List */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-400">
                Cupons Ativos ({coupons.filter((c) => c.active).length}) / Total ({coupons.length})
              </h4>

              {coupons.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Tag className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Nenhum cupom criado ainda</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {coupons.map((coupon) => (
                    <div
                      key={coupon.id}
                      className={`flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl border transition-all ${
                        coupon.active
                          ? 'bg-white/5 border-white/10'
                          : 'bg-gray-800/50 border-gray-700/50 opacity-60'
                      }`}
                    >
                      {editingCoupon === coupon.id ? (
                        // Edit Mode
                        <>
                          <div className="flex-1 flex flex-col sm:flex-row gap-2">
                            <input
                              type="text"
                              value={editCode}
                              onChange={(e) => setEditCode(e.target.value.toUpperCase())}
                              className="flex-1 px-3 py-2 bg-white/10 border border-yellow-500/30 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 uppercase"
                            />
                            <div className="relative w-full sm:w-24">
                              <input
                                type="number"
                                value={editDiscount}
                                onChange={(e) => setEditDiscount(e.target.value)}
                                min="1"
                                max="100"
                                className="w-full px-3 py-2 bg-white/10 border border-yellow-500/30 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 pr-8"
                              />
                              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleSaveEdit(coupon.id)}
                              className="w-9 h-9 rounded-lg bg-green-500/20 flex items-center justify-center hover:bg-green-500/40 transition-colors"
                            >
                              <Check className="w-4 h-4 text-green-400" />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="w-9 h-9 rounded-lg bg-red-500/20 flex items-center justify-center hover:bg-red-500/40 transition-colors"
                            >
                              <X className="w-4 h-4 text-red-400" />
                            </button>
                          </div>
                        </>
                      ) : (
                        // View Mode
                        <>
                          <div className="flex items-center gap-3 flex-1">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                coupon.active ? 'bg-yellow-500/20' : 'bg-gray-600/20'
                              }`}
                            >
                              <Percent
                                className={`w-5 h-5 ${coupon.active ? 'text-yellow-400' : 'text-gray-500'}`}
                              />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-white font-bold font-mono">{coupon.code}</span>
                                <span
                                  className={`text-xs px-2 py-0.5 rounded-full ${
                                    coupon.active
                                      ? 'bg-green-500/20 text-green-400'
                                      : 'bg-gray-600/20 text-gray-500'
                                  }`}
                                >
                                  {coupon.active ? 'Ativo' : 'Inativo'}
                                </span>
                              </div>
                              <p className="text-sm text-gray-400">
                                <span className="text-yellow-400 font-semibold">{coupon.discount}%</span> de desconto
                                {' • '}
                                <span className="text-gray-500">
                                  {coupon.usageCount} uso{coupon.usageCount !== 1 ? 's' : ''}
                                </span>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleCouponActive(coupon.id)}
                              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                                coupon.active
                                  ? 'bg-green-500/20 hover:bg-green-500/40'
                                  : 'bg-gray-600/20 hover:bg-gray-600/40'
                              }`}
                              title={coupon.active ? 'Desativar' : 'Ativar'}
                            >
                              {coupon.active ? (
                                <ToggleRight className="w-5 h-5 text-green-400" />
                              ) : (
                                <ToggleLeft className="w-5 h-5 text-gray-500" />
                              )}
                            </button>
                            <button
                              onClick={() => handleStartEdit(coupon)}
                              className="w-9 h-9 rounded-lg bg-blue-500/20 flex items-center justify-center hover:bg-blue-500/40 transition-colors"
                              title="Editar"
                            >
                              <Edit2 className="w-4 h-4 text-blue-400" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Excluir cupom "${coupon.code}"?`)) {
                                  deleteCoupon(coupon.id);
                                }
                              }}
                              className="w-9 h-9 rounded-lg bg-red-500/20 flex items-center justify-center hover:bg-red-500/40 transition-colors"
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <LogIn className="w-5 h-5 text-blue-400" />
              </div>
              <TrendingUp className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-3xl font-extrabold text-white">{stats.logins}</p>
            <p className="text-sm text-gray-400 mt-1">Total de Logins</p>
          </div>

          <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-green-400" />
              </div>
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
            <p className="text-3xl font-extrabold text-white">{stats.purchases}</p>
            <p className="text-sm text-gray-400 mt-1">Compras Realizadas</p>
          </div>

          <div className="bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-400" />
              </div>
              <Activity className="w-4 h-4 text-red-400" />
            </div>
            <p className="text-3xl font-extrabold text-white">{stats.cancels}</p>
            <p className="text-sm text-gray-400 mt-1">Cancelamentos</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-400" />
              </div>
              <Activity className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-3xl font-extrabold text-white">{stats.uniqueUsers}</p>
            <p className="text-sm text-gray-400 mt-1">Usuários Únicos</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-2 text-gray-400">
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Filtrar:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all' as const, label: 'Todos', color: 'white' },
                { key: 'login' as const, label: 'Logins', color: 'blue' },
                { key: 'purchase' as const, label: 'Compras', color: 'green' },
                { key: 'cancel' as const, label: 'Cancelamentos', color: 'red' },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    filter === f.key
                      ? f.color === 'blue'
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : f.color === 'green'
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : f.color === 'red'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-white/10 text-white border border-white/20'
                      : 'bg-white/5 text-gray-400 border border-transparent hover:bg-white/10'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="flex-1 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Buscar por nome ou e-mail..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-gray-900/50 border border-white/10 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-bold text-white">Registro de Atividades</h3>
              <span className="bg-white/10 text-gray-400 text-xs font-medium px-2 py-1 rounded-full">
                {filtered.length} registros
              </span>
            </div>
            <button
              onClick={clearLogs}
              className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Limpar logs</span>
            </button>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Activity className="w-12 h-12 text-gray-700 mb-4" />
              <p className="text-gray-500 font-medium">Nenhuma atividade encontrada</p>
              <p className="text-gray-600 text-sm mt-1">
                As atividades dos usuários aparecerão aqui
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {filtered.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start sm:items-center gap-4 px-6 py-4 hover:bg-white/5 transition-colors"
                >
                  <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                    {getActionIcon(log.action)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                      <span className="text-white font-medium text-sm truncate">
                        {log.userName}
                      </span>
                      <span className="text-gray-500 text-xs truncate">{log.userEmail}</span>
                      {getActionLabel(log.action)}
                    </div>
                    <p className="text-gray-400 text-sm mt-1 truncate">{log.details}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-500 shrink-0">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-xs whitespace-nowrap">{log.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
