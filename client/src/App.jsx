import { BrowserRouter, Routes, Route, useLocation, Outlet } from 'react-router-dom';
import { useLayoutEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Rooms from './pages/Rooms';
import Booking from './pages/Booking';
import Login from './pages/Login';
import Admin from './pages/Admin';
import Gallery from './pages/Gallery';
import ProtectedRoute from './components/ProtectedRoute';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

const PublicLayout = () => (
  <>
    <Navbar />
    <Outlet />
  </>
);

const Placeholder = ({ title }) => (
  <div className="flex items-center justify-center h-screen pt-20 bg-resort-cream">
    <div className="text-center">
      <h1 className="text-6xl text-resort-gold font-serif font-bold mb-4">{title}</h1>
      <p className="text-xl text-gray-500">Experience coming soon.</p>
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="bg-resort-cream min-h-screen text-resort-dark font-sans selection:bg-resort-gold selection:text-white">
        <Routes>
          {/* Public Routes with Navbar */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/rooms" element={<Rooms />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/facilities" element={<Placeholder title="Facilities" />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/contact" element={<Placeholder title="Contact" />} />
          </Route>

          {/* Admin / Auth Routes without Public Navbar */}
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
