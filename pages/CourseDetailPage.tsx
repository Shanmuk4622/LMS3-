import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Course, Module, Lesson, LessonType, UserRole } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { apiGetCourseById, apiGetCourseModules, apiCreateModule, apiCreateLesson, apiMarkLessonAsComplete } from '../services/api';
import Spinner from '../components/Spinner';
import Card, { CardHeader, CardContent } from '../components/Card';
import Button from '../components/Button';
import { TextIcon, VideoIcon, AssignmentIcon, PlusIcon, ChevronDownIcon, CheckIcon } from '../components/Icons';

const LessonIcon = ({ type, isCompleted }: { type: LessonType, isCompleted?: boolean }) => {
    if (isCompleted) {
        return <div className="w-5 h-5 flex items-center justify-center rounded-full bg-emerald-500 text-white flex-shrink-0"><CheckIcon className="w-3.5 h-3.5" /></div>
    }
    switch(type) {
        case LessonType.Text: return <TextIcon className="w-5 h-5 text-slate-500 flex-shrink-0" />;
        case LessonType.Video: return <VideoIcon className="w-5 h-5 text-slate-500 flex-shrink-0" />;
        case LessonType.Assignment: return <AssignmentIcon className="w-5 h-5 text-slate-500 flex-shrink-0" />;
        default: return null;
    }
}

