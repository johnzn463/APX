import { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Trash2,
  ShoppingBag,
  MessageCircle,
  Minus,
  Plus,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Percent,
  User,
  Phone,
  MapPin,
  CreditCard,
  Package,
  Sparkles,
  Gift,
  Zap,
} from 'lucide-react';

type CheckoutStep = 'cart' | 'info' | 'confirm';

interface CustomerInfo {
  name: string;
  phone: string;
  city: string;
  notes: string;
}

export default function Cart() {
  const {
    cart,
    isCartOpen,
    setCartOpen,
    removeFromCart,
    cancelPurchase,
    addToCart,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    user,
  } = useApp();

  const [couponCode, setCouponCode] = useState('');
  const [couponMessage, setCouponMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [step, setStep] = useState<CheckoutStep>('cart');
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: user?.name || '',
    phone: '',
    city: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Partial<CustomerInfo>>({});

  const subtotal = cart.reduce((sum, item) => sum + item.plan.price * item.quantity, 0);
  const discount = appliedCoupon ? (subtotal * appliedCoupon.discount) / 100 : 0;
  const total = subtotal - discount;
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleApplyCoupon = () => {
    const result = applyCoupon(couponCode);
    setCouponMessage({ type: result.success ? 'success' : 'error', text: result.message });
    if (result.success) {
      setCouponCode('');
      setTimeout(() => setCouponMessage(null), 3000);
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponMessage(null);
  };

  const validateInfo = (): boolean => {
    const newErrors: Partial<CustomerInfo> = {};
    
    if (!customerInfo.name.trim() || customerInfo.name.trim().length < 3) {
      newErrors.name = 'Nome obrigatório';
    }
    if (!customerInfo.phone.trim() || customerInfo.phone.length < 10) {
      newErrors.phone = 'Telefone inválido';
    }
    if (!customerInfo.city.trim()) {
      newErrors.city = 'Cidade obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (step === 'cart') {
      setStep('info');
    } else if (step === 'info') {
      if (validateInfo()) {
        setStep('confirm');
      }
    }
  };

  const handlePrevStep = () => {
    if (step === 'info') {
      setStep('cart');
    } else if (step === 'confirm') {
      setStep('info');
    }
  };

  const handleCheckout = () => {
    const couponInfo = appliedCoupon
      ? `\n🎟️ Cupom: ${appliedCoupon.code} (-${appliedCoupon.discount}%)\n💰 Desconto: -R$${discount.toFixed(2)}`
      : '';

    const itemsList = cart
      .map((i) => `• ${i.plan.name} (x${i.quantity}) - R$${(i.plan.price * i.quantity).toFixed(2)}`)
      .join('\n');

    const msg = encodeURIComponent(
`🚀 *NOVO PEDIDO - APX PROJECT*

👤 *Dados do Cliente:*
Nome: ${customerInfo.name}
Telefone: ${customerInfo.phone}
Cidade: ${customerInfo.city}
E-mail: ${user?.email || 'Não informado'}
${customerInfo.notes ? `\n📝 Observações: ${customerInfo.notes}` : ''}

🛒 *Itens do Pedido:*
${itemsList}
${couponInfo}

💵 *Total: R$${total.toFixed(2)}/mês*

Aguardando confirmação de pagamento! 🙏`
    );

    window.open(`https://wa.me/5571992773339?text=${msg}`, '_blank');
    
    // Reset
    setStep('cart');
    setCustomerInfo({ name: user?.name || '', phone: '', city: '', notes: '' });
    setCartOpen(false);
  };

  const handleClose = () => {
    setCartOpen(false);
    setStep('cart');
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  return (
    <>
      {isCartOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
          onClick={handleClose}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-full max-w-lg bg-gray-950 border-l border-white/10 z-50 transform transition-transform duration-300 ease-out flex flex-col ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-gray-900/50">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
              {step === 'cart' && <ShoppingBag className="w-5 h-5 text-white" />}
              {step === 'info' && <User className="w-5 h-5 text-white" />}
              {step === 'confirm' && <Package className="w-5 h-5 text-white" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {step === 'cart' && 'Seu Carrinho'}
                {step === 'info' && 'Seus Dados'}
                {step === 'confirm' && 'Confirmar Pedido'}
              </h2>
              <p className="text-sm text-gray-400">
                {step === 'cart' && `${totalItems} ${totalItems === 1 ? 'item' : 'itens'}`}
                {step === 'info' && 'Preencha para continuar'}
                {step === 'confirm' && 'Revise antes de finalizar'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Progress Steps */}
        {cart.length > 0 && (
          <div className="px-5 py-3 border-b border-white/5 bg-gray-900/30">
            <div className="flex items-center gap-2">
              {['cart', 'info', 'confirm'].map((s, i) => (
                <div key={s} className="flex items-center flex-1">
                  <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all ${
                    step === s 
                      ? 'bg-purple-500 text-white' 
                      : i < ['cart', 'info', 'confirm'].indexOf(step)
                        ? 'bg-green-500 text-white'
                        : 'bg-white/10 text-gray-500'
                  }`}>
                    {i < ['cart', 'info', 'confirm'].indexOf(step) ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      i + 1
                    )}
                  </div>
                  {i < 2 && (
                    <div className={`flex-1 h-0.5 mx-2 rounded-full transition-all ${
                      i < ['cart', 'info', 'confirm'].indexOf(step) ? 'bg-green-500' : 'bg-white/10'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* CART STEP */}
          {step === 'cart' && (
            <div className="p-5 space-y-4">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <ShoppingBag className="w-10 h-10 text-gray-600" />
                  </div>
                  <p className="text-lg font-semibold text-gray-400">Carrinho vazio</p>
                  <p className="text-sm text-gray-500 mt-1">Adicione um plano para começar</p>
                  <button
                    onClick={handleClose}
                    className="mt-6 px-6 py-2.5 bg-purple-500/20 text-purple-400 rounded-xl font-medium hover:bg-purple-500/30 transition-colors"
                  >
                    Ver Planos
                  </button>
                </div>
              ) : (
                <>
                  {cart.map((item) => (
                    <div
                      key={item.plan.id}
                      className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden group hover:border-purple-500/30 transition-all"
                    >
                      <div className="flex gap-4 p-4">
                        <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0">
                          <img
                            src={item.plan.image}
                            alt={item.plan.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="text-white font-semibold text-sm">{item.plan.name}</h3>
                              <span className={`inline-block mt-1 bg-gradient-to-r ${item.plan.badgeColor} text-white text-[10px] font-bold px-2 py-0.5 rounded-full`}>
                                {item.plan.badge}
                              </span>
                            </div>
                            <button
                              onClick={() => cancelPurchase(item.plan.id)}
                              className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
                              <button
                                onClick={() => {
                                  if (item.quantity > 1) {
                                    removeFromCart(item.plan.id);
                                    for (let i = 1; i < item.quantity; i++) {
                                      addToCart(item.plan);
                                    }
                                  }
                                }}
                                disabled={item.quantity <= 1}
                                className="w-7 h-7 rounded-md bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors disabled:opacity-30"
                              >
                                <Minus className="w-3 h-3 text-gray-400" />
                              </button>
                              <span className="w-8 text-center text-white font-medium text-sm">{item.quantity}</span>
                              <button
                                onClick={() => addToCart(item.plan)}
                                className="w-7 h-7 rounded-md bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                              >
                                <Plus className="w-3 h-3 text-gray-400" />
                              </button>
                            </div>
                            <p className="text-purple-400 font-bold">
                              R$ {(item.plan.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Coupon Section */}
                  <div className="bg-gradient-to-r from-purple-500/5 to-indigo-500/5 border border-purple-500/20 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center gap-2 text-purple-400">
                      <Gift className="w-4 h-4" />
                      <span className="text-sm font-medium">Cupom de desconto</span>
                    </div>

                    {appliedCoupon ? (
                      <div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 rounded-xl p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                            <Percent className="w-5 h-5 text-green-400" />
                          </div>
                          <div>
                            <p className="text-green-400 font-bold text-sm">{appliedCoupon.code}</p>
                            <p className="text-green-400/70 text-xs">-{appliedCoupon.discount}% aplicado</p>
                          </div>
                        </div>
                        <button onClick={handleRemoveCoupon} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                          <X className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => {
                            setCouponCode(e.target.value.toUpperCase());
                            setCouponMessage(null);
                          }}
                          placeholder="CÓDIGO DO CUPOM"
                          className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 uppercase font-mono"
                        />
                        <button
                          onClick={handleApplyCoupon}
                          className="px-5 py-3 bg-purple-500/20 border border-purple-500/30 rounded-xl text-purple-400 font-semibold text-sm hover:bg-purple-500/30 transition-colors"
                        >
                          Aplicar
                        </button>
                      </div>
                    )}

                    {couponMessage && (
                      <div className={`flex items-center gap-2 text-sm ${couponMessage.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                        {couponMessage.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                        {couponMessage.text}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* INFO STEP */}
          {step === 'info' && (
            <div className="p-5 space-y-4">
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-purple-400 shrink-0" />
                <p className="text-sm text-purple-300">
                  Preencha seus dados para enviarmos o pedido via WhatsApp
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm text-gray-400">Nome completo *</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="text"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                      placeholder="Seu nome"
                      className={`w-full pl-12 pr-4 py-3.5 bg-white/5 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${errors.name ? 'border-red-500/50 focus:ring-red-500/50' : 'border-white/10 focus:ring-purple-500/50'}`}
                    />
                  </div>
                  {errors.name && <p className="text-xs text-red-400">{errors.name}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm text-gray-400">Telefone/WhatsApp *</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, phone: formatPhone(e.target.value) })}
                      placeholder="(00) 00000-0000"
                      maxLength={16}
                      className={`w-full pl-12 pr-4 py-3.5 bg-white/5 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${errors.phone ? 'border-red-500/50 focus:ring-red-500/50' : 'border-white/10 focus:ring-purple-500/50'}`}
                    />
                  </div>
                  {errors.phone && <p className="text-xs text-red-400">{errors.phone}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm text-gray-400">Cidade/Estado *</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="text"
                      value={customerInfo.city}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, city: e.target.value })}
                      placeholder="Ex: Salvador - BA"
                      className={`w-full pl-12 pr-4 py-3.5 bg-white/5 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${errors.city ? 'border-red-500/50 focus:ring-red-500/50' : 'border-white/10 focus:ring-purple-500/50'}`}
                    />
                  </div>
                  {errors.city && <p className="text-xs text-red-400">{errors.city}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm text-gray-400">Observações (opcional)</label>
                  <textarea
                    value={customerInfo.notes}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, notes: e.target.value })}
                    placeholder="Alguma informação adicional..."
                    rows={3}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* CONFIRM STEP */}
          {step === 'confirm' && (
            <div className="p-5 space-y-4">
              {/* Order Summary */}
              <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <div className="px-4 py-3 bg-white/5 border-b border-white/10">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <Package className="w-4 h-4 text-purple-400" />
                    Resumo do Pedido
                  </h3>
                </div>
                <div className="p-4 space-y-3">
                  {cart.map((item) => (
                    <div key={item.plan.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img src={item.plan.image} alt={item.plan.name} className="w-10 h-10 rounded-lg object-cover" />
                        <div>
                          <p className="text-white text-sm font-medium">{item.plan.name}</p>
                          <p className="text-gray-500 text-xs">Qtd: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="text-white font-semibold text-sm">R$ {(item.plan.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer Info Summary */}
              <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <div className="px-4 py-3 bg-white/5 border-b border-white/10">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <User className="w-4 h-4 text-purple-400" />
                    Dados do Cliente
                  </h3>
                </div>
                <div className="p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Nome:</span>
                    <span className="text-white">{customerInfo.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Telefone:</span>
                    <span className="text-white">{customerInfo.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Cidade:</span>
                    <span className="text-white">{customerInfo.city}</span>
                  </div>
                  {customerInfo.notes && (
                    <div className="pt-2 border-t border-white/5">
                      <span className="text-gray-400">Obs:</span>
                      <p className="text-white mt-1">{customerInfo.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Methods */}
              <div className="bg-gradient-to-r from-green-500/5 to-emerald-500/5 border border-green-500/20 rounded-2xl p-4">
                <h3 className="font-semibold text-white flex items-center gap-2 mb-3">
                  <CreditCard className="w-4 h-4 text-green-400" />
                  Formas de Pagamento
                </h3>
                <div className="flex flex-wrap gap-2">
                  {['PIX', 'Cartão', 'Boleto', 'Transferência'].map((method) => (
                    <span key={method} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300">
                      {method}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  * O pagamento será tratado diretamente via WhatsApp
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="border-t border-white/10 p-5 space-y-4 bg-gray-900/50">
            {/* Price Summary */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Subtotal:</span>
                <span className="text-white">R$ {subtotal.toFixed(2)}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-400">Desconto ({appliedCoupon.discount}%):</span>
                  <span className="text-green-400">- R$ {discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t border-white/10">
                <span className="text-gray-300">Total:</span>
                <div className="text-right">
                  {appliedCoupon && (
                    <span className="text-gray-500 line-through text-sm mr-2">R$ {subtotal.toFixed(2)}</span>
                  )}
                  <span className="text-2xl font-bold text-white">R$ {total.toFixed(2)}</span>
                  <span className="text-gray-400 text-sm">/mês</span>
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-3">
              {step !== 'cart' && (
                <button
                  onClick={handlePrevStep}
                  className="flex-1 py-3.5 rounded-xl font-semibold text-gray-300 bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar
                </button>
              )}
              
              {step !== 'confirm' ? (
                <button
                  onClick={handleNextStep}
                  className="flex-1 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20"
                >
                  Continuar
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleCheckout}
                  className="flex-1 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
                >
                  <MessageCircle className="w-5 h-5" />
                  Finalizar no WhatsApp
                  <Zap className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
