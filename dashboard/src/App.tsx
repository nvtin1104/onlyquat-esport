import { Routes, Route } from 'react-router-dom';
import { AuthInitializer } from './components/AuthInitializer';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { OverviewPage } from './pages/OverviewPage';
import { PlayersPage } from './pages/PlayersPage';
import { PlayerFormPage } from './pages/PlayerFormPage';
import { TeamsPage } from './pages/TeamsPage';
import { MatchesPage } from './pages/MatchesPage';
import { RatingsPage } from './pages/RatingsPage';
import { PointsPage } from './pages/PointsPage';
import { UsersPage } from './pages/UsersPage';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
  return (
    <AuthInitializer>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route index element={<OverviewPage />} />
            <Route path="players" element={<PlayersPage />} />
            <Route path="players/new" element={<PlayerFormPage />} />
            <Route path="players/:id/edit" element={<PlayerFormPage />} />
            <Route path="teams" element={<TeamsPage />} />
            <Route path="matches" element={<MatchesPage />} />
            <Route path="ratings" element={<RatingsPage />} />
            <Route path="points" element={<PointsPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>
      </Routes>
    </AuthInitializer>
  );
}
