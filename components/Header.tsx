
import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const activeLinkClass = "bg-slate-700 text-white";
  const inactiveLinkClass = "text-slate-300 hover:bg-slate-700 hover:text-white";
  const linkClasses = `px-3 py-2 rounded-md text-sm font-medium transition-colors`;

  return (
    <header className="bg-slate-800 shadow-md">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-white font-bold text-xl">
              Gemini LMS
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
            {user ? (
              <>
                <span className="text-slate-300 mr-4">Welcome, {user.name}! ({user.role})</span>
                <button onClick={handleLogout} className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded transition-colors">
                  Logout
                </button>
              </>
            ) : (
              <div className="space-x-4">
                <Link to="/login" className="text-slate-300 hover:text-white">Login</Link>
                <Link to="/register" className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded transition-colors">Register</Link>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
