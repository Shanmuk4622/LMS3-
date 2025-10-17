import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { apiCreateCourse } from '../services/api';
import Card, { CardHeader, CardContent, CardFooter } from '../components/Card';
import Button from '../components/Button';

const CreateCoursePage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !duration || !user) {
      addToast('Please fill in all fields.', 'error');
      return;
    }
    setIsLoading(true);
    try {
      const newCourse = await apiCreateCourse({ title, description, duration, teacherId: user.id });
      addToast('Course created successfully!', 'success');
      navigate(`/courses/${newCourse.id}`);
    } catch (error) {
      addToast('Failed to create course.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Create a New Course</h1>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Course Title</label>
              <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
              <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
            </div>
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Duration (e.g., 8 Weeks)</label>
              <input type="text" id="duration" value={duration} onChange={(e) => setDuration(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" isLoading={isLoading} className="w-full">
              Create Course
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default CreateCoursePage;
