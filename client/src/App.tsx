import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { MusicPlayerProvider } from './shared/contexts/MusicPlayerContext';
import GlobalMusicPlayer from './shared/components/GlobalMusicPlayer';
import { ChatWidget } from './shared/components/ChatWidget';
import { ErrorBoundary } from './shared/components/ErrorBoundary';
import { OfflineBanner } from './shared/components/OfflineBanner';
import { NavigationProgress } from './shared/components/NavigationProgress';
import { Toaster } from 'react-hot-toast';

const PublicPortal = lazy(() => import('./features/public/portal/pages/PublicPortal').then(m => ({ default: m.PublicPortal })));
// Removed WeatherFAB from global imports
const FoodWheel = lazy(() => import('./features/public/food-wheel/pages/FoodWheel'));
const ExcuseGenerator = lazy(() => import('./features/public/excuse-generator/pages/ExcuseGenerator'));
const HandsomeAnalyzer = lazy(() => import('./features/public/handsome-analyzer/pages/HandsomeAnalyzer').then(m => ({ default: m.HandsomeAnalyzer })));
const CVReviewer = lazy(() => import('./features/public/cv-reviewer/pages/CVReviewer').then(m => ({ default: m.CVReviewer })));
const MusicStation = lazy(() => import('./features/public/music-station/pages/MusicStation'));
const PixelAgents = lazy(() => import('./features/public/pixel-agents/pages/PixelAgents').then(m => ({ default: m.PixelAgents })));
const NumerologyPage = lazy(() => import('./features/public/numerology/pages/NumerologyPage').then(m => ({ default: m.NumerologyPage })));
const GenderQuizPage = lazy(() => import('./features/public/gender-quiz/pages/GenderQuizPage').then(m => ({ default: m.GenderQuizPage })));
const AstrologyPage = lazy(() => import('./features/public/astrology/pages/AstrologyPage').then(m => ({ default: m.AstrologyPage })));
const birthdayImport = () => import('./features/public/birthday/pages/BirthdayGreeting');
if (window.location.pathname === '/hbd') birthdayImport();
const BirthdayGreeting = lazy(birthdayImport);
const QRGenerator = lazy(() => import('./features/public/qr-generator/pages/QRGenerator').then(m => ({ default: m.QRGenerator })));
const CostStudy = lazy(() => import('./features/public/cost-study/pages/CostStudy').then(m => ({ default: m.CostStudy })));
const TarotPage = lazy(() => import('./features/public/tarot/pages/TarotPage').then(m => ({ default: m.TarotPage })));
const MagicBallPage = lazy(() => import('./features/public/magic-ball/pages/MagicBallPage').then(m => ({ default: m.MagicBallPage })));
const DeepStatusPage = lazy(() => import('./features/public/deep-status/pages/DeepStatusPage').then(m => ({ default: m.DeepStatusPage })));
const ChickenGame = lazy(() => import('./features/public/chicken-game/pages/ChickenGame').then(m => ({ default: m.ChickenGame })));
const BurnoutCheckPage = lazy(() => import('./features/public/burnout-check/pages/BurnoutCheckPage').then(m => ({ default: m.BurnoutCheckPage })));
const PoemGenerator = lazy(() => import('./features/public/poem-generator/pages/PoemGenerator').then(m => ({ default: m.PoemGenerator })));
const ChibiSticker = lazy(() => import('./features/public/chibi-sticker/pages/ChibiSticker').then(m => ({ default: m.ChibiSticker })));
const FaceReader = lazy(() => import('./features/public/face-reader/pages/FaceReader').then(m => ({ default: m.FaceReader })));
const DreamInterpreter = lazy(() => import('./features/public/dream-interpreter/pages/DreamInterpreter').then(m => ({ default: m.DreamInterpreter })));
const TechDuel = lazy(() => import('./features/public/tech-duel/pages/TechDuel').then(m => ({ default: m.TechDuel })));
const ProfilePage = lazy(() => import('./features/public/profile/pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const EnglishHub = lazy(() => import('./features/public/english/pages/EnglishHub').then(m => ({ default: m.EnglishHub })));
const EnglishChat = lazy(() => import('./features/public/english/pages/EnglishChat').then(m => ({ default: m.EnglishChat })));
const EnglishFlashcard = lazy(() => import('./features/public/english/pages/EnglishFlashcard').then(m => ({ default: m.EnglishFlashcard })));
const EnglishChallenge = lazy(() => import('./features/public/english/pages/EnglishChallenge').then(m => ({ default: m.EnglishChallenge })));
const EnglishDictionary = lazy(() => import('./features/public/english/pages/EnglishDictionary').then(m => ({ default: m.EnglishDictionary })));
const DailyPuzzle = lazy(() => import('./features/public/english/pages/DailyPuzzle').then(m => ({ default: m.DailyPuzzle })));
const WordSprint = lazy(() => import('./features/public/english/pages/WordSprint').then(m => ({ default: m.WordSprint })));
const SpellingBee = lazy(() => import('./features/public/english/pages/SpellingBee').then(m => ({ default: m.SpellingBee })));
const PetLandingPage = lazy(() => import('./features/public/pet-landing/pages/PetLandingPage').then(m => ({ default: m.PetLandingPage })));
const EnglishCourseMap = lazy(() => import('./features/public/english/pages/EnglishCourseMap').then(m => ({ default: m.EnglishCourseMap })));
const EnglishUnitPlayer = lazy(() => import('./features/public/english/pages/EnglishUnitPlayer').then(m => ({ default: m.EnglishUnitPlayer })));
const WritingLab = lazy(() => import('./features/public/english/pages/WritingLab').then(m => ({ default: m.WritingLab })));
const DictationLab = lazy(() => import('./features/public/english/pages/DictationLab').then(m => ({ default: m.DictationLab })));
const SentenceScramble = lazy(() => import('./features/public/english/pages/SentenceScramble').then(m => ({ default: m.SentenceScramble })));
const WordMatch = lazy(() => import('./features/public/english/pages/WordMatch').then(m => ({ default: m.WordMatch })));
const IdiomQuest = lazy(() => import('./features/public/english/pages/IdiomQuest').then(m => ({ default: m.IdiomQuest })));
const ContextClues = lazy(() => import('./features/public/english/pages/ContextClues').then(m => ({ default: m.ContextClues })));
const TuTienGame = lazy(() => import('./features/public/tutien/pages/TuTienGame'));
const Login = lazy(() => import('./features/public/auth/pages/Login').then(m => ({ default: m.Login })));
const WebQuizLobby = lazy(() => import('./features/public/web-quiz/pages/Lobby').then(m => ({ default: m.WebQuizLobby })));
const WebQuizRoom = lazy(() => import('./features/public/web-quiz/pages/Room').then(m => ({ default: m.WebQuizRoom })));
const EmulatorCheck = lazy(() => import('./features/public/emulator-check/pages/EmulatorCheck').then(m => ({ default: m.EmulatorCheck })));
const MermaidEditor = lazy(() => import('./features/public/mermaid-editor/pages/MermaidEditor').then(m => ({ default: m.MermaidEditor })));
const MermaidTutorial = lazy(() => import('./features/public/mermaid-editor/pages/MermaidTutorial').then(m => ({ default: m.MermaidTutorial })));

const Layout = lazy(() => import('./shared/components/Layout').then(m => ({ default: m.Layout })));
const Dashboard = lazy(() => import('./features/admin/dashboard/pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Logs = lazy(() => import('./features/admin/logs/pages/Logs').then(m => ({ default: m.Logs })));
const Prompts = lazy(() => import('./features/admin/prompts/pages/Prompts').then(m => ({ default: m.Prompts })));
const ControlCenter = lazy(() => import('./features/admin/control-center/pages/ControlCenter').then(m => ({ default: m.ControlCenter })));
const Settings = lazy(() => import('./features/admin/settings/pages/Settings').then(m => ({ default: m.Settings })));
const Pets = lazy(() => import('./features/admin/pets-admin/pages/Pets').then(m => ({ default: m.Pets })));
const UserManagement = lazy(() => import('./features/admin/user-management/pages/UserManagement').then(m => ({ default: m.UserManagement })));
const Identity = lazy(() => import('./features/admin/identity/pages/Identity').then(m => ({ default: m.Identity })));
const CoupleLandingPage = lazy(() => import('./features/admin/couple/pages/CoupleLandingPage').then(m => ({ default: m.CoupleLandingPage })));
const WebChatPrompt = lazy(() => import('./features/admin/web-chat-prompt/pages/WebChatPrompt').then(m => ({ default: m.WebChatPrompt })));

const LoadingFallback = () => (
  <div className="min-h-screen bg-slate-50 dark:bg-[#0d1117] transition-colors">
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-6 md:py-14">
      <div className="flex items-center gap-3 mb-8 md:mb-10">
        <div className="w-11 h-11 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse shrink-0" />
        <div className="space-y-2 flex-1">
          <div className="h-7 w-52 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
          <div className="h-3 w-32 bg-slate-100 dark:bg-slate-800/60 rounded animate-pulse" />
        </div>
      </div>
      <div className="space-y-5">
        <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-28 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
          <div className="h-28 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
        </div>
        <div className="h-32 bg-slate-100 dark:bg-slate-800/50 rounded-xl animate-pulse" />
      </div>
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
        <OfflineBanner />
        <NavigationProgress />
        <Toaster position="top-right" toastOptions={{ 
          className: 'dark:bg-slate-800 dark:text-white',
          style: { borderRadius: '12px', padding: '16px' }
        }} />
        <GlobalMusicPlayer />
        <ChatWidget />
        <ErrorBoundary>
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
            <Route path="/english" element={<EnglishHub />} />
            <Route path="/english/course" element={<EnglishCourseMap />} />
            <Route path="/english/course/:unitId" element={<EnglishUnitPlayer />} />
            <Route path="/english/chat" element={<EnglishChat />} />
            <Route path="/english/flashcard" element={<EnglishFlashcard />} />
            <Route path="/english/challenge" element={<EnglishChallenge />} />
            <Route path="/english/dictionary" element={<EnglishDictionary />} />
            <Route path="/english/daily-puzzle" element={<DailyPuzzle />} />
            <Route path="/english/word-sprint" element={<WordSprint />} />
            <Route path="/english/spelling-bee" element={<SpellingBee />} />
            <Route path="/english/writing" element={<WritingLab />} />
            <Route path="/english/dictation" element={<DictationLab />} />
            <Route path="/english/scramble" element={<SentenceScramble />} />
            <Route path="/english/word-match" element={<WordMatch />} />
            <Route path="/english/idiom-quest" element={<IdiomQuest />} />
            <Route path="/english/context-clues" element={<ContextClues />} />
            <Route path="/profile" element={<ProfilePage />} />

            <Route path="/petlandingpage" element={<PetLandingPage />} />
            <Route path="/tutien" element={<TuTienGame />} />
            <Route path="/login" element={<Login />} />
            <Route path="/quiz" element={<div className="bg-slate-50 dark:bg-slate-900 min-h-screen p-4 md:p-8"><WebQuizLobby /></div>} />
            <Route path="/quiz/room/:roomId" element={<div className="bg-slate-50 dark:bg-slate-900 min-h-screen p-4 md:p-8 flex items-center justify-center"><WebQuizRoom /></div>} />
            <Route path="/emulator-check" element={<EmulatorCheck />} />
            <Route path="/mermaid-editor" element={<MermaidEditor />} />
            <Route path="/mermaid-tutorial" element={<MermaidTutorial />} />
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
                    <Route path="/web-chat-prompt" element={<WebChatPrompt />} />
                  </Routes>
                </Layout>
              </RequireAuth>
            } />
          </Routes>
        </Suspense>
        </ErrorBoundary>
      </div>
      {/* WeatherFAB moved to PublicPortal */}
    </MusicPlayerProvider>
  );
}

export default App;
