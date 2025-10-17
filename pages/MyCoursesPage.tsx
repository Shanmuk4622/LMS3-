import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiGetMyCourses } from '../services/api';
import { Course, UserRole } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import Card, { CardContent, CardFooter } from '../components/Card';
import Spinner from '../components/Spinner';
import { CheckBadgeIcon } from '../components/Icons';

const cardBorderColors = [
  'border-sky-500',
  'border-emerald-500',
  'border-amber-500',
  'border-rose-500',
];

const CourseGradeIndicator: React.FC<{ courseId: string, studentId: string }> = ({ courseId, studentId }) => {
    // In a real app, you'd fetch this. For now, we'll simulate.
    const grade = Math.floor(Math.random() * 30 + 70); // 70-100
    const gradeColor = grade > 89 ? 'text-emerald-500' : grade > 79 ? 'text-sky-500' : 'text-amber-500';
    return <span className={`font-bold text-lg ${gradeColor}`}>{grade}%</span>
}

const CourseProgressIndicator: React.FC<{ completed: number, total: number }> = ({ completed, total }) => {
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    return (
        <div className="w-full">
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                <span>Progress</span>
                <span>{completed} / {total}</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                <div
                    className="bg-sky-500 h-2.5 rounded-full"
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    )
}

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
      return (
        <div className="text-center py-16">
          <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-200">No Courses Yet</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            {user?.role === UserRole.Student 
              ? "You haven't enrolled in any courses." 
              : "You haven't created any courses."}
          </p>
        </div>
      )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course, index) => (
        <Card key={course.id} className={`flex flex-col group border-t-4 ${cardBorderColors[index % cardBorderColors.length]}`}>
           <div className="overflow-hidden relative">
            <img src={`https://picsum.photos/seed/${course.id}/300/200`} alt={`${course.title} course image`} className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105" />
          </div>
          <CardContent className="flex-grow">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{course.title}</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">Taught by {course.teacherName}</p>
             {user?.role === 'Student' && (
                <div className="space-y-4">
                    {course.progress.total > 0 ? (
                        <CourseProgressIndicator completed={course.progress.completed} total={course.progress.total} />
                    ) : <p className="text-sm text-slate-500">No assignments yet.</p>}
                </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between items-center">
            <Link to={`/courses/${course.id}`} className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
              {user?.role === 'Teacher' ? 'Manage Course' : 'Go to Course'}
            </Link>
             {user?.role === 'Student' && (
                <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500">Grade:</span>
                    <CourseGradeIndicator courseId={course.id} studentId={user.id} />
                </div>
             )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default MyCoursesPage;