
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import MyCoursesPage from './MyCoursesPage';
import CourseListPage from './CourseListPage';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div>
      <div className="pb-8 border-b border-slate-200 dark:border-slate-700 mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">Dashboard</h1>
        <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">Welcome back, {user?.name}. Here's what's happening.</p>
      </div>

      {user?.role === UserRole.Student ? (
        <MyCoursesPage isDashboard={true} />
      ) : (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Your Courses</h2>
          <CourseListPage isDashboard={true} teacherId={user?.id} />
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
