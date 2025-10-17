import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiGetMyCourses } from '../services/api';
import { Course } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import Card, { CardContent, CardFooter } from '../components/Card';
import Spinner from '../components/Spinner';

const MyCoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { addToast } = useNotification();

  useEffect(() => {
    if (!user) return;
    const fetchCourses = async () => {
      try {
        const data = await apiGetMyCourses(user.id);
        setCourses(data);
      } catch (error) {
        addToast('Failed to load your courses.', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, [user, addToast]);

  if (isLoading) {
    return <Spinner />;
  }

  if (courses.length === 0) {
      return <p className="text-slate-500 dark:text-slate-400">You are not enrolled in any courses yet.</p>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <Card key={course.id} className="flex flex-col group">
          <div className="overflow-hidden">
            <img src={`https://picsum.photos/seed/${course.id}/300/200`} alt={`${course.title} course image`} className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105" />
          </div>
          <CardContent className="flex-grow">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{course.title}</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">Taught by {course.teacherName}</p>
          </CardContent>
          <CardFooter className="flex justify-between items-center">
            <Link to={`/courses/${course.id}`} className="font-semibold text-indigo-600 dark:text-indigo-400">
              {user?.role === 'Teacher' ? 'Manage Course' : 'Go to Course'}
            </Link>
            {course.progress.total > 0 && user?.role === 'Student' && (
                <div className="w-1/2">
                    <p className="text-xs text-slate-500 mb-1">{course.progress.completed} / {course.progress.total} done</p>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div
                            className="bg-indigo-600 h-2 rounded-full"
                            style={{ width: `${(course.progress.completed / course.progress.total) * 100}%` }}
                        ></div>
                    </div>
                </div>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default MyCoursesPage;