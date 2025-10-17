import React from 'react';
// Fix: Corrected import for react-router-dom components.
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import Button from './Button';
import { UserRole } from '../types';
import NotificationBell from './NotificationBell';
import { EduHubLogo, SunIcon, MoonIcon } from './Icons';


const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const navLinkClasses = "text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors";
  const activeNavLinkClasses = "text-indigo-600 dark:text-indigo-400 font-semibold";

  return (
    <header className="bg-white/80 dark:bg-slate-800/80 shadow-md sticky top-0 z-50 backdrop-blur-lg">
      <nav className="container mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-indigo-600 dark:text-indigo-400">
          <EduHubLogo className="h-8 w-8" />
          <span>EduHub LMS</span>
        </Link>
        <div className="flex items-center space-x-2 sm:space-x-4">
          {user && (
            <div className="hidden md:flex items-center space-x-6">
              <NavLink to="/" className={({ isActive }) => isActive ? activeNavLinkClasses : navLinkClasses}>Dashboard</NavLink>
              {user.role === UserRole.Student && (
                 <NavLink to="/my-courses" className={({ isActive }) => isActive ? activeNavLinkClasses : navLinkClasses}>My Courses</NavLink>
              )}
               <NavLink to="/courses" className={({ isActive }) => isActive ? activeNavLinkClasses : navLinkClasses}>All Courses</NavLink>
              {user.role === UserRole.Teacher && (
                <NavLink to="/create-course" className={({ isActive }) => isActive ? activeNavLinkClasses : navLinkClasses}>Create Course</NavLink>
              )}
            </div>
          )}

          <button onClick={toggleTheme} className="text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full p-2 transition-colors">
            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
          </button>

          {user && <NotificationBell />}
          
          {user ? (
            <div className="flex items-center space-x-4">
                <span className="text-slate-700 dark:text-slate-300 hidden sm:block">Welcome, {user.name}</span>
                <Button onClick={logout} variant="secondary" size="sm">Logout</Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
                <Button as={Link} to="/login" variant="secondary" size="sm">Sign In</Button>
                <Button as={Link} to="/register" size="sm">Sign Up</Button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;