const CourseProgressBar: React.FC<{ modules: Module[] }> = ({ modules }) => {
    const { total, completed } = useMemo(() => {
        const allLessons = modules.flatMap(m => m.lessons);
        const total = allLessons.length;
        const completed = allLessons.filter(l => l.isCompleted).length;
        return { total, completed };
    }, [modules]);

    if (total === 0) return null;
    
    const percentage = (completed / total) * 100;

    return (
        <div>
            <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Course Progress</span>
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{completed} of {total} completed</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                <div
                    className="bg-indigo-600 dark:bg-indigo-500 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    );
};

const AddModuleModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (title: string) => Promise<void>;
}> = ({ isOpen, onClose, onSubmit }) => {
    const [title, setTitle] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setTitle(''); // Reset title when modal opens
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;
        setIsSubmitting(true);
        await onSubmit(title);
        setIsSubmitting(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" aria-modal="true" role="dialog">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-md m-4 animate-fade-in-up">
                <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-white">Add New Module</h3>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="module-title" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Module Title</label>
                            <input
                                type="text"
                                id="module-title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                required
                                autoFocus
                            />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                        <Button type="submit" isLoading={isSubmitting}>Create Module</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const AddLessonModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { title: string, type: LessonType, content: string }) => Promise<void>;
}> = ({ isOpen, onClose, onSubmit }) => {
    const [title, setTitle] = useState('');
    const [type, setType] = useState<LessonType>(LessonType.Text);
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setTitle('');
            setType(LessonType.Text);
            setContent('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) return;
        setIsSubmitting(true);
        await onSubmit({ title, type, content });
        setIsSubmitting(false);
        onClose();
    };

    const contentLabel = {
        [LessonType.Text]: 'Lesson Content (Markdown supported)',
        [LessonType.Video]: 'Video URL (e.g., YouTube, Vimeo)',
        [LessonType.Assignment]: 'Assignment Description',
    }[type];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" aria-modal="true" role="dialog">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-lg m-4 animate-fade-in-up">
                <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-white">Add New Lesson</h3>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="lesson-title" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Lesson Title</label>
                            <input
                                type="text"
                                id="lesson-title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                required
                                autoFocus
                            />
                        </div>
                        <div>
                            <label htmlFor="lesson-type" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Lesson Type</label>
                            <select
                                id="lesson-type"
                                value={type}
                                onChange={(e) => setType(e.target.value as LessonType)}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                            >
                                <option value={LessonType.Text}>Text</option>
                                <option value={LessonType.Video}>Video</option>
                                <option value={LessonType.Assignment}>Assignment</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="lesson-content" className="block text-sm font-medium text-slate-700 dark:text-slate-300">{contentLabel}</label>
                             <textarea
                                id="lesson-content"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                rows={6}
                                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                required
                            />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                        <Button type="submit" isLoading={isSubmitting}>Create Lesson</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const CourseDetailPage: React.FC = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const { user } = useAuth();
    const [course, setCourse] = useState<Course | null>(null);
    const [modules, setModules] = useState<Module[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [openModule, setOpenModule] = useState<string | null>(null);
    const [isAddingModule, setIsAddingModule] = useState(false);
    const [isAddingLessonForModule, setIsAddingLessonForModule] = useState<string | null>(null);


    const fetchData = useCallback(async (isInitialLoad = false) => {
        if (!courseId || !user) return;
        try {
            if (isInitialLoad) setIsLoading(true);
            const courseData = await apiGetCourseById(courseId);
            const modulesData = await apiGetCourseModules(courseId, user.id);
            setCourse(courseData);
            setModules(modulesData);
            
            if (isInitialLoad && modulesData.length > 0) {
                setOpenModule(modulesData[0].id);
            }
        } catch (error) {
            console.error("Failed to fetch course details", error);
        } finally {
            if (isInitialLoad) setIsLoading(false);
        }
    }, [courseId, user]);

    useEffect(() => {
        fetchData(true);
    }, [fetchData]);

    const handleLessonClick = async (lesson: Lesson, moduleId: string) => {
        if (!user || !courseId || lesson.type === LessonType.Assignment || lesson.isCompleted) {
            return;
        }
        try {
            // Optimistically update UI
            setModules(prevModules => prevModules.map(m => ({
                ...m,
                lessons: m.lessons.map(l => l.id === lesson.id ? { ...l, isCompleted: true } : l)
            })));
            await apiMarkLessonAsComplete(lesson.id, user.id, courseId, moduleId);
        } catch (error) {
            console.error("Failed to mark lesson as complete", error);
             // Revert on error if needed
            fetchData();
        }
    };
    
    const handleAddModule = async (title: string) => {
        if (!courseId) return;
        await apiCreateModule(courseId, title);
        fetchData(); // Refresh data
    };
    
    const handleCreateLesson = async (lessonData: { title: string, type: LessonType, content: string }) => {
        if (!courseId || !isAddingLessonForModule) return;
        await apiCreateLesson(courseId, isAddingLessonForModule, lessonData);
        fetchData();
    };
    
    const isStudent = user?.role === UserRole.Student;

    if (isLoading) return <Spinner />;
    if (!course) return <p>Course not found.</p>;
    
    const isTeacher = user?.role === UserRole.Teacher && user.id === course.teacherId;

    return (
        <>
            <div className="space-y-8">
                <header className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md space-y-4">
                    <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">{course.title}</h1>
                    <p className="text-lg text-slate-600 dark:text-slate-300">{course.description}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Taught by {course.teacherName}</p>
                    {isStudent && <CourseProgressBar modules={modules} />}
                </header>

                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Course Content</h2>
                    {isTeacher && <Button onClick={() => setIsAddingModule(true)} size="sm"><PlusIcon className="w-4 h-4 mr-2" />Add Module</Button>}
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
                                    <ul className="space-y-1">
                                        {module.lessons.map(lesson => (
                                            <li key={lesson.id}>
                                                <Link 
                                                  to={lesson.type === LessonType.Assignment ? `/courses/${courseId}/assignments/${lesson.content}` : '#'} 
                                                  onClick={() => handleLessonClick(lesson, module.id)}
                                                  className="flex items-center p-3 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group"
                                                >
                                                    <LessonIcon type={lesson.type} isCompleted={lesson.isCompleted} />
                                                    <span className={`ml-3 text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 ${lesson.isCompleted ? 'line-through text-slate-500 dark:text-slate-400' : ''}`}>
                                                        {lesson.title}
                                                    </span>
                                                </Link>
                                            </li>
                                        ))}
                                        {module.lessons.length === 0 && <p className="text-slate-500 px-3">No lessons in this module yet.</p>}
                                    </ul>
                                    {isTeacher && <Button onClick={() => setIsAddingLessonForModule(module.id)} size="sm" variant="secondary" className="mt-4 ml-3"><PlusIcon className="w-4 h-4 mr-2" />Add Lesson</Button>}
                                </CardContent>
                            )}
                        </Card>
                    ))}
                </div>
            </div>
            <AddModuleModal 
                isOpen={isAddingModule}
                onClose={() => setIsAddingModule(false)}
                onSubmit={handleAddModule}
            />
             <AddLessonModal
                isOpen={!!isAddingLessonForModule}
                onClose={() => setIsAddingLessonForModule(null)}
                onSubmit={handleCreateLesson}
            />
        </>
    );
};

export default CourseDetailPage;