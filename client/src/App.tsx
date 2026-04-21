import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { MusicPlayerProvider } from './contexts/MusicPlayerContext';
import GlobalMusicPlayer from './components/GlobalMusicPlayer';
import { Toaster } from 'react-hot-toast';

const PublicPortal = lazy(() => import('./pages/PublicPortal').then(m => ({ default: m.PublicPortal })));
const WeatherFAB = lazy(() => import('./pages/WeatherWidget').then(m => ({ default: m.WeatherFAB })));
const FoodWheel = lazy(() => import('./pages/FoodWheel'));
const ExcuseGenerator = lazy(() => import('./pages/ExcuseGenerator'));
const HandsomeAnalyzer = lazy(() => import('./pages/HandsomeAnalyzer').then(m => ({ default: m.HandsomeAnalyzer })));
const CVReviewer = lazy(() => import('./pages/CVReviewer').then(m => ({ default: m.CVReviewer })));
const MusicStation = lazy(() => import('./pages/MusicStation'));
const PixelAgents = lazy(() => import('./pages/PixelAgents').then(m => ({ default: m.PixelAgents })));
const NumerologyPage = lazy(() => import('./pages/NumerologyPage').then(m => ({ default: m.NumerologyPage })));
const GenderQuizPage = lazy(() => import('./pages/GenderQuizPage').then(m => ({ default: m.GenderQuizPage })));
const AstrologyPage = lazy(() => import('./pages/AstrologyPage').then(m => ({ default: m.AstrologyPage })));
const birthdayImport = () => import('./pages/BirthdayGreeting');
if (window.location.pathname === '/hbd') birthdayImport();
const BirthdayGreeting = lazy(birthdayImport);
const QRGenerator = lazy(() => import('./pages/QRGenerator').then(m => ({ default: m.QRGenerator })));
const CostStudy = lazy(() => import('./pages/CostStudy').then(m => ({ default: m.CostStudy })));
const TarotPage = lazy(() => import('./pages/TarotPage').then(m => ({ default: m.TarotPage })));
const MagicBallPage = lazy(() => import('./pages/MagicBallPage').then(m => ({ default: m.MagicBallPage })));
const DeepStatusPage = lazy(() => import('./pages/DeepStatusPage').then(m => ({ default: m.DeepStatusPage })));
const ChickenGame = lazy(() => import('./pages/ChickenGame').then(m => ({ default: m.ChickenGame })));
const BurnoutCheckPage = lazy(() => import('./pages/BurnoutCheckPage').then(m => ({ default: m.BurnoutCheckPage })));
const PoemGenerator = lazy(() => import('./pages/PoemGenerator').then(m => ({ default: m.PoemGenerator })));
const ChibiSticker = lazy(() => import('./pages/ChibiSticker').then(m => ({ default: m.ChibiSticker })));
const FaceReader = lazy(() => import('./pages/FaceReader').then(m => ({ default: m.FaceReader })));
const DreamInterpreter = lazy(() => import('./pages/DreamInterpreter').then(m => ({ default: m.DreamInterpreter })));
const TechDuel = lazy(() => import('./pages/TechDuel').then(m => ({ default: m.TechDuel })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const PetLandingPage = lazy(() => import('./pages/PetLandingPage').then(m => ({ default: m.PetLandingPage })));
const TuTienGame = lazy(() => import('./pages/TuTienGame'));
const Login = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const WebQuizLobby = lazy(() => import('./pages/WebQuiz/Lobby').then(m => ({ default: m.WebQuizLobby })));
const WebQuizRoom = lazy(() => import('./pages/WebQuiz/Room').then(m => ({ default: m.WebQuizRoom })));

const Layout = lazy(() => import('./components/Layout').then(m => ({ default: m.Layout })));
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Logs = lazy(() => import('./pages/Logs').then(m => ({ default: m.Logs })));
const Prompts = lazy(() => import('./pages/Prompts').then(m => ({ default: m.Prompts })));
const ControlCenter = lazy(() => import('./pages/ControlCenter').then(m => ({ default: m.ControlCenter })));
const Settings = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));
const Pets = lazy(() => import('./pages/Pets').then(m => ({ default: m.Pets })));
const UserManagement = lazy(() => import('./pages/UserManagement').then(m => ({ default: m.UserManagement })));
const Identity = lazy(() => import('./pages/Identity').then(m => ({ default: m.Identity })));
const CoupleLandingPage = lazy(() => import('./pages/CoupleLandingPage').then(m => ({ default: m.CoupleLandingPage })));

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0d1117]">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-slate-400 dark:text-slate-500 text-sm font-medium animate-pulse">Đang tải...</p>
    </div>
  </div>
);

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
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<PublicPortal />} />
            <Route path="/chatDVT" element={<PublicPortal />} />
            <Route path="/food-wheel" element={<FoodWheel />} />
            <Route path="/excuse-generator" element={<ExcuseGenerator />} />
            <Route path="/handsome" element={<HandsomeAnalyzer />} />
            <Route path="/cv-review" element={<CVReviewer />} />
            <Route path="/music" element={<MusicStation />} />
            <Route path="/pixel-agents" element={<PixelAgents />} />
            <Route path="/numerology" element={<NumerologyPage />} />
            <Route path="/gender-quiz" element={<GenderQuizPage />} />
            <Route path="/astrology" element={<AstrologyPage />} />
            <Route path="/hbd" element={<BirthdayGreeting />} />
            <Route path="/qr-generator" element={<QRGenerator />} />
            <Route path="/cost-study" element={<CostStudy />} />
            <Route path="/tarot" element={<TarotPage />} />
            <Route path="/magic-ball" element={<MagicBallPage />} />
            <Route path="/deep-status" element={<DeepStatusPage />} />
            <Route path="/chicken-game" element={<ChickenGame />} />
            <Route path="/burnout-check" element={<BurnoutCheckPage />} />
            <Route path="/poem-generator" element={<PoemGenerator />} />
            <Route path="/chibi-sticker" element={<ChibiSticker />} />
            <Route path="/face-reader" element={<FaceReader />} />
            <Route path="/dream-interpreter" element={<DreamInterpreter />} />
            <Route path="/tech-duel" element={<TechDuel />} />
            <Route path="/profile" element={<ProfilePage />} />

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
        </Suspense>
      </div>
      <Suspense fallback={null}>
        <WeatherFAB />
      </Suspense>
    </MusicPlayerProvider>
  );
}

export default App;
