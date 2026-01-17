import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';

const HomePage = lazy(() => import('../pages/home/page'));
const CategoryPage = lazy(() => import('../pages/category/page'));
const ServicesPage = lazy(() => import('../pages/services/page'));
const ServiceDetailPage = lazy(() => import('../pages/services/detail/page'));
const AboutPage = lazy(() => import('../pages/about/page'));
const ContactPage = lazy(() => import('../pages/contact/page'));
const ProfilePage = lazy(() => import('../pages/profile/page'));
const LoginPage = lazy(() => import('../pages/login/page'));
const RegisterPage = lazy(() => import('../pages/register/page'));
const AdminPage = lazy(() => import('../pages/admin/page'));
const SetupPage = lazy(() => import('../pages/setup/page'));
const NotFoundPage = lazy(() => import('../pages/NotFound'));

const routes: RouteObject[] = [
  // Rotas Públicas (com Layout público)
  {
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <HomePage />
      },
      {
        path: '/category',
        element: <CategoryPage />
      },
      {
        path: '/services',
        element: <ServicesPage />
      },
      {
        path: '/services/:slug',
        element: <ServiceDetailPage />
      },
      {
        path: '/about',
        element: <AboutPage />
      },
      {
        path: '/contact',
        element: <ContactPage />
      },
      {
        path: '/profile',
        element: <ProtectedRoute><ProfilePage /></ProtectedRoute>
      },
      {
        path: '*',
        element: <NotFoundPage />
      }
    ]
  },
  // Rotas de Autenticação (sem Layout)
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/register',
    element: <RegisterPage />
  },
  {
    path: '/setup',
    element: <SetupPage />
  },
  // Rotas Admin (protegidas, sem Layout público)
  {
    path: '/admin',
    element: <ProtectedRoute><AdminPage /></ProtectedRoute>
  },
  {
    path: '/admin/dashboard',
    element: <ProtectedRoute><AdminPage /></ProtectedRoute>
  },
  {
    path: '/admin/*',
    element: <ProtectedRoute><AdminPage /></ProtectedRoute>
  }
];

export default routes;
