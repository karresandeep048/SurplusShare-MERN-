import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppLayout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import PostFood from './pages/PostFood';
import MyListings from './pages/MyListings';
import FindFood from './pages/FindFood';
import FoodDetails from './pages/FoodDetails';
import MyReservations from './pages/MyReservations';
import OrderTracker from './pages/OrderTracker';
import Profile from './pages/Profile';

function App() {
  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/post-food" element={<PostFood />} />
          <Route path="/my-listings" element={<MyListings />} />
          <Route path="/find-food" element={<FindFood />} />
          <Route path="/listing/:id" element={<FoodDetails />} />
          <Route path="/my-reservations" element={<MyReservations />} />
          <Route path="/track-order/:code" element={<OrderTracker />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </AppLayout>
    </Router>
  );
}

export default App;
