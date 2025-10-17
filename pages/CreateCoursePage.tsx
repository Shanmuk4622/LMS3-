
import React, { useState } from 'react';
// Fix: Corrected import for react-router-dom components.
import { useNavigate } from 'react-router-dom';
import { apiCreateCourse } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Card, { CardContent, CardHeader } from '../components/Card';
import Button from '../components/Button';
import { BookOpenIcon } from '../components/Icons';

const CreateCoursePage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || user.role !== 'Teacher') {
      setError('You are not authorized to create a course.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      await apiCreateCourse({ title, description, duration, teacherId: user.id });
      navigate('/');
    } catch (err) {
      setError('Failed to create course. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 dark:bg-slate-700">
                <BookOpenIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-300" />
            </div>
          <h1 className="mt-4 text-3xl font-bold dark:text-white">Create a New Course</h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">Fill in the details below to launch your new course.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <p className="text-red-500 text-center">{error}</p>}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Title</label>
              <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required 
               className="mt-1 block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:placeholder-slate-400 dark:text-white"
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Description</label>
              <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required rows={4}
                className="mt-1 block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:placeholder-slate-400 dark:text-white"
              ></textarea>
            </div>
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Duration (e.g., 8 Weeks)</label>
              <input type="text" id="duration" value={duration} onChange={(e) => setDuration(e.target.value)} required 
               className="mt-1 block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:placeholder-slate-400 dark:text-white"
              />
            </div>
            <div className="flex justify-end pt-2">
              <Button type="submit" isLoading={isLoading} size="lg">
                Create Course
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateCoursePage;