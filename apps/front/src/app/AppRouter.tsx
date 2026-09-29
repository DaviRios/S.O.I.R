import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthContextProvider, AuthRouterMiddleware } from './auth/auth';
import { Login } from './pages/login/Login';
import { Dashboard } from './pages/dashboard/Dashboard';
import { HomeLogos } from './pages/home-logos/HomeLogos';
import { ClientStories } from './pages/client-stories/ClientStories';
import { BlogPosts } from './pages/blog-posts/BlogPosts';
import { About } from './pages/about/About';
import { Cases } from './pages/cases/Cases';
import { HomeContent } from './pages/home-content/HomeContent';
import { MediaGallery } from './pages/media/MediaGallery';

function AppRoutes() {
  return (
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
  );
}

const skipAuth = import.meta.env.VITE_SKIP_AUTH === 'true';

export function AppRouter() {
  const basename = import.meta.env.BASE_URL || '/';

  // Atalho opcional para desenvolvimento e testes locais.
  if (skipAuth) {
    return (
      <BrowserRouter basename={basename}>
        <AppRoutes />
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter basename={basename}>
      <AuthContextProvider>
        <AuthRouterMiddleware
          authenticatedComponent={<AppRoutes />}
          unauthenticatedComponent={<Login />}
          errorComponent={<Login />}
        />
      </AuthContextProvider>
    </BrowserRouter>
  );
}

export default AppRouter;
