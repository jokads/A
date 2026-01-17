export const mockServices = [
  {
    id: '1',
    name: 'Criação de Sites Profissionais',
    slug: 'criacao-sites-profissionais',
    description: 'Desenvolvimento completo de websites modernos, responsivos e otimizados para SEO. Criamos sites que convertem visitantes em clientes, com design profissional e tecnologia de ponta.',
    short_description: 'Sites modernos e profissionais que convertem',
    price: 1500,
    price_type: 'fixed',
    category: 'web-development',
    features: [
      'Design responsivo (mobile, tablet, desktop)',
      'Otimização SEO completa',
      'Integração com redes sociais',
      'Formulários de contacto',
      'Google Analytics',
      'SSL e segurança',
      'Suporte técnico 30 dias'
    ],
    process_steps: [
      { step: 1, title: 'Briefing', description: 'Reunião para entender suas necessidades' },
      { step: 2, title: 'Design', description: 'Criação do layout e aprovação' },
      { step: 3, title: 'Desenvolvimento', description: 'Programação e implementação' },
      { step: 4, title: 'Testes', description: 'Validação e ajustes finais' },
      { step: 5, title: 'Lançamento', description: 'Publicação e entrega' }
    ],
    delivery_time: '15-30 dias',
    status: 'active',
    images: ['https://readdy.ai/api/search-image?query=modern%20professional%20website%20design%20on%20computer%20screen%20with%20clean%20interface%20elegant%20layout%20and%20responsive%20design%20elements%20showing%20business%20website%20with%20premium%20quality%20and%20professional%20appearance&width=800&height=600&seq=service1&orientation=landscape']
  },
  {
    id: '2',
    name: 'Desenvolvimento de Lojas Online',
    slug: 'desenvolvimento-lojas-online',
    description: 'E-commerce completo e profissional, pronto para vender. Sistema de pagamentos integrado, gestão de produtos, carrinho de compras e painel administrativo completo.',
    short_description: 'E-commerce completo pronto para vender',
    price: 2500,
    price_type: 'fixed',
    category: 'ecommerce',
    features: [
      'Sistema de pagamentos (Stripe/PayPal)',
      'Gestão de produtos e categorias',
      'Carrinho de compras avançado',
      'Painel administrativo completo',
      'Sistema de envios',
      'Cupons e promoções',
      'Relatórios e analytics',
      'Suporte técnico 60 dias'
    ],
    process_steps: [
      { step: 1, title: 'Planeamento', description: 'Definição de funcionalidades' },
      { step: 2, title: 'Design', description: 'Interface da loja e UX' },
      { step: 3, title: 'Desenvolvimento', description: 'Programação completa' },
      { step: 4, title: 'Integração', description: 'Pagamentos e sistemas' },
      { step: 5, title: 'Lançamento', description: 'Testes e publicação' }
    ],
    delivery_time: '30-45 dias',
    status: 'active',
    images: ['https://readdy.ai/api/search-image?query=professional%20ecommerce%20online%20store%20interface%20showing%20product%20catalog%20shopping%20cart%20and%20checkout%20process%20with%20modern%20design%20clean%20layout%20and%20premium%20quality%20business%20appearance&width=800&height=600&seq=service2&orientation=landscape']
  },
  {
    id: '3',
    name: 'Criação de Dashboards Administrativos',
    slug: 'criacao-dashboards-administrativos',
    description: 'Painéis de controlo personalizados para gerir todo o seu negócio. Visualização de dados em tempo real, relatórios avançados e controlo total das operações.',
    short_description: 'Painéis de controlo profissionais e personalizados',
    price: 2000,
    price_type: 'fixed',
    category: 'business-tools',
    features: [
      'Interface intuitiva e moderna',
      'Gráficos e relatórios em tempo real',
      'Gestão de utilizadores e permissões',
      'Exportação de dados',
      'Notificações e alertas',
      'Integração com sistemas existentes',
      'Responsive design',
      'Suporte técnico 45 dias'
    ],
    process_steps: [
      { step: 1, title: 'Análise', description: 'Levantamento de requisitos' },
      { step: 2, title: 'Prototipagem', description: 'Design e fluxos' },
      { step: 3, title: 'Desenvolvimento', description: 'Implementação completa' },
      { step: 4, title: 'Integração', description: 'Conexão com dados' },
      { step: 5, title: 'Entrega', description: 'Testes e formação' }
    ],
    delivery_time: '20-35 dias',
    status: 'active',
    images: ['https://readdy.ai/api/search-image?query=modern%20admin%20dashboard%20interface%20with%20charts%20graphs%20analytics%20data%20visualization%20and%20control%20panels%20showing%20professional%20business%20management%20system%20with%20clean%20design%20and%20premium%20appearance&width=800&height=600&seq=service3&orientation=landscape']
  },
  {
    id: '4',
    name: 'Automação de Sistemas',
    slug: 'automacao-sistemas',
    description: 'Automatize processos repetitivos e economize tempo. Criamos soluções personalizadas para integrar sistemas, automatizar tarefas e otimizar operações.',
    short_description: 'Automatize processos e economize tempo',
    price: 0,
    price_type: 'custom',
    category: 'automation',
    features: [
      'Análise de processos',
      'Integração entre sistemas',
      'Automação de tarefas',
      'Webhooks e APIs',
      'Notificações automáticas',
      'Relatórios agendados',
      'Monitoramento 24/7',
      'Suporte contínuo'
    ],
    process_steps: [
      { step: 1, title: 'Diagnóstico', description: 'Identificação de oportunidades' },
      { step: 2, title: 'Planeamento', description: 'Estratégia de automação' },
      { step: 3, title: 'Implementação', description: 'Desenvolvimento das automações' },
      { step: 4, title: 'Testes', description: 'Validação e ajustes' },
      { step: 5, title: 'Monitoramento', description: 'Acompanhamento contínuo' }
    ],
    delivery_time: 'Sob consulta',
    status: 'active',
    images: ['https://readdy.ai/api/search-image?query=business%20automation%20system%20with%20connected%20workflows%20automated%20processes%20integration%20between%20systems%20and%20digital%20transformation%20showing%20modern%20technology%20and%20professional%20efficiency&width=800&height=600&seq=service4&orientation=landscape']
  },
  {
    id: '5',
    name: 'Otimização de Performance & SEO',
    slug: 'otimizacao-performance-seo',
    description: 'Melhore o desempenho do seu site e apareça no topo do Google. Otimização técnica completa, SEO on-page e off-page, e aumento de velocidade.',
    short_description: 'Apareça no topo do Google e acelere seu site',
    price: 800,
    price_type: 'fixed',
    category: 'optimization',
    features: [
      'Auditoria SEO completa',
      'Otimização de velocidade',
      'Meta tags e estrutura',
      'Schema markup',
      'Otimização de imagens',
      'Mobile optimization',
      'Relatório detalhado',
      'Acompanhamento 30 dias'
    ],
    process_steps: [
      { step: 1, title: 'Auditoria', description: 'Análise completa do site' },
      { step: 2, title: 'Estratégia', description: 'Plano de otimização' },
      { step: 3, title: 'Implementação', description: 'Aplicação das melhorias' },
      { step: 4, title: 'Validação', description: 'Testes e medições' },
      { step: 5, title: 'Relatório', description: 'Resultados e recomendações' }
    ],
    delivery_time: '7-14 dias',
    status: 'active',
    images: ['https://readdy.ai/api/search-image?query=website%20performance%20optimization%20and%20SEO%20analytics%20showing%20speed%20improvements%20search%20engine%20rankings%20and%20technical%20optimization%20with%20professional%20dashboard%20and%20metrics&width=800&height=600&seq=service5&orientation=landscape']
  },
  {
    id: '6',
    name: 'Consultoria Técnica',
    slug: 'consultoria-tecnica',
    description: 'Orientação especializada para seus projetos digitais. Ajudamos a tomar as melhores decisões técnicas, escolher tecnologias adequadas e planejar arquiteturas escaláveis.',
    short_description: 'Orientação especializada para seus projetos',
    price: 150,
    price_type: 'fixed',
    category: 'consulting',
    features: [
      'Sessão de 2 horas',
      'Análise de requisitos',
      'Recomendações técnicas',
      'Escolha de tecnologias',
      'Arquitetura de sistemas',
      'Estimativas de custos',
      'Roadmap de desenvolvimento',
      'Relatório escrito'
    ],
    process_steps: [
      { step: 1, title: 'Agendamento', description: 'Marcação da sessão' },
      { step: 2, title: 'Preparação', description: 'Análise prévia do projeto' },
      { step: 3, title: 'Consultoria', description: 'Sessão de 2 horas' },
      { step: 4, title: 'Relatório', description: 'Documento com recomendações' }
    ],
    delivery_time: '2-3 dias',
    status: 'active',
    images: ['https://readdy.ai/api/search-image?query=professional%20technical%20consulting%20session%20with%20expert%20advisor%20discussing%20technology%20solutions%20digital%20strategy%20and%20business%20planning%20in%20modern%20office%20environment&width=800&height=600&seq=service6&orientation=landscape']
  }
];
