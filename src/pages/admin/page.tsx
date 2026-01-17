import { useState, lazy, Suspense, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import AdminHeader from './components/AdminHeader';
import AdminSidebar from './components/AdminSidebar';
import DashboardOverview from './components/DashboardOverview';
import ProductsManagement from './components/ProductsManagement';
import CategoriesManagement from './components/CategoriesManagement';
import OrdersManagement from './components/OrdersManagement';
import CustomersManagement from './components/CustomersManagement';
import ContentManagement from './components/ContentManagement';
import MarketingManagement from './components/MarketingManagement';
import FinancialManagement from './components/FinancialManagement';
import SecurityManagement from './components/SecurityManagement';
import AutomationManagement from './components/AutomationManagement';
import SupportManagement from './components/SupportManagement';
import ShippingManagement from './components/ShippingManagement';
import TaxManagement from './components/TaxManagement';
import MarketplaceManagement from './components/MarketplaceManagement';
import ThemeEditor from './components/ThemeEditor';
import SiteSettingsManagement from './components/SiteSettingsManagement';
import WooCommerceIntegration from './components/WooCommerceIntegration';

const ServicesManagement = lazy(() => import('./components/ServicesManagement'));

export default function AdminPage() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userRole, setUserRole] = useState('admin');
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // Buscar role do utilizador
  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Erro ao buscar role:', error);
          return;
        }

        if (data?.role) {
          setUserRole(data.role);
        }
      } catch (error) {
        console.error('Erro ao buscar role:', error);
      }
    };

    fetchUserRole();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const renderContent = () => {
    const content = (() => {
      switch (activeSection) {
        case 'dashboard':
          return <DashboardOverview />;
        case 'products':
          return <ProductsManagement />;
        case 'services':
          return (
            <Suspense fallback={
              <div className="flex items-center justify-center h-64">
                <div className="w-12 h-12 border-4 border-[#b62bff] border-t-transparent rounded-full animate-spin"></div>
              </div>
            }>
              <ServicesManagement />
            </Suspense>
          );
        case 'categories':
          return <CategoriesManagement />;
        case 'orders':
          return <OrdersManagement />;
        case 'customers':
          return <CustomersManagement />;
        case 'content':
          return <ContentManagement />;
        case 'marketing':
          return <MarketingManagement />;
        case 'financial':
          return <FinancialManagement />;
        case 'security':
          return <SecurityManagement />;
        case 'automation':
          return <AutomationManagement />;
        case 'support':
          return <SupportManagement />;
        case 'shipping':
          return <ShippingManagement />;
        case 'tax':
          return <TaxManagement />;
        case 'marketplace':
          return <MarketplaceManagement />;
        case 'site-settings':
          return <SiteSettingsManagement />;
        case 'theme':
          return <ThemeEditor />;
        case 'woocommerce':
          return <WooCommerceIntegration />;
        default:
          return <DashboardOverview />;
      }
    })();

    return content;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0b0011]">
      <AdminHeader 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen}
        userRole={userRole}
      />
      
      <div className="flex">
        <AdminSidebar 
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          sidebarOpen={sidebarOpen}
        />
        
        <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'} pt-16`}>
          <div className="p-6">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
