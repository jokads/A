import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

interface MarketingManagementProps {
  darkMode: boolean;
}

export default function MarketingManagement({ darkMode }: MarketingManagementProps) {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCouponModal, setShowCouponModal] = useState(false);

  useEffect(() => {
    loadMarketingData();
  }, []);

  const loadMarketingData = async () => {
    try {
      const [campaignsRes, couponsRes] = await Promise.all([
        supabase.from('marketing_campaigns').select('*').order('created_at', { ascending: false }),
        supabase.from('coupons').select('*').order('created_at', { ascending: false })
      ]);

      setCampaigns(campaignsRes.data || []);
      setCoupons(couponsRes.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados de marketing:', error);
    } finally {
      setLoading(false);
    }
  };

  const controls = [
    { id: 1, name: 'Cupons de Desconto', icon: 'ri-coupon-line' },
    { id: 2, name: 'Regras Promocionais', icon: 'ri-price-tag-3-line' },
    { id: 3, name: 'Scheduling Promoções', icon: 'ri-calendar-event-line' },
    { id: 4, name: 'ROI Campanhas', icon: 'ri-line-chart-line' },
    { id: 5, name: 'Upsell One-Click', icon: 'ri-arrow-up-circle-line' },
    { id: 6, name: 'Push/Web Notifications', icon: 'ri-notification-3-line' },
    { id: 7, name: 'Pixel Tracking', icon: 'ri-eye-line' },
    { id: 8, name: 'Banner Tool', icon: 'ri-image-add-line' },
    { id: 9, name: 'A/B Landing Pages', icon: 'ri-test-tube-line' }
  ];

  return (
    <div className="space-y-6">
      <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} border ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <i className="ri-function-line text-yellow-500"></i>
          9+ Controles de Promoções & Marketing
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {controls.map(control => (
            <div
              key={control.id}
              className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <i className={`${control.icon} text-yellow-500`}></i>
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
              </div>
              <p className="text-xs font-medium">{control.name}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} border ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Cupons Ativos</h3>
            <button
              onClick={() => setShowCouponModal(true)}
              className="p-2 rounded-lg bg-yellow-500 text-black hover:bg-yellow-600 transition-colors"
            >
              <i className="ri-add-line text-xl"></i>
            </button>
          </div>
          <div className="space-y-3">
            {coupons.length === 0 ? (
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Nenhum cupom criado</p>
            ) : (
              coupons.slice(0, 5).map((coupon) => (
                <div key={coupon.id} className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono font-bold text-yellow-500">{coupon.code}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      coupon.is_active ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'
                    }`}>
                      {coupon.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                    {coupon.description}
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                      Usado: {coupon.usage_count || 0}/{coupon.usage_limit || '∞'}
                    </span>
                    <span className="text-yellow-500 font-medium">
                      {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `R$ ${coupon.discount_value}`}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={`lg:col-span-2 p-6 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} border ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Campanhas de Marketing</h3>
            <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-medium rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 whitespace-nowrap">
              <i className="ri-add-line text-xl"></i>
              Nova Campanha
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-12">
              <i className="ri-megaphone-line text-6xl text-gray-600 mb-4"></i>
              <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Nenhuma campanha criada ainda
              </p>
              <button className="mt-4 px-6 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-medium rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap">
                Criar Primeira Campanha
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-bold text-lg">{campaign.name}</h4>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {campaign.description}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      campaign.status === 'running'
                        ? 'bg-green-500/20 text-green-500'
                        : campaign.status === 'scheduled'
                        ? 'bg-blue-500/20 text-blue-500'
                        : campaign.status === 'completed'
                        ? 'bg-gray-500/20 text-gray-500'
                        : 'bg-yellow-500/20 text-yellow-500'
                    }`}>
                      {campaign.status === 'running' ? 'Em Execução' : 
                       campaign.status === 'scheduled' ? 'Agendada' :
                       campaign.status === 'completed' ? 'Concluída' : 'Rascunho'}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-3">
                    <div>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Enviados</p>
                      <p className="text-lg font-bold">{campaign.sent_count || 0}</p>
                    </div>
                    <div>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Abertos</p>
                      <p className="text-lg font-bold text-blue-500">{campaign.opened_count || 0}</p>
                    </div>
                    <div>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Cliques</p>
                      <p className="text-lg font-bold text-purple-500">{campaign.clicked_count || 0}</p>
                    </div>
                    <div>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Conversões</p>
                      <p className="text-lg font-bold text-green-500">{campaign.conversion_count || 0}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-yellow-500">
                      ROI: R$ {campaign.revenue?.toFixed(2) || '0.00'}
                    </span>
                    <div className="flex items-center gap-2">
                      <button className="p-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors">
                        <i className="ri-edit-line"></i>
                      </button>
                      <button className="p-2 rounded-lg bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 transition-colors">
                        <i className="ri-bar-chart-line"></i>
                      </button>
                      <button className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors">
                        <i className="ri-delete-bin-line"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: 'Taxa de Abertura', value: '24.5%', icon: 'ri-mail-open-line', color: 'blue' },
          { title: 'Taxa de Clique', value: '8.2%', icon: 'ri-cursor-line', color: 'purple' },
          { title: 'Taxa de Conversão', value: '3.1%', icon: 'ri-shopping-cart-line', color: 'green' }
        ].map((stat, index) => (
          <div
            key={index}
            className={`p-6 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} border ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}
          >
            <div className={`w-12 h-12 rounded-lg bg-${stat.color}-500/20 flex items-center justify-center mb-4`}>
              <i className={`${stat.icon} text-2xl text-${stat.color}-500`}></i>
            </div>
            <h3 className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>{stat.title}</h3>
            <p className="text-3xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
