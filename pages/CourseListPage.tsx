import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { apiGetAllCourses, apiEnrollInCourse, apiGetMyCourses } from '../services/api';
import { Course } from '../types';
import Card, { CardContent, CardHeader, CardFooter } from '../components/Card';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

interface CourseListPageProps {
  isDashboard?: boolean;
  teacherId?: string;
}

const CourseListPage: React.FC<CourseListPageProps> = ({ isDashboard = false, teacherId }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { user } = useAuth();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const allCourses = await apiGetAllCourses();
        if(user?.role === UserRole.Student){
          const myCourses = await apiGetMyCourses(user.id);
          setEnrolledCourseIds(new Set(myCourses.map(c => c.id)));
        }
        setCourses(allCourses);
      } catch (err) {
        setError('Failed to fetch courses.');
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [user]);

  const handleEnroll = async (courseId: string) => {
    if(!user) return;
    setEnrolling(courseId);
    try {
      await apiEnrollInCourse(user.id, courseId);
      setEnrolledCourseIds(prev => new Set(prev).add(courseId));
    } catch (error) {
        alert('Failed to enroll in course.');
    } finally {
        setEnrolling(null);
    }
  };

  const displayedCourses = useMemo(() => {
    let filtered = courses;

    if (teacherId) {
      filtered = filtered.filter(course => course.teacherId === teacherId);
    }
    
    if (searchQuery) {
        const lowercasedQuery = searchQuery.toLowerCase();
        filtered = filtered.filter(course => 
            course.title.toLowerCase().includes(lowercasedQuery) ||
            course.description.toLowerCase().includes(lowercasedQuery)
        );
    }

    return filtered;
  }, [courses, teacherId, searchQuery]);

  if (loading) return <Spinner />;
  if (error) return <p className="text-red-500 text-center">{error}</p>;

  return (
    <div>
      {!isDashboard && 
        <>
            <h1 className="text-3xl font-bold mb-6 dark:text-white">All Courses</h1>
            <div className="mb-8">
                <input
                    type="text"
                    placeholder="Search by course title or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400 transition"
                />
            </div>
        </>
      }
      {displayedCourses.length === 0 && teacherId && !searchQuery &&
        <div className="text-center py-10">
            <p className="text-slate-500 dark:text-slate-400">You haven't created any courses yet.</p>
            <Button as={Link} to="/create-course" className="mt-4">Create Your First Course</Button>
        </div>
      }
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {displayedCourses.map(course => (
          <Card key={course.id}>
            <CardHeader>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{course.title}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Taught by {course.teacherName}</p>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 dark:text-slate-300">{course.description}</p>
            </CardContent>
            <CardFooter className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{course.duration}</span>
              {user?.role === UserRole.Student && (
                enrolledCourseIds.has(course.id) ? (
                  <Button as={Link} to={`/courses/${course.id}`} variant="secondary">View Course</Button>
                ) : (
                  <Button onClick={() => handleEnroll(course.id)} isLoading={enrolling === course.id}>Enroll</Button>
                )
              )}
               {user?.role === UserRole.Teacher && user.id === course.teacherId && (
                  <Button as={Link} to={`/courses/${course.id}`} variant="secondary">Manage Course</Button>
               )}
            </CardFooter>
          </Card>
        ))}
      </div>
      {displayedCourses.length === 0 && searchQuery && (
         <div className="text-center py-10">
            <p className="text-slate-500 dark:text-slate-400">No courses found matching your search criteria.</p>
        </div>
      )}
    </div>
  );
};

export default CourseListPage;