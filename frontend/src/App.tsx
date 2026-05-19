import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useAuthStore } from './context/auth';
import AdminRoute from './components/PrivateRoute';
import { HUDProvider } from './context/HUDContext';

// ── Route-level code splitting ───────────────────────────────────────────────
// Every page is its own chunk: a route only parses its own JS instead of the
// whole 1.27 MB monolith. (Note: wagmi/rainbowkit still load at the app root
// via main.tsx — deferring those is a separate, larger follow-up.)
const LandingPage = lazy(() => import('./pages/LandingPage'));
const Welcome = lazy(() => import('./pages/Welcome'));
const Login = lazy(() => import('./pages/Auth').then((m) => ({ default: m.Login })));
const Register = lazy(() => import('./pages/Auth').then((m) => ({ default: m.Register })));
const CourseCatalog = lazy(() => import('./pages/CourseCatalog'));
const CourseDetail = lazy(() => import('./pages/CourseDetail'));
const Pricing = lazy(() => import('./pages/Pricing'));
const LessonPlayer = lazy(() => import('./pages/LessonPlayer'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const PaymentSuccess = lazy(() => import('./pages/PaymentSuccess'));
const ScriptGenerator = lazy(() => import('./pages/ScriptGenerator'));
const HyperfocusHtmlCss = lazy(() => import('./pages/courses/HyperfocusHtmlCss'));
const ComponentChaosLab = lazy(() => import('./pages/courses/ComponentChaosLab'));
const ShipFullStackThing = lazy(() => import('./pages/courses/ShipFullStackThing'));
const PlaytestFeedback = lazy(() => import('./pages/PlaytestFeedback'));
const Admin = lazy(() => import('./pages/Admin'));
const TokensPage = lazy(() => import('./pages/TokensPage'));
const ShopPage = lazy(() => import('./pages/ShopPage'));
const Profile = lazy(() => import('./pages/Profile'));
const Certificate = lazy(() => import('./pages/Certificate'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const Quests = lazy(() => import('./pages/Quests'));
const Courses = lazy(() => import('./pages/Courses'));
const CourseModule = lazy(() => import('./pages/CourseModule'));
const PetsPage = lazy(() => import('./pages/Pets'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
// Wallet/web3 stack — loaded only when the /pets route mounts (see Web3Provider).
const Web3Provider = lazy(() => import('./components/Web3Provider'));
const VibeLabsIndex = lazy(() => import('./pages/vibe-labs/VibeLabsIndex'));
const Level1Claude = lazy(() => import('./pages/vibe-labs/Level1Claude'));
const Level2AiStudio = lazy(() => import('./pages/vibe-labs/Level2AiStudio'));
const Level3Trae = lazy(() => import('./pages/vibe-labs/Level3Trae'));
const Level4Compare = lazy(() => import('./pages/vibe-labs/Level4Compare'));
const Level5FullStack = lazy(() => import('./pages/vibe-labs/Level5FullStack'));

function RouteFallback() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0A0E1A',
        color: '#8B9CC8',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: 15,
      }}
    >
      Wiring up the Z0ne…
    </div>
  );
}

function PrivateRoute({ children }: { children: React.ReactElement }) {
  const { user, loading } = useAuthStore();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  const { user } = useAuthStore();
  return (
    <HUDProvider userId={user?.id}>
      <Router>
        {/* Route-scoped boundary: a route crash recovers without tearing
            down the app shell / providers (main.tsx has the outer one). */}
        <ErrorBoundary>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              {/* Public marketing landing — own dark chrome, skips light Layout */}
              <Route path="/" element={<LandingPage />} />
              {/* Vibe Labs — standalone dark, public to view, claim gated by auth */}
              <Route path="/vibe-labs" element={<VibeLabsIndex />} />
              <Route path="/vibe-labs/level-1" element={<Level1Claude />} />
              <Route path="/vibe-labs/level-2" element={<Level2AiStudio />} />
              <Route path="/vibe-labs/level-3" element={<Level3Trae />} />
              <Route path="/vibe-labs/level-4" element={<Level4Compare />} />
              <Route path="/vibe-labs/level-5" element={<Level5FullStack />} />
              {/* First-login onboarding — full-bleed, skips Layout */}
              <Route
                path="/welcome"
                element={
                  <PrivateRoute>
                    <Welcome />
                  </PrivateRoute>
                }
              />
              <Route element={<Layout />}>
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route path="pricing" element={<Pricing />} />
                <Route path="courses" element={<Courses />} />
                <Route path="courses/:slug" element={<CourseModule />} />
                <Route path="catalog" element={<CourseCatalog />} />
                <Route path="catalog/:id" element={<CourseDetail />} />
                <Route path="leaderboard" element={<Leaderboard />} />
                <Route
                  path="pets"
                  element={
                    <Web3Provider>
                      <PetsPage />
                    </Web3Provider>
                  }
                />
                <Route path="privacy" element={<Privacy />} />
                <Route path="terms" element={<Terms />} />
                <Route
                  path="quests"
                  element={
                    <PrivateRoute>
                      <Quests />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="dashboard"
                  element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  }
                />
                <Route path="payment-success" element={<PaymentSuccess />} />
                <Route path="courses/html-css" element={<HyperfocusHtmlCss />} />
                <Route path="courses/component-chaos" element={<ComponentChaosLab />} />
                <Route path="courses/full-stack" element={<ShipFullStackThing />} />
                <Route
                  path="scripts"
                  element={
                    <PrivateRoute>
                      <ScriptGenerator />
                    </PrivateRoute>
                  }
                />
                <Route path="feedback" element={<PlaytestFeedback />} />
                <Route
                  path="tokens"
                  element={
                    <PrivateRoute>
                      <TokensPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="shop"
                  element={
                    <PrivateRoute>
                      <ShopPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="profile"
                  element={
                    <PrivateRoute>
                      <Profile />
                    </PrivateRoute>
                  }
                />
                <Route element={<AdminRoute role="admin" />}>
                  <Route path="admin" element={<Admin />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Route>
              <Route
                path="/learn/:courseId"
                element={
                  <PrivateRoute>
                    <LessonPlayer />
                  </PrivateRoute>
                }
              />
              <Route
                path="/certificate/:courseId"
                element={
                  <PrivateRoute>
                    <Certificate />
                  </PrivateRoute>
                }
              />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </Router>
    </HUDProvider>
  );
}

export default App;
