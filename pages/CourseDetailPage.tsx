import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Course, Module, Lesson, LessonType, UserRole } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { apiGetCourseById, apiGetCourseModules, apiCreateModule, apiCreateLesson } from '../services/api';
import Spinner from '../components/Spinner';
import Card, { CardHeader, CardContent } from '../components/Card';
import Button from '../components/Button';
import { TextIcon, VideoIcon, AssignmentIcon, PlusIcon, ChevronDownIcon } from '../components/Icons';

const LessonIcon = ({ type }: { type: LessonType }) => {
    switch(type) {
        case LessonType.Text: return <TextIcon className="w-5 h-5 text-slate-500" />;
        case LessonType.Video: return <VideoIcon className="w-5 h-5 text-slate-500" />;
        case LessonType.Assignment: return <AssignmentIcon className="w-5 h-5 text-slate-500" />;
        default: return null;
    }
}

const CourseDetailPage: React.FC = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const { user } = useAuth();
    const [course, setCourse] = useState<Course | null>(null);
    const [modules, setModules] = useState<Module[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [openModule, setOpenModule] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        if (!courseId) return;
        try {
            setIsLoading(true);
            const courseData = await apiGetCourseById(courseId);
            const modulesData = await apiGetCourseModules(courseId);
            setCourse(courseData);
            setModules(modulesData);
        } catch (error) {
            console.error("Failed to fetch course details", error);
        } finally {
            setIsLoading(false);
        }
    }, [courseId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Dummy add functions for teacher UI
    const handleAddModule = async () => {
        if (!courseId) return;
        const title = prompt("Enter new module title:");
        if (title) {
            await apiCreateModule(courseId, title);
            fetchData(); // Refresh data
        }
    };
    
    const handleAddLesson = async (moduleId: string) => {
        if (!courseId) return;
        const title = prompt("Enter new lesson title:");
        if (title) {
            // For simplicity, we'll default to text. A real implementation would have a form.
            await apiCreateLesson(moduleId, { title, type: LessonType.Text, content: "New lesson content."});
            fetchData();
        }
    };
    

    if (isLoading) return <Spinner />;
    if (!course) return <p>Course not found.</p>;
    
    const isTeacher = user?.role === UserRole.Teacher && user.id === course.teacherId;

    return (
        <div className="space-y-8">
            <header className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">{course.title}</h1>
                <p className="mt-2 text-lg text-slate-600 dark:text-slate-300">{course.description}</p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Taught by {course.teacherName}</p>
            </header>

            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Course Content</h2>
                {isTeacher && <Button onClick={handleAddModule} size="sm"><PlusIcon className="w-4 h-4 mr-2" />Add Module</Button>}
            </div>

            <div className="space-y-4">
                {modules.map(module => (
                    <Card key={module.id}>
                        <CardHeader onClick={() => setOpenModule(openModule === module.id ? null : module.id)} className="cursor-pointer flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                            <h3 className="text-xl font-semibold text-slate-800 dark:text-white">{module.title}</h3>
                            <ChevronDownIcon className={`w-6 h-6 transform transition-transform ${openModule === module.id ? 'rotate-180' : ''}`} />
                        </CardHeader>
                        {openModule === module.id && (
                            <CardContent>
                                <ul className="space-y-3">
                                    {module.lessons.map(lesson => (
                                        <li key={lesson.id}>
                                            <Link to={lesson.type === LessonType.Assignment ? `/courses/${courseId}/assignments/${lesson.content}` : '#'} className="flex items-center p-3 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                                                <LessonIcon type={lesson.type} />
                                                <span className="ml-3 text-slate-700 dark:text-slate-200">{lesson.title}</span>
                                            </Link>
                                        </li>
                                    ))}
                                    {module.lessons.length === 0 && <p className="text-slate-500 px-3">No lessons in this module yet.</p>}
                                </ul>
                                {isTeacher && <Button onClick={() => handleAddLesson(module.id)} size="sm" variant="secondary" className="mt-4 ml-3"><PlusIcon className="w-4 h-4 mr-2" />Add Lesson</Button>}
                            </CardContent>
                        )}
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default CourseDetailPage;