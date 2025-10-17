import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { apiGetAllCourses, apiEnrollInCourse, apiGetMyCourses } from '../services/api';
import { Course } from '../types';
import Card, { CardContent, CardHeader, CardFooter } from '../components/Card';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import { UserIcon, ClockIcon } from '../components/Icons';

const CourseCard: React.FC<{ 
    course: Course; 
    isEnrolled: boolean; 
    onEnroll: (courseId: string) => void; 
    enrolling: string | null;
    isTeacher: boolean;
}> = ({ course, isEnrolled, onEnroll, enrolling, isTeacher }) => {
    // Simple hash function to get a color variation from the course ID
    const patternId = parseInt(course.id.replace(/[^0-9]/g, '')) % 4;
    
    const patterns = [
        "bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]", // dots
        "bg-[linear-gradient(135deg,#f3f4f6_10%,#fff_10%,#fff_50%,#f3f4f6_50%,#f3f4f6_60%,#fff_60%,#fff_100%)] [background-size:14.14px_14.14px]", // stripes
        "bg-[radial-gradient(circle_at_center,#f3f4f6_1px,transparent_1px)] [background-size:16px_16px]", // circles
        "bg-[linear-gradient(45deg,#f3f4f6_25%,transparent_25%),linear-gradient(-45deg,#f3f4f6_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f3f4f6_75%),linear-gradient(-45deg,transparent_75%,#f3f4f6_75%)] [background-size:20px_20px]" // grid
    ];

    const darkPatterns = [
        "dark:bg-[radial-gradient(#374151_1px,transparent_1px)]",
        "dark:bg-[linear-gradient(135deg,#1f2937_10%,#111827_10%,#111827_50%,#1f2937_50%,#1f2937_60%,#111827_60%,#111827_100%)]",
        "dark:bg-[radial-gradient(circle_at_center,#374151_1px,transparent_1px)]",
        "dark:bg-[linear-gradient(45deg,#1f2937_25%,transparent_25%),linear-gradient(-45deg,#1f2937_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#1f2937_75%),linear-gradient(-45deg,transparent_75%,#1f2937_75%)]"
    ];

    return (
        <Card className="flex flex-col">
            <div className={`relative h-32 ${patterns[patternId]} ${darkPatterns[patternId]}`}>
                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 dark:from-slate-800 dark:via-slate-800/80 to-transparent"></div>
            </div>
            <CardHeader className="-mt-16 bg-transparent border-none z-10">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{course.title}</h2>
            </CardHeader>
            <CardContent className="flex-grow">
                <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-4">
                    <div className="flex items-center gap-1.5">
                        <UserIcon className="h-4 w-4" />
                        <span>{course.teacherName}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <ClockIcon className="h-4 w-4" />
                        <span>{course.duration}</span>
                    </div>
                </div>
                <p className="text-slate-600 dark:text-slate-300">{course.description}</p>
            </CardContent>
            <CardFooter>
                {isTeacher ? (
                    <Button as={Link} to={`/courses/${course.id}`} variant="secondary" className="w-full">Manage Course</Button>
                ) : (
                    isEnrolled ? (
                        <Button as={Link} to={`/courses/${course.id}`} variant="secondary" className="w-full">View Course</Button>
                    ) : (
                        <Button onClick={() => onEnroll(course.id)} isLoading={enrolling === course.id} className="w-full">Enroll Now</Button>
                    )
                )}
            </CardFooter>
        </Card>
    )
}


const CourseListPage: React.FC<{ isDashboard?: boolean; teacherId?: string; }> = ({ isDashboard = false, teacherId }) => {
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
            <h1 className="text-4xl font-extrabold mb-2 dark:text-white">All Courses</h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">Explore our catalog and find your next learning adventure.</p>
            <div className="mb-8 relative">
                <input
                    type="text"
                    placeholder="Search courses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-3 pl-10 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400 transition"
                />
                 <svg className="h-5 w-5 absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
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
          <CourseCard
            key={course.id}
            course={course}
            isEnrolled={enrolledCourseIds.has(course.id)}
            onEnroll={handleEnroll}
            enrolling={enrolling}
            isTeacher={user?.role === UserRole.Teacher && user.id === course.teacherId}
           />
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