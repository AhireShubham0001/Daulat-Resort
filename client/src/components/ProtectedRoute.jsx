import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');

    // If no token exists, redirect to login page
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // Otherwise, render the component (Admin dashboard)
    return children;
};

export default ProtectedRoute;
