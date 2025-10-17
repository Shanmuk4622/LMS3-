import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { apiGetAllCourses, apiEnrollInCourse } from '../services/api';
import { Course, UserRole } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import Card, { CardContent, CardFooter } from '../components/Card';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import { ClockIcon, UserIcon, SearchIcon } from '../components/Icons';

const cardBorderColors = [
  'border-sky-500',
  'border-emerald-500',
  'border-amber-500',
  'border-rose-500',
];

const CourseListPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
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

  const filteredCourses = useMemo(() => {
    return courses.filter(course =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [courses, searchQuery]);

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">All Courses</h1>
        <div className="relative w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-full sm:w-64 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition"
          />
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        </div>
      </div>

      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course, index) => (
            <Card key={course.id} className={`border-t-4 ${cardBorderColors[index % cardBorderColors.length]}`}>
              <div className="relative group overflow-hidden">
                <img src={`https://picsum.photos/seed/${course.id}/300/200`} alt={`${course.title} course image`} className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end p-6">
                   <h2 className="text-xl font-bold text-white drop-shadow-md">{course.title}</h2>
                </div>
              </div>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-400 mb-4 h-20 overflow-hidden text-ellipsis">{course.description}</p>
                <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 space-x-4">
                  <span className="flex items-center"><UserIcon className="w-4 h-4 mr-1.5" />{course.teacherName}</span>
                  <span className="flex items-center"><ClockIcon className="w-4 h-4 mr-1.5" />{course.duration}</span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between items-center">
                <Link to={`/courses/${course.id}`} className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">View Details</Link>
                {user?.role === UserRole.Student && (
                    <Button onClick={() => handleEnroll(course.id)} size="sm">Enroll</Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-slate-500 dark:text-slate-400">No courses found matching your search.</p>
        </div>
      )}
    </div>
  );
};

export default CourseListPage;