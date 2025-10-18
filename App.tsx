
import React from 'react';
// Fix: Replaced BrowserRouter with HashRouter for environment compatibility.
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Header from './components/Header';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import CourseListPage from './pages/CourseListPage';
import CourseDetailPage from './pages/CourseDetailPage';
import AssignmentPage from './pages/AssignmentPage';
import CreateCoursePage from './pages/CreateCoursePage';
import MyCoursesPage from './pages/MyCoursesPage';
import LandingPage from './pages/LandingPage';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <Router>
            <Main />
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

const Main: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <>
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <Routes>
          <Route path="/" element={user ? <DashboardPage /> : <LandingPage />} />
          <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
          <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/" />} />
          <Route path="/courses" element={user ? <CourseListPage /> : <Navigate to="/login" />} />
          <Route path="/my-courses" element={user ? <MyCoursesPage /> : <Navigate to="/login" />} />
          <Route path="/courses/:courseId" element={user ? <CourseDetailPage /> : <Navigate to="/login" />} />
          <Route path="/courses/:courseId/assignments/:assignmentId" element={user ? <AssignmentPage /> : <Navigate to="/login" />} />
          <Route path="/create-course" element={user ? <CreateCoursePage /> : <Navigate to="/login" />} />
        </Routes>
      </main>
    </>
  );
}

export default App;