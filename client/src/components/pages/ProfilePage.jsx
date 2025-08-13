import { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaCalendar } from 'react-icons/fa';
import toast from 'react-hot-toast';

function ProfilePage() {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Get user data from localStorage
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
        setIsLoading(false);
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-lg text-gray-600">Loading profile...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">Your Profile</h1>
                <p className="text-gray-600">Manage your personal information</p>
            </div>

            {/* Profile Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-6 mb-6">
                    <div className="h-24 w-24 rounded-full bg-blue-600 flex items-center justify-center">
                        <span className="text-white text-3xl font-medium">
                            {user?.name?.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{user?.name}</h2>
                        <p className="text-gray-500">Member since {new Date(user?.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>

                {/* Profile Information */}
                <div className="space-y-4">
                    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                        <FaUser className="text-blue-500 text-xl" />
                        <div>
                            <p className="text-sm text-gray-500">Full Name</p>
                            <p className="text-gray-900 font-medium">{user?.name}</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                        <FaEnvelope className="text-blue-500 text-xl" />
                        <div>
                            <p className="text-sm text-gray-500">Email Address</p>
                            <p className="text-gray-900 font-medium">{user?.email}</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                        <FaCalendar className="text-blue-500 text-xl" />
                        <div>
                            <p className="text-sm text-gray-500">Join Date</p>
                            <p className="text-gray-900 font-medium">
                                {new Date(user?.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                    <button
                        onClick={() => toast.error('Feature coming soon!')}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center gap-2 shadow-md"
                    >
                        Edit Profile
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;