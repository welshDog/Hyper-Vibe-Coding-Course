import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import LandingPage from './pages/LandingPage';
import { Login, Register } from './pages/Auth';
import CourseCatalog from './pages/CourseCatalog';
import CourseDetail from './pages/CourseDetail';
import Pricing from './pages/Pricing';
import LessonPlayer from './pages/LessonPlayer';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import { useAuthStore } from './context/auth';

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
  return (
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
          <Route path="*" element={<NotFound />} />
        </Route>
        {/* Lesson Player has its own layout */}
        <Route 
          path="/learn/:courseId" 
          element={
            <PrivateRoute>
              <LessonPlayer />
            </PrivateRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
