import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

interface SiteSettings {
  topbar_email: string;
  topbar_phone: string;
  topbar_promo_text: string;
  show_topbar: boolean;
  enable_theme_toggle: boolean;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  carousel_max_items: number;
  carousel_auto_play: boolean;
  carousel_interval: number;
  footer_about_text: string;
  footer_social_facebook: string;
  footer_social_instagram: string;
  footer_social_twitter: string;
  footer_social_linkedin: string;
  footer_social_youtube: string;
}

export default function SiteSettingsManagement() {
  const [settings, setSettings] = useState<SiteSettings>({
    topbar_email: 'jokadamas616@gmail.com',
    topbar_phone: '+352 621 717 862',
    topbar_promo_text: 'Envio grátis em compras acima de €50',
    show_topbar: true,
    enable_theme_toggle: true,
    primary_color: '#f59e0b',
    secondary_color: '#111827',
    accent_color: '#d97706',
    carousel_max_items: 10,
    carousel_auto_play: true,
    carousel_interval: 3000,
    footer_about_text: 'Soluções digitais completas para o seu negócio. Qualidade, inovação e resultados garantidos.',
    footer_social_facebook: 'https://facebook.com',
    footer_social_instagram: 'https://instagram.com',
    footer_social_twitter: 'https://twitter.com',
    footer_social_linkedin: 'https://linkedin.com',
    footer_social_youtube: 'https://youtube.com'
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'header' | 'theme' | 'carousel' | 'footer'>('header');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .single();

      if (error) throw error;

      if (data) {
        setSettings({
          topbar_email: data.topbar_email || settings.topbar_email,
          topbar_phone: data.topbar_phone || settings.topbar_phone,
          topbar_promo_text: data.topbar_promo_text || settings.topbar_promo_text,
          show_topbar: data.show_topbar ?? settings.show_topbar,
          enable_theme_toggle: data.enable_theme_toggle ?? settings.enable_theme_toggle,
          primary_color: data.primary_color || settings.primary_color,
          secondary_color: data.secondary_color || settings.secondary_color,
          accent_color: data.accent_color || settings.accent_color,
          carousel_max_items: data.carousel_max_items || settings.carousel_max_items,
          carousel_auto_play: data.carousel_auto_play ?? settings.carousel_auto_play,
          carousel_interval: data.carousel_interval || settings.carousel_interval,
          footer_about_text: data.footer_about_text || settings.footer_about_text,
          footer_social_facebook: data.footer_social_facebook || settings.footer_social_facebook,
          footer_social_instagram: data.footer_social_instagram || settings.footer_social_instagram,
          footer_social_twitter: data.footer_social_twitter || settings.footer_social_twitter,
          footer_social_linkedin: data.footer_social_linkedin || settings.footer_social_linkedin,
          footer_social_youtube: data.footer_social_youtube || settings.footer_social_youtube
        });
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          id: 1,
          ...settings,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Configurações salvas com sucesso!' });
      
      // Recarregar página após 1 segundo para aplicar mudanças
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Erro ao salvar:', error);
      setMessage({ type: 'error', text: 'Erro ao salvar configurações' });
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'header', label: 'Header & Topbar', icon: 'ri-layout-top-line' },
    { id: 'theme', label: 'Tema & Cores', icon: 'ri-palette-line' },
    { id: 'carousel', label: 'Carousel', icon: 'ri-slideshow-line' },
    { id: 'footer', label: 'Footer & Redes Sociais', icon: 'ri-layout-bottom-line' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Configurações do Site</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Controle completo sobre header, footer, tema e comportamento do site
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer"
        >
          {loading ? (
            <>
              <i className="ri-loader-4-line animate-spin mr-2"></i>
              A guardar...
            </>
          ) : (
            <>
              <i className="ri-save-line mr-2"></i>
              Guardar Alterações
            </>
          )}
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800' 
            : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
        }`}>
          <div className="flex items-center gap-2">
            <i className={message.type === 'success' ? 'ri-checkbox-circle-line' : 'ri-error-warning-line'}></i>
            <span>{message.text}</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-6 py-3 font-medium whitespace-nowrap transition-all duration-200 border-b-2 cursor-pointer ${
                activeTab === tab.id
                  ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <i className={`${tab.icon} mr-2`}></i>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Header & Topbar Settings */}
      {activeTab === 'header' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Configurações do Header</h3>
            <label className="flex items-center gap-3 cursor-pointer">
              <span className="text-sm text-gray-600 dark:text-gray-400">Mostrar Topbar</span>
              <input
                type="checkbox"
                checked={settings.show_topbar}
                onChange={(e) => setSettings({ ...settings, show_topbar: e.target.checked })}
                className="w-5 h-5 text-amber-600 rounded focus:ring-2 focus:ring-amber-500 cursor-pointer"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                E-mail de Contacto
              </label>
              <input
                type="email"
                value={settings.topbar_email}
                onChange={(e) => setSettings({ ...settings, topbar_email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="email@exemplo.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Telefone / WhatsApp
              </label>
              <input
                type="text"
                value={settings.topbar_phone}
                onChange={(e) => setSettings({ ...settings, topbar_phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="+352 621 717 862"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Texto Promocional (Topbar)
              </label>
              <input
                type="text"
                value={settings.topbar_promo_text}
                onChange={(e) => setSettings({ ...settings, topbar_promo_text: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Envio grátis em compras acima de €50"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enable_theme_toggle}
                onChange={(e) => setSettings({ ...settings, enable_theme_toggle: e.target.checked })}
                className="w-5 h-5 text-amber-600 rounded focus:ring-2 focus:ring-amber-500 cursor-pointer"
              />
              <div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">Ativar Toggle Dark/Light Mode</span>
                <p className="text-xs text-gray-500 dark:text-gray-400">Permite aos utilizadores alternar entre modo claro e escuro</p>
              </div>
            </label>
          </div>
        </div>
      )}

      {/* Theme & Colors Settings */}
      {activeTab === 'theme' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 space-y-6">
          <div className="pb-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Cores do Tema</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Personalize as cores principais do site
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cor Primária
              </label>
              <div className="flex gap-3">
                <input
                  type="color"
                  value={settings.primary_color}
                  onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                  className="w-16 h-12 rounded-lg cursor-pointer border-2 border-gray-300 dark:border-gray-600"
                />
                <input
                  type="text"
                  value={settings.primary_color}
                  onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cor Secundária
              </label>
              <div className="flex gap-3">
                <input
                  type="color"
                  value={settings.secondary_color}
                  onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })}
                  className="w-16 h-12 rounded-lg cursor-pointer border-2 border-gray-300 dark:border-gray-600"
                />
                <input
                  type="text"
                  value={settings.secondary_color}
                  onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cor de Destaque
              </label>
              <div className="flex gap-3">
                <input
                  type="color"
                  value={settings.accent_color}
                  onChange={(e) => setSettings({ ...settings, accent_color: e.target.value })}
                  className="w-16 h-12 rounded-lg cursor-pointer border-2 border-gray-300 dark:border-gray-600"
                />
                <input
                  type="text"
                  value={settings.accent_color}
                  onChange={(e) => setSettings({ ...settings, accent_color: e.target.value })}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Preview das Cores</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-lg text-center" style={{ backgroundColor: settings.primary_color }}>
                <span className="text-white font-semibold">Primária</span>
              </div>
              <div className="p-4 rounded-lg text-center" style={{ backgroundColor: settings.secondary_color }}>
                <span className="text-white font-semibold">Secundária</span>
              </div>
              <div className="p-4 rounded-lg text-center" style={{ backgroundColor: settings.accent_color }}>
                <span className="text-white font-semibold">Destaque</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Carousel Settings */}
      {activeTab === 'carousel' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 space-y-6">
          <div className="pb-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Configurações do Carousel</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Controle o comportamento do carousel de produtos em destaque
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Máximo de Itens
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={settings.carousel_max_items}
                onChange={(e) => setSettings({ ...settings, carousel_max_items: parseInt(e.target.value) || 10 })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Número máximo de produtos a exibir no carousel
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Intervalo de Rotação (ms)
              </label>
              <input
                type="number"
                min="1000"
                max="10000"
                step="500"
                value={settings.carousel_interval}
                onChange={(e) => setSettings({ ...settings, carousel_interval: parseInt(e.target.value) || 3000 })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Tempo entre cada transição (em milissegundos)
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.carousel_auto_play}
                onChange={(e) => setSettings({ ...settings, carousel_auto_play: e.target.checked })}
                className="w-5 h-5 text-amber-600 rounded focus:ring-2 focus:ring-amber-500 cursor-pointer"
              />
              <div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">Auto-Play Ativado</span>
                <p className="text-xs text-gray-500 dark:text-gray-400">O carousel roda automaticamente</p>
              </div>
            </label>
          </div>
        </div>
      )}

      {/* Footer Settings */}
      {activeTab === 'footer' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 space-y-6">
          <div className="pb-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Configurações do Footer</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Personalize o rodapé e links de redes sociais
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Texto Sobre a Empresa
            </label>
            <textarea
              value={settings.footer_about_text}
              onChange={(e) => setSettings({ ...settings, footer_about_text: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
              placeholder="Descrição breve da empresa..."
            />
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Redes Sociais</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                  <i className="ri-facebook-fill"></i>
                </div>
                <input
                  type="url"
                  value={settings.footer_social_facebook}
                  onChange={(e) => setSettings({ ...settings, footer_social_facebook: e.target.value })}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="https://facebook.com/..."
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-lg">
                  <i className="ri-instagram-line"></i>
                </div>
                <input
                  type="url"
                  value={settings.footer_social_instagram}
                  onChange={(e) => setSettings({ ...settings, footer_social_instagram: e.target.value })}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="https://instagram.com/..."
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg">
                  <i className="ri-twitter-x-line"></i>
                </div>
                <input
                  type="url"
                  value={settings.footer_social_twitter}
                  onChange={(e) => setSettings({ ...settings, footer_social_twitter: e.target.value })}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="https://twitter.com/..."
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg">
                  <i className="ri-linkedin-fill"></i>
                </div>
                <input
                  type="url"
                  value={settings.footer_social_linkedin}
                  onChange={(e) => setSettings({ ...settings, footer_social_linkedin: e.target.value })}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="https://linkedin.com/..."
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg">
                  <i className="ri-youtube-fill"></i>
                </div>
                <input
                  type="url"
                  value={settings.footer_social_youtube}
                  onChange={(e) => setSettings({ ...settings, footer_social_youtube: e.target.value })}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="https://youtube.com/..."
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
