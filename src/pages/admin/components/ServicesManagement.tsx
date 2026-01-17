import { useState } from 'react';
import { Link } from 'react-router-dom';

interface Service {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  price: number;
  price_type: string;
  category: string;
  features: string[];
  delivery_time: string;
  status: string;
  images: string[];
}

export default function ServicesManagement() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const categories = [
    { id: 'all', name: 'Todas as Categorias' },
    { id: 'web-development', name: 'Desenvolvimento Web' },
    { id: 'ecommerce', name: 'E-commerce' },
    { id: 'business-tools', name: 'Ferramentas de Negócio' },
    { id: 'automation', name: 'Automação' },
    { id: 'optimization', name: 'Otimização' },
    { id: 'consulting', name: 'Consultoria' }
  ];

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || service.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddService = () => {
    setEditingService(null);
    setIsModalOpen(true);
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setIsModalOpen(true);
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este serviço?')) return;
    
    setIsLoading(true);
    // Implementar exclusão no Supabase
    setTimeout(() => {
      setServices(services.filter(s => s.id !== id));
      setIsLoading(false);
    }, 500);
  };

  const handleToggleStatus = async (id: string) => {
    setIsLoading(true);
    // Implementar toggle de status no Supabase
    setTimeout(() => {
      setServices(services.map(s => 
        s.id === id ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' } : s
      ));
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestão de Serviços</h2>
          <p className="text-gray-600 mt-1">Gerir serviços profissionais oferecidos</p>
        </div>
        <button
          onClick={handleAddService}
          className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2 whitespace-nowrap cursor-pointer"
        >
          <i className="ri-add-line text-xl"></i>
          Adicionar Serviço
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pesquisar Serviços
            </label>
            <div className="relative">
              <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nome do serviço..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoria
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm cursor-pointer"
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Serviços</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{services.length}</p>
            </div>
            <div className="w-12 h-12 flex items-center justify-center bg-amber-100 text-amber-600 rounded-lg">
              <i className="ri-service-line text-2xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Serviços Ativos</p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                {services.filter(s => s.status === 'active').length}
              </p>
            </div>
            <div className="w-12 h-12 flex items-center justify-center bg-green-100 text-green-600 rounded-lg">
              <i className="ri-check-line text-2xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Preço Fixo</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">
                {services.filter(s => s.price_type === 'fixed').length}
              </p>
            </div>
            <div className="w-12 h-12 flex items-center justify-center bg-blue-100 text-blue-600 rounded-lg">
              <i className="ri-price-tag-3-line text-2xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Sob Consulta</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">
                {services.filter(s => s.price_type === 'custom').length}
              </p>
            </div>
            <div className="w-12 h-12 flex items-center justify-center bg-purple-100 text-purple-600 rounded-lg">
              <i className="ri-question-line text-2xl"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Services List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {filteredServices.length === 0 ? (
          <div className="text-center py-12">
            <i className="ri-service-line text-6xl text-gray-300 mb-4"></i>
            <p className="text-gray-500 text-lg">Nenhum serviço encontrado</p>
            <button
              onClick={handleAddService}
              className="mt-4 px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors cursor-pointer"
            >
              Adicionar Primeiro Serviço
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Serviço
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Preço
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Prazo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredServices.map((service) => (
                  <tr key={service.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          <img 
                            src={service.images[0]} 
                            alt={service.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{service.name}</p>
                          <p className="text-sm text-gray-500 line-clamp-1">{service.short_description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                        {categories.find(c => c.id === service.category)?.name || service.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {service.price_type === 'fixed' ? (
                        <span className="font-semibold text-gray-900">€{service.price}</span>
                      ) : (
                        <span className="text-gray-600">Sob Consulta</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {service.delivery_time}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(service.id)}
                        className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer ${
                          service.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {service.status === 'active' ? 'Ativo' : 'Inativo'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/services/${service.slug}`}
                          target="_blank"
                          className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                          title="Ver Serviço"
                        >
                          <i className="ri-eye-line"></i>
                        </Link>
                        <button
                          onClick={() => handleEditService(service)}
                          className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Editar"
                        >
                          <i className="ri-edit-line"></i>
                        </button>
                        <button
                          onClick={() => handleDeleteService(service.id)}
                          className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Excluir"
                        >
                          <i className="ri-delete-bin-line"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 flex items-center justify-center bg-blue-100 text-blue-600 rounded-lg flex-shrink-0">
            <i className="ri-information-line text-xl"></i>
          </div>
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">Gestão de Serviços Profissionais</h3>
            <p className="text-sm text-blue-800 leading-relaxed">
              Aqui você pode adicionar, editar e gerenciar todos os serviços profissionais oferecidos no marketplace. 
              Configure preços fixos ou sob consulta, defina prazos de entrega, adicione descrições detalhadas e 
              organize por categorias. Os serviços aparecem automaticamente na página de Serviços do site.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
