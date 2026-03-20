import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Logs } from './pages/Logs';
import { Prompts } from './pages/Prompts';
import { ControlCenter } from './pages/ControlCenter';
import { Settings } from './pages/Settings';
import { Pets } from './pages/Pets';
import { UserManagement } from './pages/UserManagement';

import { Login } from './pages/Login';
import { Navigate, useLocation } from 'react-router-dom';

import { Identity } from './pages/Identity';
import { PetLandingPage } from './pages/PetLandingPage';
import { CoupleLandingPage } from './pages/CoupleLandingPage';
import TuTienGame from './pages/TuTienGame';
import { WebQuizLobby } from './pages/WebQuiz/Lobby';
import { WebQuizRoom } from './pages/WebQuiz/Room';
import { PublicPortal } from './pages/PublicPortal';
import FoodWheel from './pages/FoodWheel';
import ExcuseGenerator from './pages/ExcuseGenerator';
import { HandsomeAnalyzer } from './pages/HandsomeAnalyzer';
import MusicStation from './pages/MusicStation';
import { MusicPlayerProvider } from './contexts/MusicPlayerContext';
import GlobalMusicPlayer from './components/GlobalMusicPlayer';
import { Toaster } from 'react-hot-toast';

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
    <MusicPlayerProvider>
      <div className="min-h-screen">
        <Toaster position="top-right" toastOptions={{ 
          className: 'dark:bg-slate-800 dark:text-white',
          style: { borderRadius: '12px', padding: '16px' }
        }} />
        <GlobalMusicPlayer />
        <Routes>
          <Route path="/" element={<PublicPortal />} />
          <Route path="/chatDVT" element={<PublicPortal />} />
          <Route path="/food-wheel" element={<FoodWheel />} />
          <Route path="/excuse-generator" element={<ExcuseGenerator />} />
          <Route path="/handsome" element={<HandsomeAnalyzer />} />
          <Route path="/music" element={<MusicStation />} />
          <Route path="/petlandingpage" element={<PetLandingPage />} />
       <Route path="/tutien" element={<TuTienGame />} />
       <Route path="/login" element={<Login />} />
       <Route path="/quiz" element={<div className="bg-slate-50 dark:bg-slate-900 min-h-screen p-4 md:p-8"><WebQuizLobby /></div>} />
       <Route path="/quiz/room/:roomId" element={<div className="bg-slate-50 dark:bg-slate-900 min-h-screen p-4 md:p-8 flex items-center justify-center"><WebQuizRoom /></div>} />
       <Route path="/admin/*" element={
         <RequireAuth>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/couple" element={<CoupleLandingPage />} />
                <Route path="/prompts" element={<Prompts />} />
                <Route path="/identity" element={<Identity />} />
                <Route path="/control" element={<ControlCenter />} />
                <Route path="/users" element={<UserManagement />} />
                <Route path="/pets" element={<Pets />} />
                <Route path="/logs" element={<Logs />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </Layout>
         </RequireAuth>
       } />
        </Routes>
      </div>
    </MusicPlayerProvider>
  );
}

export default App;
