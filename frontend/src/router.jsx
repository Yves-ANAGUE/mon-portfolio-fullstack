// frontend/src/router.jsx
import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import Home from './pages/Home';
import Projects from './pages/Projects';
import Skills from './pages/Skills';
import Testimonials from './pages/Testimonials';
import Downloads from './pages/Downloads';
import Contact from './pages/Contact';
import Media from './pages/Media';
import Links from './pages/Links';
import Chatbot from './pages/Chatbot'; // ✅ AJOUT
import Admin from './pages/Admin';
import AdminLayout from './components/admin/AdminLayout';
import Login from './components/admin/Login';
import { ROUTES } from './utils/constants';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { path: ROUTES.HOME, element: <Home /> },
      { path: ROUTES.PROJECTS, element: <Projects /> },
      { path: ROUTES.SKILLS, element: <Skills /> },
      { path: '/testimonials', element: <Testimonials /> },
      { path: ROUTES.DOWNLOADS, element: <Downloads /> },
      { path: '/media', element: <Media /> },
      { path: '/links', element: <Links /> },
      { path: '/chatbot', element: <Chatbot /> }, // ✅ AJOUT
      { path: ROUTES.CONTACT, element: <Contact /> },
    ],
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { path: ROUTES.ADMIN_LOGIN, element: <Login /> },
      { path: ROUTES.ADMIN, element: <Admin /> },
    ],
  },
]);