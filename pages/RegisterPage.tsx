import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
// Fix: Corrected import for react-router-dom components.
import { useNavigate, Link } from 'react-router-dom';
import { UserRole } from '../types';
import { ROLES } from '../constants';
import Card, { CardContent, CardHeader } from '../components/Card';
import Button from '../components/Button';

const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.Student);
  const [error, setError] = useState('');
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    try {
      await register(name, email, password, role);
      navigate('/');
    } catch (err) {
      setError('Failed to register. This email might already be in use.');
    }
  };

  return (
    <div className="relative flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem] dark:bg-slate-900 dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)]"></div>
      <div className="max-w-md w-full space-y-8">
      <Card>
          <CardHeader>
            <h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white">
              Create your EduHub account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-slate-400">
                Join our community of learners and educators
            </p>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              <div className="space-y-4">
                <input
                  name="name" type="text" required
                  className="appearance-none rounded-lg relative block w-full px-3 py-2.5 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:placeholder-slate-400 dark:text-white"
                  placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)}
                />
                <input
                  name="email" type="email" autoComplete="email" required
                  className="appearance-none rounded-lg relative block w-full px-3 py-2.5 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:placeholder-slate-400 dark:text-white"
                  placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)}
                />
                <input
                  name="password" type="password" autoComplete="new-password" required
                  className="appearance-none rounded-lg relative block w-full px-3 py-2.5 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:placeholder-slate-400 dark:text-white"
                  placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
                />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="appearance-none rounded-lg relative block w-full px-3 py-2.5 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:placeholder-slate-400 dark:text-white"
                >
                  {ROLES.map(r => <option key={r} value={r}>I am a {r}</option>)}
                </select>
              </div>
              <div>
                <Button type="submit" isLoading={isLoading} className="w-full" size="lg">
                  Sign up
                </Button>
              </div>
            </form>
            <p className="mt-6 text-center text-sm text-gray-600 dark:text-slate-400">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                    Sign in
                </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;