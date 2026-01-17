
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

interface ThemeEditorProps {
  darkMode: boolean;
}

export default function ThemeEditor({ darkMode }: ThemeEditorProps) {
  const [settings, setSettings] = useState({
    site_name: 'JokaTech',
    site_tagline: 'Sua loja de tecnologia',
    primary_color: '#EAB308',
    secondary_color: '#000000',
    accent_color: '#F59E0B',
    success_color: '#10B981',
    warning_color: '#F59E0B',
    error_color: '#EF4444',
    font_family: 'Inter',
    font_size_base: '16',
    logo_url: '',
    logo_footer_url: '',
    logo_mobile_url: '',
    favicon_url: '',
    header_style: 'fixed',
    header_bg_color: '#000000',
    footer_bg_color: '#1F2937',
    enable_dark_mode: true,
    default_theme: 'dark',
  });

  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const { data } = await supabase
      .from('site_settings')
      .select('*')
      .single();
    
    if (data) {
      setSettings(prev => ({ ...prev, ...data.settings }));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          id: 1,
          settings,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      alert('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar configurações');
    } finally {
      setLoading(false);
    }
  };

  const googleFonts = [
    'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins', 
    'Raleway', 'Nunito', 'Playfair Display', 'Merriweather'
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <i className="ri-palette-line text-yellow-500"></i>
            Editor de Tema & Design
          </h2>
          <p className="text-gray-400 mt-1">Configure a aparência visual do seu site</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className={`px-4 py-2 rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-300'} hover:bg-gray-800 transition-colors flex items-center gap-2 whitespace-nowrap`}
          >
            <i className={`ri-${previewMode ? 'eye-off' : 'eye'}-line`}></i>
            {previewMode ? 'Ocultar Preview' : 'Mostrar Preview'}
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-medium rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 whitespace-nowrap"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                Salvando...
              </>
            ) : (
              <>
                <i className="ri-save-line"></i>
                Salvar Alterações
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informações Básicas */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 space-y-4`}>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <i className="ri-information-line text-yellow-500"></i>
            Informações do Site
          </h3>

          <div>
            <label className="block text-sm font-medium mb-2">Nome do Site</label>
            <input
              type="text"
              value={settings.site_name}
              onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'} border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Slogan/Tagline</label>
            <input
              type="text"
              value={settings.site_tagline}
              onChange={(e) => setSettings({ ...settings, site_tagline: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'} border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Fonte Principal</label>
            <select
              value={settings.font_family}
              onChange={(e) => setSettings({ ...settings, font_family: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'} border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
            >
              {googleFonts.map(font => (
                <option key={font} value={font}>{font}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Tamanho Base da Fonte (px)</label>
            <input
              type="number"
              value={settings.font_size_base}
              onChange={(e) => setSettings({ ...settings, font_size_base: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'} border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
            />
          </div>
        </div>

        {/* Cores do Tema */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 space-y-4`}>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <i className="ri-paint-brush-line text-yellow-500"></i>
            Paleta de Cores
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Cor Primária</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings.primary_color}
                  onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                  className="w-12 h-10 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.primary_color}
                  onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                  className={`flex-1 px-3 py-2 rounded-lg ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'} border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Cor Secundária</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings.secondary_color}
                  onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })}
                  className="w-12 h-10 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.secondary_color}
                  onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })}
                  className={`flex-1 px-3 py-2 rounded-lg ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'} border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Cor de Destaque</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings.accent_color}
                  onChange={(e) => setSettings({ ...settings, accent_color: e.target.value })}
                  className="w-12 h-10 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.accent_color}
                  onChange={(e) => setSettings({ ...settings, accent_color: e.target.value })}
                  className={`flex-1 px-3 py-2 rounded-lg ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'} border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Cor de Sucesso</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings.success_color}
                  onChange={(e) => setSettings({ ...settings, success_color: e.target.value })}
                  className="w-12 h-10 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.success_color}
                  onChange={(e) => setSettings({ ...settings, success_color: e.target.value })}
                  className={`flex-1 px-3 py-2 rounded-lg ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'} border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Cor de Aviso</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings.warning_color}
                  onChange={(e) => setSettings({ ...settings, warning_color: e.target.value })}
                  className="w-12 h-10 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.warning_color}
                  onChange={(e) => setSettings({ ...settings, warning_color: e.target.value })}
                  className={`flex-1 px-3 py-2 rounded-lg ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'} border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Cor de Erro</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings.error_color}
                  onChange={(e) => setSettings({ ...settings, error_color: e.target.value })}
                  className="w-12 h-10 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.error_color}
                  onChange={(e) => setSettings({ ...settings, error_color: e.target.value })}
                  className={`flex-1 px-3 py-2 rounded-lg ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'} border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Logos */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 space-y-4`}>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <i className="ri-image-line text-yellow-500"></i>
            Logos & Ícones
          </h3>

          <div>
            <label className="block text-sm font-medium mb-2">Logo Principal (URL)</label>
            <input
              type="text"
              value={settings.logo_url}
              onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })}
              placeholder="https://exemplo.com/logo.png"
              className={`w-full px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'} border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Logo Footer (URL)</label>
            <input
              type="text"
              value={settings.logo_footer_url}
              onChange={(e) => setSettings({ ...settings, logo_footer_url: e.target.value })}
              placeholder="https://exemplo.com/logo-footer.png"
              className={`w-full px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'} border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Logo Mobile (URL)</label>
            <input
              type="text"
              value={settings.logo_mobile_url}
              onChange={(e) => setSettings({ ...settings, logo_mobile_url: e.target.value })}
              placeholder="https://exemplo.com/logo-mobile.png"
              className={`w-full px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'} border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Favicon (URL)</label>
            <input
              type="text"
              value={settings.favicon_url}
              onChange={(e) => setSettings({ ...settings, favicon_url: e.target.value })}
              placeholder="https://exemplo.com/favicon.ico"
              className={`w-full px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'} border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
            />
          </div>
        </div>

        {/* Header & Footer */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 space-y-4`}>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <i className="ri-layout-line text-yellow-500"></i>
            Header & Footer
          </h3>

          <div>
            <label className="block text-sm font-medium mb-2">Estilo do Header</label>
            <select
              value={settings.header_style}
              onChange={(e) => setSettings({ ...settings, header_style: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'} border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
            >
              <option value="fixed">Fixo no Topo</option>
              <option value="sticky">Sticky (Cola ao Scroll)</option>
              <option value="static">Estático</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Cor de Fundo do Header</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={settings.header_bg_color}
                onChange={(e) => setSettings({ ...settings, header_bg_color: e.target.value })}
                className="w-12 h-10 rounded cursor-pointer"
              />
              <input
                type="text"
                value={settings.header_bg_color}
                onChange={(e) => setSettings({ ...settings, header_bg_color: e.target.value })}
                className={`flex-1 px-3 py-2 rounded-lg ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'} border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Cor de Fundo do Footer</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={settings.footer_bg_color}
                onChange={(e) => setSettings({ ...settings, footer_bg_color: e.target.value })}
                className="w-12 h-10 rounded cursor-pointer"
              />
              <input
                type="text"
                value={settings.footer_bg_color}
                onChange={(e) => setSettings({ ...settings, footer_bg_color: e.target.value })}
                className={`flex-1 px-3 py-2 rounded-lg ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'} border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
              />
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="enable_dark_mode"
                checked={settings.enable_dark_mode}
                onChange={(e) => setSettings({ ...settings, enable_dark_mode: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300"
              />
              <label htmlFor="enable_dark_mode" className="text-sm font-medium">Habilitar Modo Escuro</label>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Tema Padrão</label>
              <select
                value={settings.default_theme}
                onChange={(e) => setSettings({ ...settings, default_theme: e.target.value })}
                className={`w-full px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'} border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
              >
                <option value="dark">Escuro</option>
                <option value="light">Claro</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Preview em Tempo Real */}
      {previewMode && (
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6`}>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <i className="ri-eye-line text-yellow-500"></i>
            Preview em Tempo Real
          </h3>
          <div 
            className="border-2 border-dashed border-gray-700 rounded-lg p-8"
            style={{
              fontFamily: settings.font_family,
              fontSize: `${settings.font_size_base}px`,
            }}
          >
            <div 
              className="p-4 rounded-lg mb-4"
              style={{ backgroundColor: settings.header_bg_color }}
            >
              <h1 className="text-2xl font-bold" style={{ color: settings.primary_color }}>
                {settings.site_name}
              </h1>
              <p className="text-sm" style={{ color: settings.accent_color }}>
                {settings.site_tagline}
              </p>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="p-4 rounded-lg text-center" style={{ backgroundColor: settings.primary_color }}>
                <p className="text-sm font-medium text-black">Primária</p>
              </div>
              <div className="p-4 rounded-lg text-center" style={{ backgroundColor: settings.accent_color }}>
                <p className="text-sm font-medium text-black">Destaque</p>
              </div>
              <div className="p-4 rounded-lg text-center" style={{ backgroundColor: settings.success_color }}>
                <p className="text-sm font-medium text-white">Sucesso</p>
              </div>
              <div className="p-4 rounded-lg text-center" style={{ backgroundColor: settings.error_color }}>
                <p className="text-sm font-medium text-white">Erro</p>
              </div>
            </div>

            <div 
              className="p-4 rounded-lg"
              style={{ backgroundColor: settings.footer_bg_color }}
            >
              <p className="text-sm text-center text-gray-400">Footer Preview</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
