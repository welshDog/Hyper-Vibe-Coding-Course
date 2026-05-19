import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { AuthInitializer } from './components/AuthInitializer';
import LandingPage from './pages/LandingPage';
import { Login, Register, ForgotPassword } from './pages/Auth';
import CourseCatalog from './pages/CourseCatalog';
import CourseDetail from './pages/CourseDetail';
import Pricing from './pages/Pricing';
import LessonPlayer from './pages/LessonPlayer';
import Dashboard from './pages/Dashboard';
import PaymentSuccess from './pages/PaymentSuccess';
import ScriptGenerator from './pages/ScriptGenerator';
import HyperfocusHtmlCss from './pages/courses/HyperfocusHtmlCss';
import ComponentChaosLab from './pages/courses/ComponentChaosLab';
import ShipFullStackThing from './pages/courses/ShipFullStackThing';
import PlaytestFeedback from './pages/PlaytestFeedback';
import Admin from './pages/Admin';
import TokensPage from './pages/TokensPage';
import ShopPage from './pages/ShopPage';
import Profile from './pages/Profile';
import Certificate from './pages/Certificate';
import NotFound from './pages/NotFound';
import Leaderboard from './pages/Leaderboard';
import Quests from './pages/Quests';
import Courses from './pages/Courses';
import CourseModule from './pages/CourseModule';
import VibeLabs from './pages/VibeLabs';
import VibeLabLevel1 from './pages/vibe-labs/Level1';
import VibeLabLevel2 from './pages/vibe-labs/Level2';
import VibeLabLevel3 from './pages/vibe-labs/Level3';
import VibeLabLevel4 from './pages/vibe-labs/Level4';
import VibeLabLevel5 from './pages/vibe-labs/Level5';
import { useAuthStore } from './context/auth';
import AdminRoute from './components/PrivateRoute';
import { HUDProvider } from './context/HUDContext';

function PrivateRoute({ children }: { children: React.ReactElement }) {
  const { user, loading } = useAuthStore();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#0a0a0a',
        color: '#a855f7',
        fontSize: '1.2rem',
        fontFamily: 'monospace'
      }}>
        ⚡ Loading BROski Zone...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  const { user } = useAuthStore();
  return (
    <AuthInitializer>
      <HUDProvider userId={user?.id}>
        <Router>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<LandingPage />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="forgot-password" element={<ForgotPassword />} />
              <Route path="pricing" element={<Pricing />} />
              <Route path="courses" element={<Courses />} />
              <Route path="courses/:slug" element={<CourseModule />} />
              <Route path="catalog" element={<CourseCatalog />} />
              <Route path="catalog/:id" element={<CourseDetail />} />
              <Route path="leaderboard" element={<Leaderboard />} />
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
              {/* ⚡ Vibe Labs — inside Layout so Nav + Footer appear on all levels */}
              <Route path="vibe-labs" element={<VibeLabs />} />
              <Route path="vibe-labs/level-1" element={<VibeLabLevel1 />} />
              <Route path="vibe-labs/level-2" element={<VibeLabLevel2 />} />
              <Route path="vibe-labs/level-3" element={<VibeLabLevel3 />} />
              <Route path="vibe-labs/level-4" element={<VibeLabLevel4 />} />
              <Route path="vibe-labs/level-5" element={<VibeLabLevel5 />} />
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
        </Router>
      </HUDProvider>
    </AuthInitializer>
  );
}

export default App;
