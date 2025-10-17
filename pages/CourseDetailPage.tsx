import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiGetCourseById, apiGetCourseModules, apiCreateModule, apiCreateLesson } from '../services/api';
import { Course, Module, Lesson, LessonType, UserRole } from '../types';
import { useAuth } from '../contexts/AuthContext';
import Spinner from '../components/Spinner';
import Card, { CardContent, CardHeader } from '../components/Card';
import Button from '../components/Button';
import { useNotification } from '../contexts/NotificationContext';
import { TextIcon, VideoIcon, AssignmentIcon, PlusIcon, ChevronDownIcon } from '../components/Icons';

const CourseDetailPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const fetchData = async () => {
    if (!courseId) return;
    try {
      setLoading(true);
      const courseData = await apiGetCourseById(courseId);
      const modulesData = await apiGetCourseModules(courseId);
      setCourse(courseData);
      setModules(modulesData);
      setError('');
    } catch (err) {
      setError('Failed to fetch course details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [courseId]);

  if (loading) return <Spinner />;
  if (error) return <p className="text-red-500 text-center">{error}</p>;
  if (!course) return <p className="text-center">Course not found.</p>;

  const isTeacher = user?.role === UserRole.Teacher && user.id === course.teacherId;

  return (
    <div className="space-y-8">
      <div className="relative p-8 bg-indigo-600 rounded-xl shadow-lg overflow-hidden text-white">
        <div className="absolute inset-0 bg-grid-slate-100/20 [mask-image:linear-gradient(to_bottom_right,white,transparent,transparent)]"></div>
        <div className="relative">
          <p className="font-semibold text-indigo-200">Course</p>
          <h1 className="text-4xl font-extrabold mt-1">{course.title}</h1>
          <p className="text-lg text-indigo-200 mt-2">Taught by {course.teacherName}</p>
          <p className="mt-4 text-indigo-100 max-w-3xl">{course.description}</p>
        </div>
      </div>


      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Course Content</h2>
        {modules.map(module => (
          <ModuleAccordion key={module.id} module={module} courseId={course.id} isTeacher={isTeacher} onUpdate={fetchData} />
        ))}
        {modules.length === 0 && !isTeacher && <p className="text-slate-500 dark:text-slate-400">Course content will be available soon.</p>}
      </div>
       {isTeacher && <AddModuleForm courseId={course.id} onModuleAdded={fetchData} />}
    </div>
  );
};

const ModuleAccordion: React.FC<{ module: Module, courseId: string, isTeacher: boolean, onUpdate: () => void }> = ({ module, courseId, isTeacher, onUpdate }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Card>
      <CardHeader className="cursor-pointer flex justify-between items-center" onClick={() => setIsOpen(!isOpen)}>
        <h2 className="text-2xl font-bold dark:text-white">{module.title}</h2>
        <ChevronDownIcon className={`w-6 h-6 transform transition-transform text-slate-500 ${isOpen ? 'rotate-180' : ''}`} />
      </CardHeader>
      {isOpen && (
        <CardContent>
          <ul className="space-y-3">
            {module.lessons.map(lesson => (
              <LessonItem key={lesson.id} lesson={lesson} courseId={courseId} />
            ))}
            {module.lessons.length === 0 && <p className="text-slate-500 dark:text-slate-400 p-2">No lessons in this module yet.</p>}
          </ul>
          {isTeacher && <AddLessonForm moduleId={module.id} onLessonAdded={onUpdate} />}
        </CardContent>
      )}
    </Card>
  )
}

const LessonItem: React.FC<{ lesson: Lesson, courseId: string }> = ({ lesson, courseId }) => {
    const getIcon = (type: LessonType) => {
        const iconProps = { className: "h-6 w-6 text-indigo-600 dark:text-indigo-400" };
        switch (type) {
            case LessonType.Text: return <TextIcon {...iconProps} />;
            case LessonType.Video: return <VideoIcon {...iconProps} />;
            case LessonType.Assignment: return <AssignmentIcon {...iconProps} />;
            default: return '🔗';
        }
    }
    
    const link = lesson.type === LessonType.Assignment
        ? `/courses/${courseId}/assignments/${lesson.content}`
        : `#`;

    const isClickable = lesson.type === LessonType.Assignment;

    const Wrapper = isClickable ? Link : 'div';

    return (
        <li>
            <Wrapper to={link} className={`flex items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg ${isClickable ? 'hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer' : 'cursor-default'}`}>
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center mr-4">
                    {getIcon(lesson.type)}
                </div>
                <span className="flex-grow text-lg text-slate-800 dark:text-slate-200 font-medium">{lesson.title}</span>
            </Wrapper>
        </li>
    )
}

const AddModuleForm: React.FC<{courseId: string, onModuleAdded: () => void}> = ({courseId, onModuleAdded}) => {
    const [title, setTitle] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { addToast } = useNotification();
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!title) return;
        setIsLoading(true);
        try {
            await apiCreateModule(courseId, title);
            setTitle('');
            onModuleAdded();
            addToast('Module added successfully!', 'success');
        } catch (error) {
            addToast('Failed to add module.', 'error');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Card className="mt-6">
            <CardContent>
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-4">
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="New Module Title" required className="flex-grow w-full p-2.5 border border-slate-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                    <Button type="submit" isLoading={isLoading} className="w-full sm:w-auto">Add Module</Button>
                </form>
            </CardContent>
        </Card>
    )
}

const AddLessonForm: React.FC<{moduleId: string, onLessonAdded: () => void}> = ({moduleId, onLessonAdded}) => {
    const [title, setTitle] = useState('');
    const [type, setType] = useState<LessonType>(LessonType.Text);
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { addToast } = useNotification();
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!title || !content) return;
        setIsLoading(true);
        try {
            await apiCreateLesson(moduleId, {title, type, content});
            setTitle('');
            setType(LessonType.Text);
            setContent('');
            onLessonAdded();
            addToast('Lesson added successfully!', 'success');
        } catch (error) {
            addToast('Failed to add lesson.', 'error');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
            <h4 className="text-lg font-semibold mb-3 dark:text-white">Add New Lesson</h4>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Lesson Title" required className="w-full p-2.5 border border-slate-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                <select value={type} onChange={e => setType(e.target.value as LessonType)} className="w-full p-2.5 border border-slate-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                    {Object.values(LessonType).map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
                <textarea value={content} onChange={e => setContent(e.target.value)} placeholder={type === LessonType.Assignment ? "Assignment Description" : "Lesson Content (URL for video)"} required rows={3} className="w-full p-2.5 border border-slate-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                <Button type="submit" isLoading={isLoading} size="sm"><PlusIcon className="h-4 w-4 mr-2"/> Add Lesson</Button>
            </form>
        </div>
    )
}

export default CourseDetailPage;