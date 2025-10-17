import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import MyCoursesPage from './MyCoursesPage';
import { UserRole } from '../types';
import { Link } from 'react-router-dom';
import Button from '../components/Button';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Dashboard</h1>
        {user?.role === UserRole.Teacher && (
          <Button as={Link} to="/create-course">Create New Course</Button>
        )}
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-200 mb-4">
            {user?.role === UserRole.Teacher ? "Courses You're Teaching" : "My Enrolled Courses"}
          </h2>
          <MyCoursesPage />
        </section>
        {/* We can add more dashboard widgets here later, like upcoming deadlines or recent activity */}
      </div>
    </div>
  );
};

export default DashboardPage;
