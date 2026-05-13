import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Tickets from './pages/Tickets';
import Inventory from './pages/Inventory';
import Profile from './pages/Profile';
import Calendar from './pages/Calendar';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import SuperAdminDashboard from './pages/superadmin/Dashboard';
import SuperAdminCompanies from './pages/superadmin/Companies';
import AssetLookup from './pages/AssetLookup';
import NewTicket from './pages/NewTicket';
import TicketDetail from './pages/TicketDetail';
import PublicAsset from './pages/PublicAsset';
import Messages from './pages/Messages';
import AccessControl from './pages/AccessControl';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, isLoading } = useAuth();
  
  if (isLoading) return <div className="flex items-center justify-center min-h-screen">Cargando...</div>;
  if (!token) return <Navigate to="/login" />;
  
  return (
    <div className="flex bg-slate-50 min-h-screen relative">
      <Sidebar />
      <main className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        <TopBar />
        <div className="flex-1 p-4 md:p-8 overflow-x-hidden">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/dashboard/tickets" element={<ProtectedRoute><Tickets /></ProtectedRoute>} />
        <Route path="/dashboard/tickets/new" element={<ProtectedRoute><NewTicket /></ProtectedRoute>} />
        <Route path="/dashboard/tickets/:id" element={<ProtectedRoute><TicketDetail /></ProtectedRoute>} />
        <Route path="/dashboard/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
        <Route path="/dashboard/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/dashboard/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
        <Route path="/dashboard/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
        <Route path="/dashboard/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/dashboard/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
        <Route path="/dashboard/access" element={<ProtectedRoute><AccessControl /></ProtectedRoute>} />
        <Route path="/dashboard/assets/lookup" element={<ProtectedRoute><AssetLookup /></ProtectedRoute>} />
        <Route path="/public/asset/:token" element={<PublicAsset />} />
        
        {/* SuperAdmin Routes */}
        <Route path="/superadmin" element={<ProtectedRoute><SuperAdminDashboard /></ProtectedRoute>} />
        <Route path="/superadmin/companies" element={<ProtectedRoute><SuperAdminCompanies /></ProtectedRoute>} />
        
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

export default App;
