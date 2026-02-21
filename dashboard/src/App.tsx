import { Routes, Route } from 'react-router-dom';
import { AuthInitializer } from './components/AuthInitializer';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Toaster } from './components/ui/sonner';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { LoginPage } from './pages/auth/login';
import { OverviewPage } from './pages/overview/index';
import { PlayersPage } from './pages/players/list';
import { PlayerFormPage } from './pages/players/form';
import { TeamsPage } from './pages/teams/list';
import { MatchesPage } from './pages/matches/list';
import { RatingsPage } from './pages/ratings/list';
import { PointsPage } from './pages/points/list';
import { UsersPage } from './pages/users/list';
import { UserCreatePage } from './pages/users/create';
import { UserDetailPage } from './pages/users/detail';
import { PermissionGroupsPage } from './pages/permissions/groups';
import { UserPermissionsPage } from './pages/users/permissions';
import { UserPermissionDetailPage } from './pages/users/permission-detail';
import { SettingsPage } from './pages/settings/index';
import { NotFoundPage } from './pages/not-found';

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
            <Route path="users/create" element={<UserCreatePage />} />
            <Route path="users/permissions" element={<UserPermissionsPage />} />
            <Route path="users/:id" element={<UserDetailPage />} />
            <Route path="users/:id/permissions" element={<UserPermissionDetailPage />} />
            <Route path="permissions/groups" element={<PermissionGroupsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>

        {/* Global fallback for unmatched public routes */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Toaster />
    </AuthInitializer>
  );
}
