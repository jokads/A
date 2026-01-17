
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

interface ContentManagementProps {
  darkMode: boolean;
}

export default function ContentManagement({ darkMode }: ContentManagementProps) {
  const [pages, setPages] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContentData();
  }, []);

  const loadContentData = async () => {
    try {
      const [pagesRes, bannersRes, settingsRes] = await Promise.all([
        supabase.from('cms_pages').select('*').order('created_at', { ascending: false }),
        supabase.from('banners').select('*').order('display_order', { ascending: true }),
        supabase.from('site_settings').select('*')
      ]);

      setPages(pagesRes.data || []);
      setBanners(bannersRes.data || []);
      
      const settingsObj: any = {};
      settingsRes.data?.forEach(setting => {
        settingsObj[setting.key] = setting.value;
      });
      setSettings(settingsObj);
    } catch (error) {
      console.error('Erro ao carregar conteúdo:', error);
    } finally {
      setLoading(false);
    }
  };

  const controls = [
    { id: 1, name: 'Editor de Tema', icon: 'ri-palette-line' },
    { id: 2, name: 'Logos/Favicon', icon: 'ri-image-line' },
    { id: 3, name: 'Editor Homepage', icon: 'ri-layout-line' },
    { id: 4, name: 'Banners/Sliders', icon: 'ri-slideshow-line' },
    { id: 5, name: 'CMS Pages', icon: 'ri-file-text-line' },
    { id: 6, name: 'Gerenciador Arquivos', icon: 'ri-folder-line' },
    { id: 7, name: 'Multi-língua', icon: 'ri-translate-2' },
    { id: 8, name: 'Badges/Selos', icon: 'ri-award-line' },
    { id: 9, name: 'Preview Tempo Real', icon: 'ri-eye-line' }
  ];

  return (
    <div className="space-y-6">
      <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} border ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <i className="ri-function-line text-yellow-500"></i>
          9+ Controles de Conteúdo & Branding
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} border ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Configurações do Tema</h3>
            <button className="p-2 rounded-lg bg-yellow-500 text-black hover:bg-yellow-600 transition-colors">
              <i className="ri-save-line text-xl"></i>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Cor Principal
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  defaultValue="#EAB308"
                  className="w-16 h-10 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  defaultValue="#EAB308"
                  className={`flex-1 px-4 py-2 rounded-lg ${
                    darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  } border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Fonte Principal
              </label>
              <select className={`w-full px-4 py-2 rounded-lg ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              } border focus:outline-none focus:ring-2 focus:ring-yellow-500`}>
                <option>Inter</option>
                <option>Roboto</option>
                <option>Poppins</option>
                <option>Montserrat</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Logo do Site
              </label>
              <div className={`border-2 border-dashed ${darkMode ? 'border-gray-700' : 'border-gray-300'} rounded-lg p-8 text-center cursor-pointer hover:border-yellow-500 transition-colors`}>
                <i className="ri-upload-cloud-line text-4xl text-gray-400 mb-2"></i>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Clique para fazer upload ou arraste aqui
                </p>
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Favicon
              </label>
              <div className={`border-2 border-dashed ${darkMode ? 'border-gray-700' : 'border-gray-300'} rounded-lg p-8 text-center cursor-pointer hover:border-yellow-500 transition-colors`}>
                <i className="ri-image-line text-4xl text-gray-400 mb-2"></i>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Upload favicon (32x32px)
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} border ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Páginas CMS</h3>
            <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 whitespace-nowrap">
              <i className="ri-add-line text-xl"></i>
              Nova Página
            </button>
          </div>

          <div className="space-y-3">
            {pages.length === 0 ? (
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Nenhuma página criada</p>
            ) : (
              pages.map((page) => (
                <div key={page.id} className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-medium">{page.title}</h4>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        /{page.slug}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      page.is_published ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'
                    }`}>
                      {page.is_published ? 'Publicada' : 'Rascunho'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors">
                      <i className="ri-edit-line"></i>
                    </button>
                    <button className="p-2 rounded-lg bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 transition-colors">
                      <i className="ri-eye-line"></i>
                    </button>
                    <button className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors">
                      <i className="ri-delete-bin-line"></i>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} border ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Banners & Sliders</h3>
          <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-medium rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 whitespace-nowrap">
            <i className="ri-add-line text-xl"></i>
            Novo Banner
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {banners.length === 0 ? (
            <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Nenhum banner criado</p>
          ) : (
            banners.map((banner) => (
              <div key={banner.id} className={`rounded-lg overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="aspect-video bg-gray-700 flex items-center justify-center">
                  {banner.image_url ? (
                    <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover" />
                  ) : (
                    <i className="ri-image-line text-4xl text-gray-500"></i>
                  )}
                </div>
                <div className="p-4">
                  <h4 className="font-medium mb-2">{banner.title}</h4>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      banner.is_active ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'
                    }`}>
                      {banner.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                    <div className="flex items-center gap-1">
                      <button className="p-1 rounded bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors">
                        <i className="ri-edit-line text-sm"></i>
                      </button>
                      <button className="p-1 rounded bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors">
                        <i className="ri-delete-bin-line text-sm"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
