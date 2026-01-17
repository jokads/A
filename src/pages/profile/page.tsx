import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

interface UserProfile {
  id: string;
  full_name: string;
  avatar_url: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  postal_code: string;
  bio: string;
  role: string;
  created_at: string;
}

interface Order {
  id: string;
  order_number: string;
  total: number;
  status: string;
  created_at: string;
  items: any[];
}

interface Wishlist {
  id: string;
  product: {
    id: string;
    name: string;
    price: number;
    image_url: string;
  };
}

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlist, setWishlist] = useState<Wishlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    postal_code: '',
    bio: ''
  });

  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchUserData();
  }, [user, navigate]);

  const fetchUserData = async () => {
    try {
      setLoading(true);

      // Buscar perfil com role atualizado
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user!.id)
        .single();

      if (profileError) throw profileError;

      setProfile(profileData);
      setFormData({
        full_name: profileData.full_name || '',
        phone: profileData.phone || '',
        address: profileData.address || '',
        city: profileData.city || '',
        country: profileData.country || '',
        postal_code: profileData.postal_code || '',
        bio: profileData.bio || ''
      });

      // Buscar pedidos
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          total,
          status,
          created_at,
          order_items (
            id,
            quantity,
            price,
            product_id
          )
        `)
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!ordersError && ordersData) {
        setOrders(ordersData);
      }

      // Buscar lista de desejos
      const { data: wishlistData, error: wishlistError } = await supabase
        .from('wishlist')
        .select(`
          id,
          products (
            id,
            name,
            price,
            images
          )
        `)
        .eq('user_id', user!.id);

      if (!wishlistError && wishlistData) {
        setWishlist(wishlistData.map((item: any) => ({
          id: item.id,
          product: {
            id: item.products.id,
            name: item.products.name,
            price: item.products.price,
            image_url: item.products.images?.[0] || ''
          }
        })));
      }

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setMessage({ type: 'error', text: 'Erro ao carregar dados do perfil' });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadAvatar = async () => {
    if (!avatarFile || !user) return null;

    try {
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(filePath, avatarFile);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('public')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      return null;
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      setMessage(null);

      let avatar_url = profile?.avatar_url;

      // Upload do avatar se houver
      if (avatarFile) {
        const uploadedUrl = await uploadAvatar();
        if (uploadedUrl) {
          avatar_url = uploadedUrl;
        }
      }

      // Atualizar perfil
      const { error } = await supabase
        .from('profiles')
        .update({
          ...formData,
          avatar_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', user!.id);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
      setAvatarFile(null);
      setAvatarPreview(null);
      await fetchUserData();

    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      setMessage({ type: 'error', text: 'Erro ao salvar perfil' });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      if (passwordData.new !== passwordData.confirm) {
        setMessage({ type: 'error', text: 'As senhas não coincidem' });
        return;
      }

      if (passwordData.new.length < 6) {
        setMessage({ type: 'error', text: 'A senha deve ter no mínimo 6 caracteres' });
        return;
      }

      setSaving(true);
      setMessage(null);

      const { error } = await supabase.auth.updateUser({
        password: passwordData.new
      });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Senha alterada com sucesso!' });
      setPasswordData({ current: '', new: '', confirm: '' });

    } catch (error: any) {
      console.error('Erro ao alterar senha:', error);
      setMessage({ type: 'error', text: error.message || 'Erro ao alterar senha' });
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveFromWishlist = async (wishlistId: string) => {
    try {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('id', wishlistId);

      if (error) throw error;

      setWishlist(wishlist.filter(item => item.id !== wishlistId));
      setMessage({ type: 'success', text: 'Produto removido da lista de desejos' });
    } catch (error) {
      console.error('Erro ao remover produto:', error);
      setMessage({ type: 'error', text: 'Erro ao remover produto' });
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'customer':
        return 'Cliente';
      default:
        return 'Utilizador';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'processing':
        return 'bg-blue-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Concluído';
      case 'processing':
        return 'Em Processamento';
      case 'pending':
        return 'Pendente';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-[#0b0011]' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="w-16 h-16 border-4 border-[#b62bff] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-[#0b0011]' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header do Perfil */}
        <div className={`rounded-xl p-8 mb-8 ${darkMode ? 'bg-surface border border-gray-800' : 'bg-white border border-gray-200'}`}>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#b62bff] to-[#ff6a00] flex items-center justify-center text-white text-4xl font-bold">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                ) : (
                  profile?.full_name?.charAt(0) || user?.email?.charAt(0) || '?'
                )}
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {profile?.full_name || 'Sem nome'}
              </h1>
              <p className={`text-lg mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {user?.email}
              </p>
              <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start">
                <span className="px-4 py-2 bg-gradient-to-r from-[#b62bff] to-[#ff6a00] text-white text-sm font-medium rounded-full">
                  {getRoleLabel(profile?.role || 'customer')}
                </span>
                <span className={`px-4 py-2 ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'} text-sm font-medium rounded-full`}>
                  Membro desde {new Date(profile?.created_at || Date.now()).getFullYear()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-500/20 border border-green-500/50' 
              : 'bg-red-500/20 border border-red-500/50'
          }`}>
            <p className={message.type === 'success' ? 'text-green-500' : 'text-red-500'}>
              {message.text}
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[
            { id: 'profile', icon: 'ri-user-settings-line', label: 'Perfil' },
            { id: 'orders', icon: 'ri-file-list-line', label: 'Pedidos' },
            { id: 'wishlist', icon: 'ri-heart-line', label: 'Lista de Desejos' },
            { id: 'security', icon: 'ri-shield-check-line', label: 'Segurança' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-[#b62bff] to-[#ff6a00] text-white shadow-lg'
                  : darkMode
                  ? 'bg-gray-900 text-gray-300 hover:bg-gray-800'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <i className={`${tab.icon} mr-2`}></i>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className={`${darkMode ? 'bg-gray-900' : 'bg-white'} rounded-2xl shadow-xl p-8`}>
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-6`}>
                Informações Pessoais
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg ${
                      darkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-900 border-gray-200'
                    } border focus:border-[#b62bff] focus:outline-none transition-colors`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg ${
                      darkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-900 border-gray-200'
                    } border focus:border-[#b62bff] focus:outline-none transition-colors`}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Morada
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg ${
                      darkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-900 border-gray-200'
                    } border focus:border-[#b62bff] focus:outline-none transition-colors`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Cidade
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg ${
                      darkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-900 border-gray-200'
                    } border focus:border-[#b62bff] focus:outline-none transition-colors`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    País
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg ${
                      darkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-900 border-gray-200'
                    } border focus:border-[#b62bff] focus:outline-none transition-colors`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Código Postal
                  </label>
                  <input
                    type="text"
                    value={formData.postal_code}
                    onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg ${
                      darkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-900 border-gray-200'
                    } border focus:border-[#b62bff] focus:outline-none transition-colors`}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Bio
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={4}
                    className={`w-full px-4 py-3 rounded-lg ${
                      darkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-900 border-gray-200'
                    } border focus:border-[#b62bff] focus:outline-none transition-colors resize-none`}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t border-gray-700">
                <button
                  onClick={() => navigate(-1)}
                  className={`px-6 py-3 rounded-lg font-medium ${
                    darkMode ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  } transition-colors`}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="px-6 py-3 bg-gradient-to-r from-[#b62bff] to-[#ff6a00] text-white font-medium rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {saving ? 'A guardar...' : 'Guardar Alterações'}
                </button>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-6`}>
                Meus Pedidos
              </h2>

              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <i className="ri-file-list-line text-6xl text-gray-500 mb-4"></i>
                  <p className="text-gray-500 text-lg">Ainda não tem pedidos</p>
                  <button
                    onClick={() => navigate('/category')}
                    className="mt-6 px-6 py-3 bg-gradient-to-r from-[#b62bff] to-[#ff6a00] text-white font-medium rounded-lg hover:shadow-lg transition-all"
                  >
                    Começar a Comprar
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map(order => (
                    <div
                      key={order.id}
                      className={`p-6 rounded-lg border ${
                        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <div>
                          <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            Pedido #{order.order_number}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {new Date(order.created_at).toLocaleDateString('pt-PT', {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`px-4 py-2 ${getStatusColor(order.status)} text-white text-sm font-medium rounded-lg`}>
                            {getStatusLabel(order.status)}
                          </span>
                          <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            €{order.total.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <i className="ri-shopping-bag-line"></i>
                        <span>{order.items?.length || 0} {order.items?.length === 1 ? 'item' : 'itens'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Wishlist Tab */}
          {activeTab === 'wishlist' && (
            <div className="space-y-6">
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-6`}>
                Lista de Desejos
              </h2>

              {wishlist.length === 0 ? (
                <div className="text-center py-12">
                  <i className="ri-heart-line text-6xl text-gray-500 mb-4"></i>
                  <p className="text-gray-500 text-lg">Sua lista de desejos está vazia</p>
                  <button
                    onClick={() => navigate('/category')}
                    className="mt-6 px-6 py-3 bg-gradient-to-r from-[#b62bff] to-[#ff6a00] text-white font-medium rounded-lg hover:shadow-lg transition-all"
                  >
                    Explorar Produtos
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {wishlist.map(item => (
                    <div
                      key={item.id}
                      className={`rounded-lg border ${
                        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
                      } overflow-hidden`}
                    >
                      <div className="aspect-square bg-gray-700 overflow-hidden">
                        <img
                          src={item.product.image_url || 'https://via.placeholder.com/400'}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className={`font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {item.product.name}
                        </h3>
                        <p className="text-2xl font-bold text-[#b62bff] mb-4">
                          €{item.product.price.toFixed(2)}
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => navigate(`/product/${item.product.id}`)}
                            className="flex-1 px-4 py-2 bg-gradient-to-r from-[#b62bff] to-[#ff6a00] text-white font-medium rounded-lg hover:shadow-lg transition-all"
                          >
                            Ver Produto
                          </button>
                          <button
                            onClick={() => handleRemoveFromWishlist(item.id)}
                            className={`px-4 py-2 rounded-lg ${
                              darkMode ? 'bg-gray-700 hover:bg-red-900/20 text-red-400' : 'bg-gray-200 hover:bg-red-50 text-red-600'
                            } transition-colors`}
                          >
                            <i className="ri-delete-bin-line"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-6`}>
                Segurança
              </h2>

              <div className="max-w-2xl space-y-6">
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Senha Atual
                  </label>
                  <input
                    type="password"
                    value={passwordData.current}
                    onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg ${
                      darkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-900 border-gray-200'
                    } border focus:border-[#b62bff] focus:outline-none transition-colors`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Nova Senha
                  </label>
                  <input
                    type="password"
                    value={passwordData.new}
                    onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg ${
                      darkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-900 border-gray-200'
                    } border focus:border-[#b62bff] focus:outline-none transition-colors`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Confirmar Nova Senha
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirm}
                    onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg ${
                      darkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-900 border-gray-200'
                    } border focus:border-[#b62bff] focus:outline-none transition-colors`}
                  />
                </div>

                <div className="flex justify-end gap-4 pt-6 border-t border-gray-700">
                  <button
                    onClick={() => setPasswordData({ current: '', new: '', confirm: '' })}
                    className={`px-6 py-3 rounded-lg font-medium ${
                      darkMode ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    } transition-colors`}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleChangePassword}
                    disabled={saving || !passwordData.new || !passwordData.confirm}
                    className="px-6 py-3 bg-gradient-to-r from-[#b62bff] to-[#ff6a00] text-white font-medium rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {saving ? 'A alterar...' : 'Alterar Senha'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
