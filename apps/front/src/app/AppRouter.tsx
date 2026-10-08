import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthContextProvider, AuthRouterMiddleware } from './auth/auth';
import { AdminLayout } from './components/AdminLayout/AdminLayout';

const Login = lazy(() => import('./pages/login/Login'));
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'));
const HomeLogos = lazy(() => import('./pages/home-logos/HomeLogos'));
const ClientStories = lazy(
  () => import('./pages/client-stories/ClientStories'),
);
const BlogPosts = lazy(() => import('./pages/blog-posts/BlogPosts'));
const About = lazy(() => import('./pages/about/About'));
const Cases = lazy(() => import('./pages/cases/Cases'));
const HomeContent = lazy(() => import('./pages/home-content/HomeContent'));
const MediaGallery = lazy(() => import('./pages/media/MediaGallery'));

function Loading() {
  return (
    <div className="grid min-h-screen place-items-center text-slate-500">
      Carregando…
    </div>
  );
}

function AppRoutes() {
  return (
    <AdminLayout>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="home-logos" element={<HomeLogos />} />
          <Route path="client-stories" element={<ClientStories />} />
          <Route path="blog-posts" element={<BlogPosts />} />
          <Route path="about" element={<About />} />
          <Route path="cases" element={<Cases />} />
          <Route path="home-content" element={<HomeContent />} />
          <Route path="media" element={<MediaGallery />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AdminLayout>
  );
}

export function AppRouter() {
  return (
    <BrowserRouter
      basename={import.meta.env.BASE_URL || '/'}
      future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
    >
      <AuthContextProvider>
        <AuthRouterMiddleware
          authenticatedComponent={<AppRoutes />}
          unauthenticatedComponent={
            <Suspense fallback={<Loading />}>
              <Login />
            </Suspense>
          }
          errorComponent={
            <Suspense fallback={<Loading />}>
              <Login />
            </Suspense>
          }
        />
      </AuthContextProvider>
    </BrowserRouter>
  );
}

export default AppRouter;
