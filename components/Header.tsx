
import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { UserRole } from '../types';

const SunIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const MoonIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>;

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const activeLinkClass = "bg-indigo-700 text-white";
  const inactiveLinkClass = "text-indigo-100 hover:bg-indigo-700 hover:text-white";
  const linkClasses = `px-3 py-2 rounded-md text-sm font-medium transition-colors`;

  return (
    <header className="bg-indigo-600 shadow-md">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-white font-bold text-xl">
              Jupiter LMS
            </Link>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {user && <NavLink to="/" className={({isActive}) => `${linkClasses} ${isActive ? activeLinkClass : inactiveLinkClass}`}>Dashboard</NavLink>}
                {user && <NavLink to="/courses" className={({isActive}) => `${linkClasses} ${isActive ? activeLinkClass : inactiveLinkClass}`}>All Courses</NavLink>}
                {user && user.role === UserRole.Student && <NavLink to="/my-courses" className={({isActive}) => `${linkClasses} ${isActive ? activeLinkClass : inactiveLinkClass}`}>My Courses</NavLink>}
                {user && user.role === UserRole.Teacher && <NavLink to="/create-course" className={({isActive}) => `${linkClasses} ${isActive ? activeLinkClass : inactiveLinkClass}`}>Create Course</NavLink>}
              </div>
            </div>
          </div>
          <div className="flex items-center">
             <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-indigo-200 hover:text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-600 focus:ring-white transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <MoonIcon /> : <SunIcon />}
            </button>

            {user ? (
              <>
                <span className="text-indigo-100 ml-4 mr-4">Welcome, {user.name}! ({user.role})</span>
                <button onClick={handleLogout} className="bg-white text-indigo-600 hover:bg-indigo-50 font-bold py-2 px-4 rounded transition-colors text-sm">
                  Logout
                </button>
              </>
            ) : (
              <div className="ml-4 space-x-4">
                <Link to="/login" className="text-indigo-100 hover:text-white">Login</Link>
                <Link to="/register" className="bg-white text-indigo-600 hover:bg-indigo-50 font-bold py-2 px-4 rounded transition-colors text-sm">Register</Link>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
