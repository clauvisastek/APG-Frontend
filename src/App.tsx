import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RequireRole } from './components/RequireRole';
import { HomePage } from './pages/HomePage';
import { ProjectsPage } from './pages/ProjectsPage';
import { CreateProjectPage } from './pages/CreateProjectPage';
import { ClientsPage } from './pages/ClientsPage';
import { BusinessUnitsPageNew } from './pages/BusinessUnitsPageNew';
import { InformationPage } from './pages/InformationPage';
import { AdminPage } from './pages/AdminPage';
import { ProfilePage } from './pages/ProfilePage';
import { TechnicalAssignmentsPage } from './pages/TechnicalAssignmentsPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { CalculettePage } from './pages/CalculettePage';
import { useAuthInterceptor } from './hooks/useAuthInterceptor';

function App() {
  // Configure global auth interceptor for automatic token refresh and logout
  useAuthInterceptor();

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route
          index
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="projects"
          element={
            <ProtectedRoute>
              <ProjectsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="projects/new"
          element={
            <ProtectedRoute>
              <CreateProjectPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="clients"
          element={
            <ProtectedRoute>
              <ClientsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="technical-assignments"
          element={
            <ProtectedRoute>
              <TechnicalAssignmentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="resources"
          element={
            <ProtectedRoute>
              <ResourcesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="calculette"
          element={
            <ProtectedRoute>
              <CalculettePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="business-units"
          element={
            <RequireRole requiredRoles={['Admin', 'CFO']}>
              <BusinessUnitsPageNew />
            </RequireRole>
          }
        />
        <Route
          path="informations"
          element={
            <ProtectedRoute>
              <InformationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin"
          element={
            <RequireRole requiredRoles={['Admin']}>
              <AdminPage />
            </RequireRole>
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;

