import { useParams, Link } from 'react-router-dom';
import { mockServices } from '../../../mocks/services';

export default function ServiceDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const service = mockServices.find(s => s.slug === slug);

  if (!service) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Serviço não encontrado</h1>
          <Link to="/services" className="text-amber-600 hover:text-amber-700 cursor-pointer">
            Voltar para Serviços
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-amber-600 cursor-pointer">Início</Link>
            <i className="ri-arrow-right-s-line"></i>
            <Link to="/services" className="hover:text-amber-600 cursor-pointer">Serviços</Link>
            <i className="ri-arrow-right-s-line"></i>
            <span className="text-gray-900 font-medium">{service.name}</span>
          </div>
        </div>
      </div>

      {/* Service Header */}
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">{service.name}</h1>
              <p className="text-xl text-gray-600">{service.description}</p>
              
              <div className="flex items-center gap-6 pt-4">
                {service.price_type === 'fixed' ? (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Preço</p>
                    <p className="text-4xl font-bold text-amber-600">€{service.price}</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Preço</p>
                    <p className="text-2xl font-bold text-gray-900">Sob Consulta</p>
                  </div>
                )}
                
                <div className="border-l border-gray-300 pl-6">
                  <p className="text-sm text-gray-500 mb-1">Prazo de Entrega</p>
                  <p className="text-lg font-semibold text-gray-900">{service.delivery_time}</p>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <a 
                  href="mailto:jokadamas616@gmail.com"
                  className="px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all duration-300 shadow-lg hover:shadow-xl whitespace-nowrap cursor-pointer"
                >
                  Solicitar Orçamento
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

            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src={service.images[0]} 
                alt={service.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">O que está incluído</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {service.features.map((feature, index) => (
              <div key={index} className="flex items-start gap-4 bg-white p-6 rounded-xl shadow-sm">
                <div className="w-8 h-8 flex items-center justify-center bg-amber-100 text-amber-600 rounded-lg flex-shrink-0">
                  <i className="ri-check-line text-xl"></i>
                </div>
                <p className="text-gray-700 font-medium">{feature}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Como funciona</h2>
          <div className="grid md:grid-cols-5 gap-6">
            {service.process_steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 flex items-center justify-center bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-full text-2xl font-bold mx-auto shadow-lg">
                    {step.step}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{step.title}</h3>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
                {index < service.process_steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-gradient-to-r from-amber-300 to-amber-500"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Pronto para começar?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Entre em contacto connosco e receba uma proposta personalizada
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

      {/* Related Services */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Outros Serviços</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {mockServices.filter(s => s.id !== service.id).slice(0, 3).map((relatedService) => (
              <Link
                key={relatedService.id}
                to={`/services/${relatedService.slug}`}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer"
              >
                <div className="aspect-video overflow-hidden">
                  <img 
                    src={relatedService.images[0]} 
                    alt={relatedService.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{relatedService.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{relatedService.short_description}</p>
                  {relatedService.price_type === 'fixed' ? (
                    <p className="text-2xl font-bold text-amber-600">€{relatedService.price}</p>
                  ) : (
                    <p className="text-lg font-semibold text-gray-700">Sob Consulta</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
