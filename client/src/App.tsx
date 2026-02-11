import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Logs } from './pages/Logs';
import { Prompts } from './pages/Prompts';
import { ControlCenter } from './pages/ControlCenter';
import { Settings } from './pages/Settings';

import { Login } from './pages/Login';
import { Navigate, useLocation } from 'react-router-dom';

// Auth Wrapper
const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem('token');
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

function App() {
  return (
    <Routes>
       <Route path="/login" element={<Login />} />
       <Route path="/*" element={
         <RequireAuth>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/logs" element={<Logs />} />
                <Route path="/prompts" element={<Prompts />} />
                <Route path="/control" element={<ControlCenter />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </Layout>
         </RequireAuth>
       } />
    </Routes>
  );
}

export default App;
