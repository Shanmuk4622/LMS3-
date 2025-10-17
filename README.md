# Jupiter Learning Management System

A modern, feature-rich Learning Management System (LMS) built with the MERN stack (MongoDB, Express.js, React.js, Node.js). This project provides a platform for teachers to create courses and manage students, and for students to enroll in courses, submit assignments, and receive grades.

## Team Information

- **Team Name:** [Enter Your Team Name Here]
- **Team Members:**
  - [Member 1 Name]
  - [Member 2 Name]
  - [Member 3 Name]

## Live Demo

**URL:** [Link to your deployed application]

---

## Features Implemented

- **User Authentication & Roles:** Secure registration and login for two distinct user roles: 'Student' and 'Teacher'.
- **Role-Based Access Control:** The application provides a tailored experience based on the user's role. Teachers have administrative privileges over their courses, while students have access to enrollment and learning features.
- **Course Creation & Management:** Teachers can create new courses by providing a title, description, and duration. They can also view a list of all courses they've created.
- **Course Catalog & Enrollment:** Students can browse a comprehensive list of all available courses and enroll in them with a single click.
- **Student Dashboard:** Students have a personalized dashboard (`My Courses`) where they can view all the courses they are currently enrolled in.
- **Assignment System:**
  - **Teachers** can create assignments with titles, descriptions, and due dates for any course they manage.
  - **Students** can view assignment details and submit their work directly through the platform.
- **Grading System:**
  - **Teachers** can view all student submissions for an assignment, provide a grade (0-100), and update it if necessary.
  - **Students** can view their grades and feedback for each submitted assignment.
- **View Roster:** Teachers can view a list of all students enrolled in each of their courses.

---

## Tech Stack

- **Frontend:** React.js, Vite, Tailwind CSS, React Router
- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JSON Web Tokens (JWT)

---

## Getting Started

### Prerequisites

- Node.js (v18 or later recommended)
- `npm` or `yarn` package manager
- MongoDB (a local instance or a cloud-based service like MongoDB Atlas)

### Backend Setup

1.  Clone the repository.
2.  Navigate to the `backend` directory (assuming a `backend` folder exists).
3.  Install dependencies: `npm install`
4.  Create a `.env` file in the `backend` root and add the following environment variables:
    ```env
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_super_secret_jwt_key
    PORT=5000
    ```
5.  Start the server: `npm start`

### Frontend Setup

1.  Navigate to the `frontend` directory (or the root if it's not a monorepo).
2.  Install dependencies: `npm install`
3.  If your backend is running on a different port, create a `.env` file and add the following:
    ```env
    VITE_API_BASE_URL=http://localhost:5000/api
    ```
4.  Start the development server: `npm run dev`
5.  Open your browser and navigate to the local URL provided by Vite.