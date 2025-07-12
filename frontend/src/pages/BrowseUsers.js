import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const BrowseUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [availableSkills, setAvailableSkills] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, selectedSkill]);

  const fetchUsers = async () => {
    try {
      console.log('BrowseUsers: Starting to fetch users...');
      console.log('BrowseUsers: Auth token:', localStorage.getItem('authToken'));
      setLoading(true);
      const response = await api.getAllUsers();
      console.log('BrowseUsers: API response received:', response);
      const allUsers = response.data;
      console.log('BrowseUsers: Users data:', allUsers);
      setUsers(allUsers);
      
      // Extract unique skills for filter dropdown
      const skillsSet = new Set();
      allUsers.forEach(user => {
        user.skillsOffered?.forEach(skill => skillsSet.add(skill));
        user.skillsWanted?.forEach(skill => skillsSet.add(skill));
      });
      setAvailableSkills(Array.from(skillsSet));
      
    } catch (error) {
      console.error('BrowseUsers: Error fetching users:', error);
      console.error('BrowseUsers: Error details:', error.response?.data);
      console.error('BrowseUsers: Error status:', error.response?.status);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;
    console.log('BrowseUsers: Filtering users, total users:', users.length);

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.skillsOffered?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
        user.skillsWanted?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedSkill) {
      filtered = filtered.filter(user =>
        user.skillsOffered?.includes(selectedSkill) ||
        user.skillsWanted?.includes(selectedSkill)
      );
    }

    console.log('BrowseUsers: Filtered users count:', filtered.length);
    setFilteredUsers(filtered);
  };

  const handleCreateSwapRequest = (targetUser) => {
    console.log('BrowseUsers: Request skill swap clicked for user:', targetUser.name);
    console.log('BrowseUsers: Navigating to /swap-requests/create with state:', { targetUser });
    navigate('/swap-requests/create', { state: { targetUser } });
  };

  const getAverageRating = (feedback) => {
    if (!feedback || feedback.length === 0) return 0;
    const sum = feedback.reduce((acc, f) => acc + f.rating, 0);
    return (sum / feedback.length).toFixed(1);
  };

  if (loading) {
    console.log('BrowseUsers: Component is in loading state');
    return <LoadingSpinner />;
  }

  console.log('BrowseUsers: Rendering with users:', users.length, 'filtered:', filteredUsers.length);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Browse Users</h1>
        <p className="text-gray-600 mt-2">Find users with skills you need or who want skills you offer</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search by name or skill
            </label>
            <input
              type="text"
              id="search"
              placeholder="Type to search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="skill-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Filter by skill
            </label>
            <select
              id="skill-filter"
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All skills</option>
              {availableSkills.map((skill) => (
                <option key={skill} value={skill}>{skill}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mb-4 flex justify-between items-center">
        <p className="text-gray-600">
          {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Users Grid */}
      {filteredUsers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <div key={user._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                {/* User Info */}
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(getAverageRating(user.feedback))
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="ml-2 text-sm text-gray-600">
                      {getAverageRating(user.feedback)} ({user.feedback?.length || 0} reviews)
                    </span>
                  </div>
                </div>

                {/* Skills Offered */}
                {user.skillsOffered && user.skillsOffered.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Skills Offered:</h4>
                    <div className="flex flex-wrap gap-2">
                      {user.skillsOffered.map((skill, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills Wanted */}
                {user.skillsWanted && user.skillsWanted.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Skills Wanted:</h4>
                    <div className="flex flex-wrap gap-2">
                      {user.skillsWanted.map((skill, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Location */}
                {user.location && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">
                      <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {user.location}
                    </p>
                  </div>
                )}

                {/* Action Button */}
                <button
                  onClick={() => handleCreateSwapRequest(user)}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
                >
                  Request Skill Swap
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <svg className="w-24 h-24 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
};

export default BrowseUsers;
