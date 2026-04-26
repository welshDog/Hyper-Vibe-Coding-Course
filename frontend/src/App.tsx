import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import LandingPage from './pages/LandingPage';
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
          <Route path="/" element={<Layout />}>
            <Route index element={<LandingPage />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="pricing" element={<Pricing />} />
            <Route path="courses" element={<CourseCatalog />} />
            <Route path="courses/:id" element={<CourseDetail />} />
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
