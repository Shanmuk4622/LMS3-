import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import MyCoursesPage from './MyCoursesPage';
import CourseListPage from './CourseListPage';
import Card, { CardContent } from '../components/Card';
import Button from '../components/Button';
import { Link } from 'react-router-dom';
import { apiCheckAndCreateDeadlineReminders } from '../services/api';
import { useNotification } from '../contexts/NotificationContext';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return null; // Or a redirect, but the router handles this
  }

  return (
    <div className="space-y-8">
      <div className="relative p-8 bg-indigo-600 rounded-xl shadow-lg overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100/20 [mask-image:linear-gradient(to_bottom_right,white,transparent,transparent)]"></div>
        <div className="relative">
            <h1 className="text-4xl font-extrabold text-white">Welcome back, {user.name}!</h1>
            <p className="mt-2 text-lg text-indigo-200">Here's your dashboard overview.</p>
        </div>
      </div>

      {user.role === UserRole.Student ? (
        <StudentDashboard />
      ) : (
        <TeacherDashboard />
      )}
    </div>
  );
};

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { fetchNotifications } = useNotification();

  useEffect(() => {
    const checkDeadlines = async () => {
      if(user) {
        await apiCheckAndCreateDeadlineReminders(user.id);
        fetchNotifications(); // Refresh notifications after checking
      }
    };
    checkDeadlines();
  }, [user, fetchNotifications]);
  
  return (
    <div>
      <MyCoursesPage isDashboard={true} />
    </div>
  );
};

const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  return (
    <div>
      <Card>
        <CardContent className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Courses</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your existing courses or create a new one.</p>
            </div>
            <Button as={Link} to="/create-course" className="flex-shrink-0">Create New Course</Button>
        </CardContent>
      </Card>
      <div className="mt-8">
         <CourseListPage isDashboard={true} teacherId={user?.id} />
      </div>
    </div>
  );
};

export default DashboardPage;