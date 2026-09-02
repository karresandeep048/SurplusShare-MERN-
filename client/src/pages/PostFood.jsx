import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function PostFood() {
    const [formData, setFormData] = useState({
        foodName: '',
        description: '',
        quantity: 1,
        unit: 'meals',
        foodType: 'Vegetarian',
        pickupStart: '',
        pickupEnd: '',
        expiryTime: '',
        location: ''
    });
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/listings', formData);
            setSuccess(true);
            setTimeout(() => navigate('/dashboard'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Error posting food');
        }
    };

    if (success) {
        return (
            <div className="flex items-center justify-center p-8 bg-green-50 rounded-lg shadow mt-8">
                <h2 className="text-2xl font-bold text-green-700">Food posted successfully!</h2>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md mt-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Post Surplus Food</h2>

            {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Food Name</label>
                        <input type="text" name="foodName" required className="w-full p-2 border rounded" onChange={handleChange} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Food Type</label>
                        <select name="foodType" className="w-full p-2 border rounded bg-white" onChange={handleChange} value={formData.foodType}>
                            <option value="Vegetarian">Vegetarian</option>
                            <option value="Non-Vegetarian">Non-Vegetarian</option>
                            <option value="Vegan">Vegan</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea name="description" required className="w-full p-2 border rounded" rows="3" onChange={handleChange}></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Quantity</label>
                        <input type="number" name="quantity" required min="1" className="w-full p-2 border rounded" value={formData.quantity} onChange={handleChange} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Unit (e.g., meals, kg, items)</label>
                        <input type="text" name="unit" required className="w-full p-2 border rounded" value={formData.unit} onChange={handleChange} />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Pickup Location Address</label>
                    <input type="text" name="location" required className="w-full p-2 border rounded" onChange={handleChange} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Pickup Start Time</label>
                        <input type="datetime-local" name="pickupStart" required className="w-full p-2 border rounded" onChange={handleChange} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Pickup End Time</label>
                        <input type="datetime-local" name="pickupEnd" required className="w-full p-2 border rounded" onChange={handleChange} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Expiry Time</label>
                        <input type="datetime-local" name="expiryTime" required className="w-full p-2 border rounded" onChange={handleChange} />
                    </div>
                </div>

                <button type="submit" className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition font-bold mt-6 text-lg">
                    + Post Surplus Food
                </button>
            </form>
        </div>
    );
}

export default PostFood;
