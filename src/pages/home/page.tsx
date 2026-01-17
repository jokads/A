import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../lib/supabase';
import FeaturedCarousel from '../../components/FeaturedCarousel';

interface FeaturedItem {
  id: string;
  title: string;
  description: string;
  image: string;
  price: number;
  badge?: string;
  link: string;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
  icon?: string;
  display_order?: number;
  active?: boolean;
}

interface Service {
  id: string;
  title: string;
  description: string;
  image?: string;
  icon?: string;
  price?: number;
  active?: boolean;
}

export default function HomePage() {
  const { darkMode } = useTheme();
  const [featuredItems, setFeaturedItems] = useState<FeaturedItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  // Serviços padrão com fotos profissionais de alta qualidade
  const defaultServices: Service[] = [
    {
      id: 'default-1',
      title: 'Criação de Sites Profissionais',
      description: 'Desenvolvimento completo de websites modernos, responsivos e otimizados para SEO. Criamos sites que convertem visitantes em clientes, com design profissional e tecnologia de ponta.',
      image: 'https://readdy.ai/api/search-image?query=professional%20modern%20website%20design%20on%20elegant%20computer%20screen%20with%20purple%20orange%20gradient%20interface%20clean%20minimalist%20workspace%20natural%20lighting%20high%20quality%20photography%20realistic%20detailed&width=800&height=600&seq=service1v3&orientation=landscape',
      icon: 'ri-window-line',
      price: 1500,
      active: true
    },
    {
      id: 'default-2',
      title: 'Desenvolvimento de Lojas Online',
      description: 'E-commerce completo e profissional com sistema de pagamentos integrado, gestão de inventário, carrinho de compras avançado e painel administrativo completo. Pronto para vender.',
      image: 'https://readdy.ai/api/search-image?query=modern%20e-commerce%20shopping%20platform%20interface%20on%20laptop%20screen%20with%20product%20displays%20shopping%20cart%20purple%20orange%20gradient%20professional%20clean%20setup%20high%20quality%20photography%20realistic%20detailed&width=800&height=600&seq=service2v3&orientation=landscape',
      icon: 'ri-shopping-cart-line',
      price: 2500,
      active: true
    },
    {
      id: 'default-3',
      title: 'Dashboards Administrativos',
      description: 'Painéis de controlo com gráficos em tempo real, relatórios avançados e gestão completa do seu negócio. Interface intuitiva e poderosa para tomar decisões baseadas em dados.',
      image: 'https://readdy.ai/api/search-image?query=professional%20analytics%20dashboard%20with%20colorful%20charts%20graphs%20data%20visualization%20purple%20orange%20gradient%20on%20large%20monitor%20modern%20office%20workspace%20elegant%20high%20quality%20photography%20realistic%20detailed&width=800&height=600&seq=service3v3&orientation=landscape',
      icon: 'ri-dashboard-line',
      price: 2000,
      active: true
    },
    {
      id: 'default-4',
      title: 'Automação de Sistemas',
      description: 'Automatize processos repetitivos e aumente a eficiência do seu negócio. Integrações com APIs, workflows automatizados, sincronização de dados e muito mais.',
      image: 'https://readdy.ai/api/search-image?query=futuristic%20automation%20system%20workflow%20with%20connected%20nodes%20digital%20interfaces%20robotic%20process%20purple%20orange%20gradient%20modern%20technology%20professional%20clean%20design%20high%20quality%20photography%20realistic%20detailed&width=800&height=600&seq=service4v3&orientation=landscape',
      icon: 'ri-robot-line',
      price: 3000,
      active: true
    },
    {
      id: 'default-5',
      title: 'Otimização de Performance e SEO',
      description: 'Melhore a velocidade do seu site e apareça no topo do Google. SEO técnico, otimização de código, análise de métricas e estratégias para aumentar o tráfego orgânico.',
      image: 'https://readdy.ai/api/search-image?query=seo%20optimization%20performance%20metrics%20dashboard%20with%20speed%20indicators%20google%20rankings%20analytics%20purple%20orange%20gradient%20professional%20interface%20modern%20clean%20high%20quality%20photography%20realistic%20detailed&width=800&height=600&seq=service5v3&orientation=landscape',
      icon: 'ri-speed-line',
      price: 1200,
      active: true
    },
    {
      id: 'default-6',
      title: 'Consultoria Técnica Especializada',
      description: 'Orientação profissional para o seu projeto tecnológico. Análise de requisitos, arquitetura de sistemas, escolha de tecnologias e estratégias de desenvolvimento.',
      image: 'https://readdy.ai/api/search-image?query=professional%20business%20technology%20consultation%20meeting%20with%20experts%20discussing%20digital%20strategy%20modern%20devices%20purple%20orange%20gradient%20office%20environment%20clean%20elegant%20high%20quality%20photography%20realistic%20detailed&width=800&height=600&seq=service6v3&orientation=landscape',
      icon: 'ri-user-star-line',
      price: 800,
      active: true
    }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Carregar produtos em destaque
      const { data: featuredData } = await supabase
        .from('featured_items')
        .select('*')
        .eq('active', true)
        .order('priority', { ascending: false })
        .limit(10);

      if (featuredData && featuredData.length > 0) {
        const formattedFeatured: FeaturedItem[] = featuredData.map((item) => ({
          id: item.id,
          title: item.title || item.name,
          description: item.description || '',
          image: item.image_url || item.image || '',
          price: item.price || 0,
          badge: item.badge || '',
          link: item.link || `/category`
        }));
        setFeaturedItems(formattedFeatured);
      }

      // Carregar categorias
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .eq('active', true)
        .order('display_order', { ascending: true })
        .limit(6);

      if (categoriesData && categoriesData.length > 0) {
        setCategories(categoriesData);
      }

      // Carregar serviços do dashboard
      const { data: servicesData } = await supabase
        .from('services')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false })
        .limit(6);

      // Se houver serviços no dashboard, usa eles, senão usa os padrão
      if (servicesData && servicesData.length > 0) {
        setServices(servicesData);
      } else {
        setServices(defaultServices);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      // Em caso de erro, usa serviços padrão
      setServices(defaultServices);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section
        className="relative min-h-[600px] flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: 'url(https://readdy.ai/api/search-image?query=modern%20futuristic%20technology%20store%20interior%20with%20purple%20orange%20gradient%20lighting%20elegant%20displays%20premium%20products%20clean%20minimalist%20design%20professional%20atmosphere%20high%20quality%20photography%20realistic%20detailed&width=1920&height=1080&seq=herohomev3&orientation=landscape)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center w-full">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Transforme o Seu{' '}
            <span className="bg-gradient-to-r from-[#b62bff] to-[#ff6a00] bg-clip-text text-transparent">
              Negócio Digital
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto">
            Soluções tecnológicas completas para empresas que desejam crescer online
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/category"
              className="px-8 py-4 bg-gradient-to-r from-[#b62bff] to-[#ff6a00] text-white text-lg font-bold rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              <i className="ri-shopping-bag-line mr-2"></i>
              Explorar Produtos
            </Link>
            <Link
              to="/services"
              className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white text-lg font-bold rounded-lg hover:bg-white/20 transition-colors border border-white/30 whitespace-nowrap"
            >
              <i className="ri-service-line mr-2"></i>
              Ver Serviços
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className={`py-12 ${darkMode ? 'bg-[#170018]' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[
              { icon: 'ri-shield-check-line', text: 'Garantia Total' },
              { icon: 'ri-truck-line', text: 'Envio Rápido' },
              { icon: 'ri-customer-service-2-line', text: 'Suporte 24/7' },
              { icon: 'ri-secure-payment-line', text: 'Pagamento Seguro' },
              { icon: 'ri-star-line', text: 'Qualidade Premium' },
              { icon: 'ri-refresh-line', text: 'Devolução Fácil' }
            ].map((badge, index) => (
              <div
                key={index}
                className={`flex flex-col items-center p-4 rounded-lg ${
                  darkMode ? 'bg-surface' : 'bg-white'
                } border ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}
              >
                <div className="w-12 h-12 flex items-center justify-center mb-2">
                  <i className={`${badge.icon} text-3xl bg-gradient-to-r from-[#b62bff] to-[#ff6a00] bg-clip-text text-transparent`}></i>
                </div>
                <span className={`text-sm font-medium text-center ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {badge.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Produtos em Destaque - CAROUSEL */}
      {featuredItems.length > 0 && (
        <section className={`py-16 ${darkMode ? 'bg-[#0b0011]' : 'bg-white'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className={`text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Produtos em Destaque
              </h2>
              <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Confira nossa seleção especial de produtos premium
              </p>
            </div>
            <FeaturedCarousel
              items={featuredItems}
              maxItems={10}
              autoplay={true}
              autoplayInterval={5000}
              showArrows={true}
              animationType="slide"
            />
          </div>
        </section>
      )}

      {/* Categorias Principais */}
      {categories.length > 0 && (
        <section className={`py-16 ${darkMode ? 'bg-[#170018]' : 'bg-gray-50'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className={`text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Categorias Principais
              </h2>
              <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Explore nossa ampla variedade de produtos
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/category?cat=${category.id}`}
                  className={`group overflow-hidden rounded-xl ${
                    darkMode ? 'bg-surface' : 'bg-white'
                  } border ${darkMode ? 'border-gray-800' : 'border-gray-200'} hover:shadow-xl transition-all`}
                >
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={category.image || `https://readdy.ai/api/search-image?query=$%7Bcategory.name%7D%20products%20collection%20professional%20clean%20background%20high%20quality%20photography%20realistic%20detailed&width=400&height=300&seq=cat${category.id}v3&orientation=landscape`}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-2">
                      {category.icon && (
                        <i className={`${category.icon} text-2xl bg-gradient-to-r from-[#b62bff] to-[#ff6a00] bg-clip-text text-transparent`}></i>
                      )}
                      <h3 className={`text-xl font-bold group-hover:text-[#b62bff] transition-colors ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {category.name}
                      </h3>
                    </div>
                    {category.description && (
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {category.description}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Serviços Profissionais - SEMPRE VISÍVEL COM FOTOS */}
      <section className={`py-16 ${darkMode ? 'bg-[#0b0011]' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className={`text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Serviços Profissionais
            </h2>
            <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Soluções completas para transformar o seu negócio digital
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <Link
                key={service.id}
                to={`/services/detail?id=${service.id}`}
                className={`group overflow-hidden rounded-xl ${
                  darkMode ? 'bg-surface' : 'bg-white'
                } border ${darkMode ? 'border-gray-800' : 'border-gray-200'} hover:shadow-2xl transition-all`}
              >
                <div className="aspect-video overflow-hidden w-full h-48">
                  <img
                    src={service.image || `https://readdy.ai/api/search-image?query=$%7Bservice.title%7D%20professional%20service%20technology%20purple%20orange%20gradient%20modern%20clean%20high%20quality%20photography%20realistic%20detailed&width=800&height=600&seq=srv${service.id}v3&orientation=landscape`}
                    alt={service.title}
                    className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    {service.icon && (
                      <div className="w-12 h-12 flex items-center justify-center">
                        <i className={`${service.icon} text-3xl bg-gradient-to-r from-[#b62bff] to-[#ff6a00] bg-clip-text text-transparent`}></i>
                      </div>
                    )}
                    <h3 className={`text-xl font-bold group-hover:text-[#b62bff] transition-colors ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {service.title}
                    </h3>
                  </div>
                  <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'} line-clamp-3`}>
                    {service.description}
                  </p>
                  {service.price && (
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold bg-gradient-to-r from-[#b62bff] to-[#ff6a00] bg-clip-text text-transparent">
                        €{service.price.toFixed(2)}
                      </span>
                      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} group-hover:text-[#b62bff] transition-colors`}>
                        Saiba Mais <i className="ri-arrow-right-line ml-1 group-hover:translate-x-1 transition-transform inline-block"></i>
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              to="/services"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#b62bff] to-[#ff6a00] text-white text-lg font-bold rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              Ver Todos os Serviços
              <i className="ri-arrow-right-line ml-2"></i>
            </Link>
          </div>
        </div>
      </section>

      {/* Sobre Nós Preview */}
      <section className={`py-16 ${darkMode ? 'bg-[#170018]' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className={`text-4xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Sobre Nós
              </h2>
              <p className={`text-lg mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Somos especialistas em transformar ideias em soluções digitais inovadoras. Com anos de experiência em desenvolvimento web, e-commerce e automação, ajudamos empresas a crescer online.
              </p>
              <p className={`text-lg mb-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Nossa missão é criar experiências digitais excepcionais que geram resultados reais para nossos clientes.
              </p>
              <Link
                to="/about"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#b62bff] to-[#ff6a00] text-white text-lg font-bold rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap"
              >
                Saiba Mais
                <i className="ri-arrow-right-line ml-2"></i>
              </Link>
            </div>
            <div className="relative">
              <img
                src="https://readdy.ai/api/search-image?query=modern%20professional%20office%20workspace%20with%20team%20working%20on%20computers%20technology%20startup%20environment%20purple%20orange%20gradient%20lighting%20clean%20elegant%20atmosphere%20high%20quality%20photography%20realistic%20detailed&width=800&height=600&seq=aboutusv3&orientation=landscape"
                alt="Sobre Nós"
                className="rounded-2xl shadow-2xl w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className={`py-16 ${darkMode ? 'bg-[#0b0011]' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className={`text-4xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Pronto para Começar?
          </h2>
          <p className={`text-xl mb-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Entre em contacto connosco e descubra como podemos ajudar o seu negócio
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="mailto:jokadamas616@gmail.com"
              className="px-8 py-4 bg-gradient-to-r from-[#b62bff] to-[#ff6a00] text-white text-lg font-bold rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              <i className="ri-mail-line mr-2"></i>
              Enviar E-mail
            </a>
            <a
              href="https://wa.me/244123456789"
              target="_blank"
              rel="noopener noreferrer"
              className={`px-8 py-4 ${
                darkMode ? 'bg-surface hover:bg-gray-800' : 'bg-gray-100 hover:bg-gray-200'
              } text-lg font-bold rounded-lg transition-colors border ${
                darkMode ? 'border-gray-800' : 'border-gray-200'
              } whitespace-nowrap`}
            >
              <i className="ri-whatsapp-line mr-2 text-green-500"></i>
              WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
