import React from 'react';
// Fix: Corrected import for react-router-dom components.
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import Card, { CardContent } from '../components/Card';
import { BookOpenIcon, CheckBadgeIcon, PencilAltIcon, UsersIcon } from '../components/Icons';


const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string; }> = ({ icon, title, description }) => (
    <Card className="text-center h-full">
        <CardContent className="flex flex-col items-center p-8">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-indigo-100 dark:bg-slate-700 text-indigo-600 dark:text-indigo-300">
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
      <div className="relative text-center pt-16 pb-20 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50rem] h-[50rem] bg-indigo-600/10 dark:bg-indigo-500/10 rounded-full blur-3xl" />
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white sm:text-5xl md:text-7xl tracking-tight">
          Welcome to <span className="bg-gradient-to-r from-indigo-600 to-teal-500 bg-clip-text text-transparent">EduHub LMS</span>
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
                icon={<BookOpenIcon className="h-8 w-8" />} 
                title="Course Management" 
                description="Easily create, organize, and manage your courses with our intuitive tools for teachers."
            />
            <FeatureCard 
                icon={<PencilAltIcon className="h-8 w-8" />} 
                title="Assignments & Submissions" 
                description="Streamline the assignment process from creation and distribution to submission and tracking."
            />
            <FeatureCard 
                icon={<CheckBadgeIcon className="h-8 w-8" />} 
                title="Advanced Grading" 
                description="Provide timely and constructive feedback with a flexible and easy-to-use grading system."
            />
             <FeatureCard 
                icon={<UsersIcon className="h-8 w-8" />} 
                title="Role-Based Dashboards" 
                description="Customized dashboards for students and teachers provide relevant information at a glance."
            />
        </div>
      </div>
    </div>
  );
};

export default LandingPage;