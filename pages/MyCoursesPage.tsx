import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiGetMyCourses, apiGetOverallCourseGrade } from '../services/api';
import { Course } from '../types';
import { useAuth } from '../contexts/AuthContext';
import Spinner from '../components/Spinner';
import Card, { CardContent, CardHeader, CardFooter } from '../components/Card';
import Button from '../components/Button';

interface CourseWithDetails extends Course {
    overallGrade: number | null;
    progress: {
        completed: number;
        total: number;
    };
}

const CourseGradeIndicator: React.FC<{ grade: number | null }> = ({ grade }) => {
    if (grade === null) {
        return <span className="text-xs font-medium text-slate-500 dark:text-slate-400">No Graded Assignments Yet</span>;
    }

    const getGradeColor = (g: number) => {
        if (g >= 90) return 'bg-emerald-500';
        if (g >= 80) return 'bg-teal-500';
        if (g >= 70) return 'bg-amber-500';
        return 'bg-red-500';
    };

    return (
        <div>
            <div className="flex justify-between mb-1">
                <span className="text-base font-medium text-slate-700 dark:text-white">Overall Grade</span>
                <span className="text-sm font-medium text-slate-700 dark:text-white">{grade}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5 dark:bg-slate-700">
                <div className={`h-2.5 rounded-full ${getGradeColor(grade)}`} style={{ width: `${grade}%` }}></div>
            </div>
        </div>
    );
};

const CourseProgressIndicator: React.FC<{ completed: number; total: number }> = ({ completed, total }) => {
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return (
        <div>
            <div className="flex justify-between mb-1">
                <span className="text-base font-medium text-slate-700 dark:text-white">Progress</span>
                <span className="text-sm font-medium text-slate-700 dark:text-white">{completed} / {total} Done</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5 dark:bg-slate-700">
                <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    );
};


const MyCoursesPage: React.FC<{ isDashboard?: boolean }> = ({ isDashboard = false }) => {
  const [courses, setCourses] = useState<CourseWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchCourses = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const myCoursesWithProgress = await apiGetMyCourses(user.id);
        
        const coursesWithDetails = await Promise.all(
            myCoursesWithProgress.map(async (course) => {
                const overallGrade = await apiGetOverallCourseGrade(course.id, user.id);
                return { ...course, overallGrade };
            })
        );

        setCourses(coursesWithDetails);
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

  return (
    <div>
      {!isDashboard && <h1 className="text-3xl font-bold mb-6 dark:text-white">My Courses</h1>}
      {isDashboard && courses.length > 0 && <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Your Enrolled Courses</h2>}

      {courses.length === 0 ? (
        <div className="text-center py-10">
            <p className="text-slate-500 dark:text-slate-400">You are not enrolled in any courses yet.</p>
            <Button as={Link} to="/courses" className="mt-4">Browse Courses</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map(course => (
            <Card key={course.id} className="flex flex-col">
              <CardHeader>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{course.title}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Taught by {course.teacherName}</p>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-slate-600 dark:text-slate-300 mb-4">{course.description}</p>
                <div className="space-y-4">
                  <CourseProgressIndicator completed={course.progress.completed} total={course.progress.total} />
                  <CourseGradeIndicator grade={course.overallGrade} />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{course.duration}</span>
                <Button as={Link} to={`/courses/${course.id}`} variant="secondary">View Course</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCoursesPage;