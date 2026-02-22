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
import { RegionsPage } from './pages/regions/list';
import { RegionCreatePage } from './pages/regions/create';
import { RegionDetailPage } from './pages/regions/detail';
import { OrganizationsPage } from './pages/organizations/list';
import { OrganizationCreatePage } from './pages/organizations/create';
import { OrganizationDetailPage } from './pages/organizations/detail';

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
            <Route path="regions" element={<RegionsPage />} />
            <Route path="regions/create" element={<RegionCreatePage />} />
            <Route path="regions/:id" element={<RegionDetailPage />} />
            <Route path="organizations" element={<OrganizationsPage />} />
            <Route path="organizations/create" element={<OrganizationCreatePage />} />
            <Route path="organizations/:id" element={<OrganizationDetailPage />} />
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
