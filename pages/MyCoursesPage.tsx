
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiGetMyCourses } from '../services/api';
import { Course } from '../types';
import { useAuth } from '../contexts/AuthContext';
import Card, { CardContent, CardHeader, CardFooter } from '../components/Card';
import Spinner from '../components/Spinner';
import Button from '../components/Button';

interface MyCoursesPageProps {
  isDashboard?: boolean;
}

const MyCoursesPage: React.FC<MyCoursesPageProps> = ({ isDashboard = false }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchCourses = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const myCourses = await apiGetMyCourses(user.id);
        setCourses(myCourses);
      } catch (err) {
        setError('Failed to fetch your courses.');
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [user]);

  if (loading) return <Spinner />;
  if (error) return <p className="text-red-500 text-center">{error}</p>;

  const title = isDashboard ? "My Courses" : "My Enrolled Courses";

  return (
    <div>
      <h2 className={`text-2xl font-bold text-gray-900 dark:text-white mb-4 ${isDashboard ? '' : 'text-3xl mb-6'}`}>{title}</h2>
      {courses.length === 0 ? (
         <div className="text-center py-10">
            <p className="text-slate-500 dark:text-slate-400">You are not enrolled in any courses yet.</p>
            <Button as={Link} to="/courses" className="mt-4">Explore Courses</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map(course => (
            <Card key={course.id}>
              <CardHeader>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{course.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Taught by {course.teacherName}</p>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-300">{course.description}</p>
              </CardContent>
              <CardFooter className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{course.duration}</span>
                <Button as={Link} to={`/courses/${course.id}`}>Go to Course</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCoursesPage;
