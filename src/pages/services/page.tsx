import { useState } from 'react';
import { Link } from 'react-router-dom';
import { mockServices } from '../../mocks/services';

export default function ServicesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: 'Todos os Serviços', icon: 'ri-apps-line' },
    { id: 'web-development', name: 'Desenvolvimento Web', icon: 'ri-code-box-line' },
    { id: 'ecommerce', name: 'E-commerce', icon: 'ri-shopping-cart-line' },
    { id: 'business-tools', name: 'Ferramentas de Negócio', icon: 'ri-dashboard-line' },
    { id: 'automation', name: 'Automação', icon: 'ri-robot-line' },
    { id: 'optimization', name: 'Otimização', icon: 'ri-rocket-line' },
    { id: 'consulting', name: 'Consultoria', icon: 'ri-user-star-line' }
  ];

  const filteredServices = selectedCategory === 'all' 
    ? mockServices 
    : mockServices.filter(s => s.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6">
            <h1 className="text-5xl lg:text-6xl font-bold">
              Serviços <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Profissionais</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Soluções completas para transformar o seu negócio digital. Desenvolvimento, automação, otimização e consultoria especializada.
            </p>
            <div className="flex flex-wrap justify-center gap-6 pt-4">
              <a href="mailto:jokadamas616@gmail.com" className="flex items-center gap-2 text-gray-300 hover:text-amber-400 transition-colors cursor-pointer">
                <i className="ri-mail-line text-xl"></i>
                <span>jokadamas616@gmail.com</span>
              </a>
              <a href="https://wa.me/352621717862" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-300 hover:text-amber-400 transition-colors cursor-pointer">
                <i className="ri-whatsapp-line text-xl"></i>
                <span>+352 621 717 862</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Filter */}
      <section className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-all duration-300 cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-amber-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <i className={`${cat.icon} text-lg`}></i>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden group"
              >
                <div className="aspect-video overflow-hidden">
                  <img 
                    src={service.images[0]} 
                    alt={service.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{service.name}</h3>
                    <p className="text-gray-600 line-clamp-2">{service.short_description}</p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div>
                      {service.price_type === 'fixed' ? (
                        <p className="text-3xl font-bold text-amber-600">€{service.price}</p>
                      ) : (
                        <p className="text-lg font-semibold text-gray-700">Sob Consulta</p>
                      )}
                      <p className="text-sm text-gray-500">{service.delivery_time}</p>
                    </div>
                    <Link
                      to={`/services/${service.slug}`}
                      className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all duration-300 shadow-md hover:shadow-lg whitespace-nowrap cursor-pointer"
                    >
                      Ver Detalhes
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Por que escolher-nos?</h2>
            <p className="text-lg text-gray-600">Qualidade, experiência e resultados garantidos</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 flex items-center justify-center bg-amber-100 text-amber-600 rounded-full mx-auto">
                <i className="ri-medal-line text-3xl"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Qualidade Premium</h3>
              <p className="text-gray-600">Código limpo, documentado e seguindo as melhores práticas</p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 flex items-center justify-center bg-amber-100 text-amber-600 rounded-full mx-auto">
                <i className="ri-time-line text-3xl"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Entrega Rápida</h3>
              <p className="text-gray-600">Prazos cumpridos e comunicação transparente</p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 flex items-center justify-center bg-amber-100 text-amber-600 rounded-full mx-auto">
                <i className="ri-customer-service-2-line text-3xl"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Suporte Dedicado</h3>
              <p className="text-gray-600">Acompanhamento completo durante e após o projeto</p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 flex items-center justify-center bg-amber-100 text-amber-600 rounded-full mx-auto">
                <i className="ri-shield-check-line text-3xl"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Garantia Total</h3>
              <p className="text-gray-600">Satisfação garantida ou seu dinheiro de volta</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Vamos trabalhar juntos?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Entre em contacto e receba uma proposta personalizada para o seu projeto
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a 
              href="mailto:jokadamas616@gmail.com"
              className="px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all duration-300 shadow-lg hover:shadow-xl whitespace-nowrap cursor-pointer"
            >
              <i className="ri-mail-line mr-2"></i>
              Enviar E-mail
            </a>
            <a 
              href="https://wa.me/352621717862"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-all duration-300 shadow-lg hover:shadow-xl whitespace-nowrap cursor-pointer"
            >
              <i className="ri-whatsapp-line mr-2"></i>
              WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
