
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiCreateCourse } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Card, { CardContent, CardHeader } from '../components/Card';
import Button from '../components/Button';

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
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <h1 className="text-3xl font-bold dark:text-white">Create a New Course</h1>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <p className="text-red-500">{error}</p>}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Title</label>
              <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required 
               className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:placeholder-slate-400 dark:text-white"
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Description</label>
              <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required rows={4}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:placeholder-slate-400 dark:text-white"
              ></textarea>
            </div>
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Duration (e.g., 8 Weeks)</label>
              <input type="text" id="duration" value={duration} onChange={(e) => setDuration(e.target.value)} required 
               className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:placeholder-slate-400 dark:text-white"
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" isLoading={isLoading}>
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
