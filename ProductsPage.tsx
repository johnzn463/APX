import { useApp } from '../context/AppContext';
import ProductCard from './ProductCard';
import Cart from './Cart';
import { plans } from '../data/plans';
import {
  ShoppingCart,
  LogOut,
  MessageCircle,
  Sparkles,
  Shield,
  Zap,
  ChevronDown,
  Bot,
  Users,
  BarChart3,
  Clock,
} from 'lucide-react';

export default function ProductsPage() {
  const { user, cart, toggleCart, logout } = useApp();
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen relative">
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/images/hero-bg.jpg)' }}
      />
      <div className="fixed inset-0 bg-gradient-to-b from-gray-950/90 via-gray-950/80 to-gray-950/95" />

      <nav className="sticky top-0 z-30 bg-gray-950/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">
              APX<span className="text-purple-400">PROJECT</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                <span className="text-sm font-bold text-purple-400">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-sm text-gray-300">{user?.name}</span>
            </div>

            <button
              onClick={toggleCart}
              className="relative w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all group"
            >
              <ShoppingCart className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  {totalItems}
                </span>
              )}
            </button>

            <button
              onClick={logout}
              className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-red-500/20 hover:border-red-500/30 transition-all group"
            >
              <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-400" />
            </button>
          </div>
        </div>
      </nav>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="py-20 px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-5 py-2 mb-6">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-purple-300 font-medium">
                Automação de WhatsApp #1 do Brasil
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
              Potencialize seu negócio com
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400">
                {' '}bots inteligentes
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Automatize vendas, suporte e engajamento 24/7. Aumente sua produtividade em até 300% com nossos bots de WhatsApp.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-6 mb-12">
              <div className="flex items-center gap-2 text-gray-300">
                <Bot className="w-5 h-5 text-purple-400" />
                <span className="text-sm">IA Avançada</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <Shield className="w-5 h-5 text-blue-400" />
                <span className="text-sm">100% Seguro</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <Clock className="w-5 h-5 text-green-400" />
                <span className="text-sm">24/7 Ativo</span>
              </div>
            </div>

            <a
              href="#plans"
              className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
            >
              <span className="text-sm font-medium">Ver planos</span>
              <ChevronDown className="w-5 h-5 animate-bounce" />
            </a>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 px-4">
          <div className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { value: '10K+', label: 'Clientes ativos', icon: <Users className="w-5 h-5" /> },
              { value: '50M+', label: 'Mensagens/mês', icon: <MessageCircle className="w-5 h-5" /> },
              { value: '99.9%', label: 'Uptime garantido', icon: <BarChart3 className="w-5 h-5" /> },
              { value: '24/7', label: 'Suporte premium', icon: <Clock className="w-5 h-5" /> },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-5 text-center hover:bg-white/10 transition-all"
              >
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 mb-3">
                  {stat.icon}
                </div>
                <p className="text-3xl font-extrabold text-white">{stat.value}</p>
                <p className="text-sm text-gray-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-white mb-4">
              Como <span className="text-purple-400">funciona?</span>
            </h2>
            <p className="text-center text-gray-400 mb-12 max-w-xl mx-auto">
              Em apenas 3 passos simples, seu bot estará funcionando
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: '01',
                  title: 'Escolha seu plano',
                  desc: 'Selecione o plano ideal para o tamanho do seu negócio.',
                  icon: <ShoppingCart className="w-6 h-6" />,
                },
                {
                  step: '02',
                  title: 'Configuramos tudo',
                  desc: 'Nossa equipe configura o bot no seu grupo em até 24h.',
                  icon: <Zap className="w-6 h-6" />,
                },
                {
                  step: '03',
                  title: 'Comece a vender',
                  desc: 'Seu bot trabalha 24/7, automatizando vendas e suporte.',
                  icon: <BarChart3 className="w-6 h-6" />,
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 hover:border-purple-500/30 transition-all group"
                >
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white mb-4 group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <div className="absolute top-4 right-4 text-5xl font-extrabold text-white/5">{item.step}</div>
                  <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-gray-400 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Plans */}
        <section id="plans" className="py-16 px-4 scroll-mt-20">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-white mb-4">
              Nossos <span className="text-purple-400">Planos</span>
            </h2>
            <p className="text-center text-gray-400 mb-12 max-w-xl mx-auto">
              Escolha o plano perfeito para automatizar seu WhatsApp. Todos incluem suporte e atualizações.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {plans.map((plan, idx) => (
                <ProductCard key={plan.id} plan={plan} featured={idx === 1} />
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-white mb-12">
              Perguntas <span className="text-purple-400">Frequentes</span>
            </h2>
            <div className="space-y-4">
              {[
                {
                  q: 'Como o bot é instalado no meu grupo?',
                  a: 'Após a compra, você receberá instruções para adicionar o número do bot ao seu grupo. A configuração é feita pela nossa equipe em até 24 horas.',
                },
                {
                  q: 'Posso personalizar as mensagens do bot?',
                  a: 'Sim! Todos os planos permitem personalização das mensagens. Nos planos Pro e Enterprise, você tem controle total sobre fluxos e respostas.',
                },
                {
                  q: 'O bot funciona 24 horas?',
                  a: 'Sim! O bot opera 24 horas por dia, 7 dias por semana, sem paradas. Garantimos 99.9% de uptime.',
                },
                {
                  q: 'Aceita quais formas de pagamento?',
                  a: 'Aceitamos PIX, cartão de crédito, boleto bancário e transferência.',
                },
              ].map((faq, i) => (
                <details
                  key={i}
                  className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-purple-500/30 transition-all"
                >
                  <summary className="flex items-center justify-between p-5 cursor-pointer hover:bg-white/5 transition-colors list-none">
                    <span className="text-white font-semibold pr-4">{faq.q}</span>
                    <ChevronDown className="w-5 h-5 text-gray-400 shrink-0 group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="px-5 pb-5">
                    <p className="text-gray-400 text-sm leading-relaxed">{faq.a}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10 py-8 px-4">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-400" />
              <span className="text-sm text-gray-400">
                © 2024 APX PROJECT. Todos os direitos reservados.
              </span>
            </div>
            <a
              href="https://wa.me/5571992773339"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-purple-400 hover:text-purple-300 text-sm transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Fale conosco
            </a>
          </div>
        </footer>
      </div>

      <Cart />
    </div>
  );
}
