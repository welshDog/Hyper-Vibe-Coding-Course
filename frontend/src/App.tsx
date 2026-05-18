import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import LandingPage from './pages/LandingPage';
import Welcome from './pages/Welcome';
import { Login, Register } from './pages/Auth';
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
import PetsPage from './pages/Pets';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import VibeLabsIndex from './pages/vibe-labs/VibeLabsIndex';
import Level1Claude from './pages/vibe-labs/Level1Claude';
import Level2AiStudio from './pages/vibe-labs/Level2AiStudio';
import Level3Trae from './pages/vibe-labs/Level3Trae';
import Level4Compare from './pages/vibe-labs/Level4Compare';
import Level5FullStack from './pages/vibe-labs/Level5FullStack';
import { useAuthStore } from './context/auth';
import AdminRoute from './components/PrivateRoute';
import { HUDProvider } from './context/HUDContext';

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
            <Route path="pets" element={<PetsPage />} />
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
      </Router>
    </HUDProvider>
  );
}

export default App;
