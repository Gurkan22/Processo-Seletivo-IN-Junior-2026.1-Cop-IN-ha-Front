import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminLayout } from './components/AdminLayout';
import { Home } from './pages/Home';
import { Noticia } from './pages/Noticia';
import { Grupos } from './pages/Grupos';
import { Jogos } from './pages/Jogos';
import { Simulador } from './pages/Simulador';
import { Login } from './pages/Login';
import { AdminDashboard } from './pages/admin/Dashboard';
import { AdminNoticias } from './pages/admin/Noticias';
import { AdminGrupos } from './pages/admin/Grupos';
import { AdminTimes } from './pages/admin/Times';
import { AdminJogos } from './pages/admin/Jogos';
import { AdminEstadios } from './pages/admin/Estadios';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/noticia/:id" element={<Noticia />} />
        <Route path="/grupos" element={<Grupos />} />
        <Route path="/jogos" element={<Jogos />} />
        <Route path="/simulador" element={<Simulador />} />
      </Route>

      <Route path="/login" element={<Login />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="noticias" element={<AdminNoticias />} />
        <Route path="grupos" element={<AdminGrupos />} />
        <Route path="times" element={<AdminTimes />} />
        <Route path="jogos" element={<AdminJogos />} />
        <Route path="estadios" element={<AdminEstadios />} />
      </Route>
    </Routes>
  );
}
