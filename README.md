<div align="center">
  <h1>EduHub LMS</h1>
  <p>A modern, feature-rich Learning Management System (LMS) built with React, TypeScript, and Firebase.</p>
  <p>
    <a href="#-features">Features</a> •
    <a href="#-tech-stack">Tech Stack</a> •
    <a href="#-getting-started">Getting Started</a> •
    <a href="#-screenshots">Screenshots</a> •
    <a href="#-deployment">Deployment</a>
  </p>
</div>

---

EduHub LMS is a comprehensive platform designed to streamline the online learning experience for both students and educators. It features a clean, responsive interface built with Tailwind CSS, role-based access control, and a full suite of tools for course management, assignment submission, and grading.

## ✨ Features

-   **🔐 User Authentication & Roles:** Secure registration and login for **Students** and **Teachers**.
-   **🎨 Role-Based UI:** The application provides a tailored experience based on the user's role. Teachers get course creation and management tools, while students focus on learning and submissions.
-   **📚 Course Creation & Management:** Teachers can create, update, and manage courses, including modules and lessons (text, video, and assignments).
-   ** catalogue Course Catalog & Enrollment:** Students can browse a filterable list of all available courses and enroll with a single click.
-   **🖥️ Personalized Dashboard:** Users see a dashboard summarizing their relevant courses.
-   **📈 Progress Tracking:** Students can track their lesson completion progress for each course.
-   **✍️ Assignment & Submission System:** Teachers can create assignments, and students can submit their work directly through the platform.
-   **💯 Grading System:** Teachers can view all student submissions, provide grades (0-100) and feedback. Students can view their grades and feedback in real-time.
-   **🔔 Real-time Notifications:** Users receive notifications for important events like new submissions (for teachers) or graded assignments (for students).
-   **☀️ Dark Mode:** A beautiful, persistent dark mode for comfortable viewing in low-light conditions.

## 🛠️ Tech Stack

-   **Frontend:** [React.js](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/)
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
-   **Routing:** [React Router](https://reactrouter.com/)
-   **Backend & Database:** [Firebase](https://firebase.google.com/) (Firestore, Authentication)
-   **State Management:** React Context API
-   **Date Formatting:** [date-fns](https://date-fns.org/)

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or later recommended)
-   `npm` or `yarn` package manager

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/eduhub-lms.git
    cd eduhub-lms
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Set up Firebase:**
    -   Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
    -   In your project dashboard, click the **Web** icon (`</>`) to add a new web app.
    -   Give your app a nickname and click **"Register app"**.
    -   Firebase will provide you with a `firebaseConfig` object. Copy this object.
    -   In the project, navigate to `src/services/firebase.ts`.
    -   Replace the existing `firebaseConfig` object with the one you copied from your Firebase project.
    -   In the Firebase console, go to the **Authentication** section, click **"Get started"**, and enable the **Email/Password** sign-in provider.
    -   Go to the **Firestore Database** section, click **"Create database"**, start in **test mode** for easy setup, and choose a location.

4.  **Run the application:**
    ```bash
    npm start
    ```
    Open your browser and navigate to the local URL provided (usually `http://localhost:5173` or another port).

## 🖼️ Screenshots

![Landing Page](image.png)

## ☁️ Deployment

This application is ready to be deployed to any static site hosting service.

-   **Recommended:** [Vercel](https://vercel.com/) or [Firebase Hosting](https://firebase.google.com/docs/hosting).
-   Build the production-ready static files using `npm run build`.
-   Deploy the contents of the generated `dist` folder to your hosting provider.

For detailed deployment instructions, refer to the `DEPLOYMENT.md` file (note: it may need to be adapted from its MERN stack focus to a static frontend deployment).