import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiGetAllCourses, apiEnrollInCourse } from '../services/api';
import { Course, UserRole } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import Card, { CardContent, CardFooter } from '../components/Card';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import { ClockIcon, UserIcon } from '../components/Icons';

const CourseListPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { addToast } = useNotification();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await apiGetAllCourses();
        setCourses(data);
      } catch (error) {
        addToast('Failed to load courses.', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, [addToast]);
  
  const handleEnroll = async (courseId: string) => {
      if (!user) return;
      try {
          await apiEnrollInCourse(user.id, courseId);
          addToast("Successfully enrolled!", 'success');
          // Maybe update UI state to show enrolled status
      } catch (error) {
          addToast("Failed to enroll in course.", 'error');
      }
  }

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-6">All Courses</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Card key={course.id}>
            <div className="relative">
              <img src={`https://picsum.photos/seed/${course.id}/300/200`} alt={`${course.title} course image`} className="w-full h-40 object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              <h2 className="absolute bottom-4 left-6 text-xl font-bold text-white">{course.title}</h2>
            </div>
            <CardContent>
              <p className="text-slate-600 dark:text-slate-400 mb-4 h-20 overflow-hidden">{course.description}</p>
              <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 space-x-4">
                <span className="flex items-center"><UserIcon className="w-4 h-4 mr-1.5" />{course.teacherName}</span>
                <span className="flex items-center"><ClockIcon className="w-4 h-4 mr-1.5" />{course.duration}</span>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center">
              <Link to={`/courses/${course.id}`} className="font-semibold text-indigo-600 dark:text-indigo-400">View Details</Link>
              {user?.role === UserRole.Student && (
                  <Button onClick={() => handleEnroll(course.id)} size="sm">Enroll</Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CourseListPage;