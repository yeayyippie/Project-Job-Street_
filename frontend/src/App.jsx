import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Import Halaman
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import EmployerDashboard from './pages/employer/Dashboard';
import EmployerProfile from './pages/employer/EmployerProfile';
import CreateJob from './pages/employer/CreateJob';
import JobDetail from './pages/JobDetail'; 
import EditJob from './pages/employer/EditJob';
import JobseekerProfile from './pages/jobseeker/Profile';
import Bookmarks from './pages/jobseeker/Bookmarks';       // <-- tambah
import MyApplications from './pages/jobseeker/MyApplications'; // <-- tambah


function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        {/* Halaman Publik */}
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />

        {/* Halaman Detail Lowongan (Publik) */}
        <Route path="jobs/:id" element={<JobDetail />} />

        {/* Halaman Khusus Jobseeker */}
        <Route path="jobseeker/profile" element={
          <ProtectedRoute allowedRoles={['jobseeker']}>
            <JobseekerProfile />
          </ProtectedRoute>
        } />
        <Route path="bookmarks" element={
          <ProtectedRoute allowedRoles={['jobseeker']}>
            <Bookmarks />
          </ProtectedRoute>
        } />
        <Route path="my-applications" element={
          <ProtectedRoute allowedRoles={['jobseeker']}>
            <MyApplications />
          </ProtectedRoute>
        } />

        {/* Halaman Khusus Employer */}
        <Route path="employer/dashboard" element={
          <ProtectedRoute allowedRoles={['employer']}>
            <EmployerDashboard />
          </ProtectedRoute>
        } />
        <Route path="/employer/profile" element={<EmployerProfile />} />

        {/* Halaman Create Job untuk Employer */}
        <Route path="employer/jobs/create" element={
          <ProtectedRoute allowedRoles={['employer']}>
            <CreateJob />
          </ProtectedRoute>
        } />

        {/* Halaman Edit Job untuk Employer */}
        <Route path="employer/jobs/edit/:id" element={
          <ProtectedRoute allowedRoles={['employer']}>
            <EditJob />
          </ProtectedRoute>
        } />
      </Route>
    </Routes>
  );
}

export default App;