import { useState } from 'react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simular envio
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus('success');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      
      setTimeout(() => setSubmitStatus('idle'), 5000);
    }, 1500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const contactMethods = [
    {
      icon: 'ri-mail-line',
      title: 'E-mail',
      value: 'jokadamas616@gmail.com',
      link: 'mailto:jokadamas616@gmail.com',
      description: 'Resposta em até 24 horas'
    },
    {
      icon: 'ri-whatsapp-line',
      title: 'WhatsApp',
      value: '+352 621 717 862',
      link: 'https://wa.me/352621717862',
      description: 'Atendimento rápido e direto'
    },
    {
      icon: 'ri-phone-line',
      title: 'Telefone',
      value: '+352 621 717 862',
      link: 'tel:+352621717862',
      description: 'Seg-Sex: 9h-18h'
    }
  ];

  const faqs = [
    {
      question: 'Quanto tempo leva para desenvolver um site?',
      answer: 'O prazo varia conforme a complexidade do projeto. Sites simples levam 7-15 dias, enquanto e-commerce e sistemas mais complexos podem levar 30-60 dias.'
    },
    {
      question: 'Oferecem suporte após a entrega?',
      answer: 'Sim! Todos os nossos projetos incluem período de suporte técnico. Sites têm 30 dias, e-commerce 60 dias, e dashboards 45 dias de suporte gratuito.'
    },
    {
      question: 'Trabalham com clientes internacionais?',
      answer: 'Sim, atendemos clientes em todo o mundo. Comunicação por e-mail, WhatsApp e videochamadas.'
    },
    {
      question: 'Como funciona o pagamento?',
      answer: 'Geralmente dividimos em 3 etapas: 30% no início, 40% na aprovação do design, e 30% na entrega final. Aceitamos transferência bancária e PayPal.'
    },
    {
      question: 'Fazem manutenção de sites existentes?',
      answer: 'Sim! Oferecemos serviços de manutenção, atualização, otimização e modernização de sites já existentes.'
    },
    {
      question: 'Qual a diferença entre site e e-commerce?',
      answer: 'Um site é institucional (apresentação da empresa). E-commerce é uma loja online completa com carrinho, pagamentos e gestão de produtos.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://readdy.ai/api/search-image?query=abstract%20modern%20communication%20background%20with%20network%20connections%20digital%20contact%20and%20technology%20elements%20in%20dark%20tones%20with%20golden%20accents&width=1920&height=600&seq=contactbg1&orientation=landscape')] bg-cover bg-center opacity-10"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6">
            <h1 className="text-5xl lg:text-6xl font-bold">
              Entre em <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Contacto</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Estamos prontos para transformar suas ideias em realidade. Fale connosco!
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {contactMethods.map((method, index) => (
              <a
                key={index}
                href={method.link}
                target={method.link.startsWith('http') ? '_blank' : undefined}
                rel={method.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 text-center group cursor-pointer"
              >
                <div className="w-16 h-16 flex items-center justify-center bg-amber-100 text-amber-600 rounded-full mx-auto mb-6 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
                  <i className={`${method.icon} text-3xl`}></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{method.title}</h3>
                <p className="text-lg text-amber-600 font-semibold mb-2">{method.value}</p>
                <p className="text-sm text-gray-600">{method.description}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Envie uma Mensagem</h2>
            <p className="text-lg text-gray-600">Preencha o formulário e entraremos em contacto em breve</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-gray-50 p-8 rounded-2xl shadow-lg space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300 text-sm"
                  placeholder="Seu nome"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  E-mail *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300 text-sm"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                  Telefone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300 text-sm"
                  placeholder="+352 XXX XXX XXX"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                  Assunto *
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300 text-sm cursor-pointer"
                >
                  <option value="">Selecione um assunto</option>
                  <option value="website">Desenvolvimento de Site</option>
                  <option value="ecommerce">E-commerce</option>
                  <option value="dashboard">Dashboard Administrativo</option>
                  <option value="automation">Automação</option>
                  <option value="seo">Otimização & SEO</option>
                  <option value="consulting">Consultoria</option>
                  <option value="support">Suporte Técnico</option>
                  <option value="other">Outro</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                Mensagem *
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={6}
                maxLength={500}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300 resize-none text-sm"
                placeholder="Descreva seu projeto ou dúvida..."
              />
              <p className="text-xs text-gray-500 mt-2">Máximo 500 caracteres</p>
            </div>

            {submitStatus === 'success' && (
              <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-3">
                <i className="ri-check-line text-xl"></i>
                <span>Mensagem enviada com sucesso! Entraremos em contacto em breve.</span>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-3">
                <i className="ri-error-warning-line text-xl"></i>
                <span>Erro ao enviar mensagem. Tente novamente ou contacte-nos diretamente.</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <i className="ri-loader-4-line animate-spin"></i>
                  Enviando...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <i className="ri-send-plane-line"></i>
                  Enviar Mensagem
                </span>
              )}
            </button>
          </form>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Perguntas Frequentes</h2>
            <p className="text-lg text-gray-600">Respostas para as dúvidas mais comuns</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details key={index} className="bg-white rounded-xl shadow-md overflow-hidden group">
                <summary className="px-6 py-4 font-semibold text-gray-900 cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-between">
                  <span>{faq.question}</span>
                  <i className="ri-arrow-down-s-line text-xl group-open:rotate-180 transition-transform"></i>
                </summary>
                <div className="px-6 py-4 text-gray-600 border-t border-gray-100">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Map Section (Optional) */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Onde Estamos</h2>
            <p className="text-lg text-gray-600">Luxemburgo - Atendimento remoto em todo o mundo</p>
          </div>

          <div className="bg-gray-100 rounded-2xl overflow-hidden shadow-lg" style={{ height: '400px' }}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2593.8!2d6.1296!3d49.6116!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDnCsDM2JzQxLjgiTiA2wrAwNyc0Ni41IkU!5e0!3m2!1spt!2slu!4v1234567890"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Localização"
            ></iframe>
          </div>
        </div>
      </section>
    </div>
  );
}
