import { Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import Layout from '@/components/Layout';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import MapPage from '@/pages/MapPage';
import IncidentsPage from '@/pages/IncidentsPage';
import ParkingPage from '@/pages/ParkingPage';
import FoodCourtPage from '@/pages/FoodCourtPage';
import TournamentPage from '@/pages/TournamentPage';
import VolunteersPage from '@/pages/VolunteersPage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import ChatbotPage from '@/pages/ChatbotPage';
import NotificationsPage from '@/pages/NotificationsPage';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { token } = useStore();
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  const { token } = useStore();

  return (
    <Routes>
      <Route path="/login" element={token ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="map" element={<MapPage />} />
        <Route path="incidents" element={<IncidentsPage />} />
        <Route path="parking" element={<ParkingPage />} />
        <Route path="food-court" element={<FoodCourtPage />} />
        <Route path="tournament" element={<TournamentPage />} />
        <Route path="volunteers" element={<VolunteersPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="chatbot" element={<ChatbotPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
