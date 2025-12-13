// src/pages/Profile.jsx
import React from 'react';

const Profile = () => {
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Profile</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-gray-600">Welcome, {user?.name || 'User'}!</p>
        <p className="text-gray-600">Email: {user?.email || 'No email'}</p>
      </div>
    </div>
  );
};

export default Profile;