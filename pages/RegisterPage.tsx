import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { UserRole } from '../types';
import { ROLES } from '../constants';
import Card, { CardHeader, CardContent, CardFooter } from '../components/Card';
import Button from '../components/Button';

const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.Student);
  const { register, isLoading } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      addToast('Please fill in all fields.', 'error');
      return;
    }
    try {
      await register(name, email, password, role);
      addToast('Registration successful!', 'success');
      navigate('/');
    } catch (error) {
      addToast('Failed to register. Email may already be in use.', 'error');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Create an Account</h1>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
              <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
              <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
              <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">I am a...</label>
              <div className="mt-2 flex space-x-4">
                {ROLES.map((r) => (
                  <label key={r} className="inline-flex items-center">
                    <input type="radio" className="form-radio text-indigo-600" name="role" value={r} checked={role === r} onChange={() => setRole(r)} />
                    <span className="ml-2 text-slate-700 dark:text-slate-300">{r}</span>
                  </label>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-center">
            <Button type="submit" isLoading={isLoading} className="w-full">
              Sign Up
            </Button>
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                Sign In
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default RegisterPage;
