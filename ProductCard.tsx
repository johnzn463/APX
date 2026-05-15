import { Plan } from '../types';
import { useApp } from '../context/AppContext';
import {
  ShoppingCart,
  Check,
  MessageSquare,
  Users,
  Headphones,
  Zap,
  Star,
  Sparkles,
} from 'lucide-react';

interface ProductCardProps {
  plan: Plan;
  featured?: boolean;
}

export default function ProductCard({ plan, featured }: ProductCardProps) {
  const { addToCart, cart } = useApp();
  const inCart = cart.some((item) => item.plan.id === plan.id);

  return (
    <div
      className={`relative rounded-3xl overflow-hidden transition-all duration-500 hover:scale-[1.02] group ${
        featured
          ? 'bg-gradient-to-b from-purple-900/60 to-gray-900/80 border-2 border-purple-500/50 shadow-2xl shadow-purple-500/20'
          : 'bg-white/5 backdrop-blur-lg border border-white/10 shadow-xl hover:border-purple-500/30'
      }`}
    >
      {featured && (
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-purple-500 to-indigo-500 text-center py-2 z-10">
          <span className="text-sm font-bold text-white flex items-center justify-center gap-1">
            <Star className="w-4 h-4 fill-white" />
            MAIS POPULAR
            <Star className="w-4 h-4 fill-white" />
          </span>
        </div>
      )}

      <div className={`relative h-52 overflow-hidden ${featured ? 'mt-9' : ''}`}>
        <img
          src={plan.image}
          alt={plan.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />
        <div className="absolute top-4 right-4">
          <span
            className={`bg-gradient-to-r ${plan.badgeColor} text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg`}
          >
            {plan.badge}
          </span>
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
        </div>
      </div>

      <div className="p-6 space-y-5">
        <div className="flex items-baseline gap-1">
          <span className="text-gray-400 text-lg">R$</span>
          <span className="text-5xl font-extrabold text-white">{plan.price}</span>
          <span className="text-gray-400">/mês</span>
        </div>

        <p className="text-gray-300 text-sm leading-relaxed line-clamp-3">{plan.description}</p>

        <div className="grid grid-cols-1 gap-2.5">
          <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3 border border-white/5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Users className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <p className="text-white text-sm font-semibold">Até {plan.groups} grupos</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3 border border-white/5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <p className="text-white text-sm font-semibold">{plan.messages}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3 border border-white/5">
            <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
              <Headphones className="w-4 h-4 text-green-400" />
            </div>
            <div>
              <p className="text-white text-sm font-semibold">{plan.support}</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-purple-400 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            Incluso no plano:
          </p>
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
            {plan.features.slice(0, 6).map((feature, i) => (
              <div key={i} className="flex items-start gap-2">
                <Check className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                <span className="text-gray-300 text-sm">{feature}</span>
              </div>
            ))}
            {plan.features.length > 6 && (
              <p className="text-purple-400 text-xs font-medium mt-2">
                +{plan.features.length - 6} mais recursos
              </p>
            )}
          </div>
        </div>

        <button
          onClick={() => addToCart(plan)}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 ${
            inCart
              ? 'bg-green-600 text-white cursor-default'
              : featured
              ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-500/30 hover:from-purple-400 hover:to-indigo-400'
              : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20 hover:from-purple-500 hover:to-indigo-500'
          }`}
        >
          {inCart ? (
            <>
              <Check className="w-5 h-5" />
              No Carrinho
            </>
          ) : (
            <>
              <ShoppingCart className="w-5 h-5" />
              Adicionar
              <Zap className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
