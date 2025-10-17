import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import Card, { CardContent } from '../components/Card';

const BookOpenIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;
const PencilAltIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
const CheckBadgeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8"><path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12c0 1.357-.6 2.573-1.549 3.397a4.49 4.49 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.491 4.491 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" /></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197m0 0A5.965 5.965 0 0112 13a5.965 5.965 0 014.5 2.803" /></svg>;

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string; }> = ({ icon, title, description }) => (
    <Card className="text-center h-full">
        <CardContent className="flex flex-col items-center p-8">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 dark:bg-slate-700 text-indigo-600 dark:text-indigo-300">
                {icon}
            </div>
            <h3 className="mt-6 text-xl font-bold text-slate-900 dark:text-white">{title}</h3>
            <p className="mt-2 text-base text-slate-500 dark:text-slate-400 flex-grow">{description}</p>
        </CardContent>
    </Card>
);

const LandingPage: React.FC = () => {
  return (
    <div className="space-y-24">
      {/* Hero Section */}
      <div className="text-center pt-8 pb-12">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white sm:text-5xl md:text-6xl tracking-tight">
          Welcome to <span className="text-indigo-600">Jupiter LMS</span>
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-xl text-slate-600 dark:text-slate-400">
          A modern, intuitive, and powerful Learning Management System designed to empower educators and inspire students.
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <Button as={Link} to="/register" size="lg">Get Started Free</Button>
          <Button as={Link} to="/login" variant="secondary" size="lg">Sign In</Button>
        </div>
      </div>

      {/* Features Section */}
      <div>
        <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">Everything you need to succeed</h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-500 dark:text-slate-400">All the tools for a seamless educational experience, right at your fingertips.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
                icon={<BookOpenIcon />} 
                title="Course Management" 
                description="Easily create, organize, and manage your courses with our intuitive tools for teachers."
            />
            <FeatureCard 
                icon={<PencilAltIcon />} 
                title="Assignments & Submissions" 
                description="Streamline the assignment process from creation and distribution to submission and tracking."
            />
            <FeatureCard 
                icon={<CheckBadgeIcon />} 
                title="Advanced Grading" 
                description="Provide timely and constructive feedback with a flexible and easy-to-use grading system."
            />
             <FeatureCard 
                icon={<UsersIcon />} 
                title="Role-Based Dashboards" 
                description="Customized dashboards for students and teachers provide relevant information at a glance."
            />
        </div>
      </div>
    </div>
  );
};

export default LandingPage;