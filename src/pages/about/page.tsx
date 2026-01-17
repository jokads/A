import { Link } from 'react-router-dom';

export default function AboutPage() {
  const values = [
    {
      icon: 'ri-focus-3-line',
      title: 'Foco em Qualidade',
      description: 'Cada projeto é desenvolvido com atenção aos detalhes e seguindo as melhores práticas do mercado'
    },
    {
      icon: 'ri-lightbulb-flash-line',
      title: 'Inovação Constante',
      description: 'Utilizamos as tecnologias mais modernas para criar soluções que fazem a diferença'
    },
    {
      icon: 'ri-shield-check-line',
      title: 'Transparência Total',
      description: 'Comunicação clara, prazos realistas e relatórios detalhados em todas as etapas'
    },
    {
      icon: 'ri-customer-service-2-line',
      title: 'Atendimento Personalizado',
      description: 'Cada cliente é único e merece uma solução feita sob medida para suas necessidades'
    },
    {
      icon: 'ri-rocket-line',
      title: 'Resultados Reais',
      description: 'Nosso objetivo é o seu sucesso. Trabalhamos para entregar resultados mensuráveis'
    },
    {
      icon: 'ri-team-line',
      title: 'Parceria de Longo Prazo',
      description: 'Não entregamos apenas um projeto, construímos relacionamentos duradouros'
    }
  ];

  const stats = [
    { number: '100+', label: 'Projetos Entregues' },
    { number: '50+', label: 'Clientes Satisfeitos' },
    { number: '5+', label: 'Anos de Experiência' },
    { number: '99%', label: 'Taxa de Satisfação' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://readdy.ai/api/search-image?query=abstract%20modern%20technology%20background%20with%20geometric%20patterns%20digital%20innovation%20and%20futuristic%20design%20in%20dark%20tones%20with%20golden%20accents&width=1920&height=600&seq=aboutbg1&orientation=landscape')] bg-cover bg-center opacity-10"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6">
            <h1 className="text-5xl lg:text-6xl font-bold">
              Sobre <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Nós</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Transformamos ideias em realidade digital através de tecnologia, criatividade e dedicação
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-gray-900">Nossa Missão</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Somos uma equipa apaixonada por tecnologia e inovação, dedicada a criar soluções digitais que impulsionam negócios e transformam ideias em realidade.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Com anos de experiência no mercado, especializamo-nos em desenvolvimento web, e-commerce, automação de processos e consultoria técnica. Cada projeto é tratado com a máxima atenção aos detalhes, garantindo qualidade, segurança e resultados mensuráveis.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Acreditamos que a tecnologia deve ser acessível, eficiente e, acima de tudo, deve resolver problemas reais. Por isso, trabalhamos lado a lado com nossos clientes, entendendo suas necessidades e criando soluções personalizadas que fazem a diferença.
              </p>
            </div>

            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="https://readdy.ai/api/search-image?query=professional%20team%20working%20on%20modern%20technology%20projects%20in%20contemporary%20office%20with%20computers%20and%20digital%20screens%20showing%20innovation%20and%20collaboration&width=800&height=800&seq=aboutimg1&orientation=squarish"
                  alt="Nossa equipa"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-5xl font-bold text-amber-400 mb-2">{stat.number}</p>
                <p className="text-gray-300">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Nossos Valores</h2>
            <p className="text-lg text-gray-600">Os princípios que guiam nosso trabalho</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 flex items-center justify-center bg-amber-100 text-amber-600 rounded-xl mb-6">
                  <i className={`${value.icon} text-3xl`}></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative order-2 lg:order-1">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="https://readdy.ai/api/search-image?query=modern%20professional%20workspace%20with%20multiple%20computer%20screens%20showing%20code%20development%20web%20design%20and%20digital%20projects%20with%20clean%20organized%20environment&width=800&height=600&seq=aboutimg2&orientation=landscape"
                  alt="Nosso trabalho"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -top-6 -left-6 w-48 h-48 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl -z-10"></div>
            </div>

            <div className="space-y-6 order-1 lg:order-2">
              <h2 className="text-4xl font-bold text-gray-900">Por que escolher-nos?</h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 flex items-center justify-center bg-amber-100 text-amber-600 rounded-lg flex-shrink-0">
                    <i className="ri-check-line text-xl"></i>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Experiência Comprovada</h3>
                    <p className="text-gray-600">Anos de experiência em projetos de diversos portes e complexidades</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 flex items-center justify-center bg-amber-100 text-amber-600 rounded-lg flex-shrink-0">
                    <i className="ri-check-line text-xl"></i>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Tecnologia de Ponta</h3>
                    <p className="text-gray-600">Utilizamos as ferramentas e frameworks mais modernos do mercado</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 flex items-center justify-center bg-amber-100 text-amber-600 rounded-lg flex-shrink-0">
                    <i className="ri-check-line text-xl"></i>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Suporte Contínuo</h3>
                    <p className="text-gray-600">Acompanhamento completo durante e após a entrega do projeto</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 flex items-center justify-center bg-amber-100 text-amber-600 rounded-lg flex-shrink-0">
                    <i className="ri-check-line text-xl"></i>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Preços Justos</h3>
                    <p className="text-gray-600">Orçamentos transparentes e competitivos, sem custos ocultos</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 flex items-center justify-center bg-amber-100 text-amber-600 rounded-lg flex-shrink-0">
                    <i className="ri-check-line text-xl"></i>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Prazos Cumpridos</h3>
                    <p className="text-gray-600">Comprometimento com entregas dentro do prazo acordado</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Vamos trabalhar juntos?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Entre em contacto connosco e descubra como podemos ajudar o seu negócio a crescer
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
            <Link 
              to="/services"
              className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-lg hover:bg-white/20 transition-all duration-300 border border-white/20 whitespace-nowrap cursor-pointer"
            >
              Ver Serviços
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
