import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';

const SwapRequests = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [targetUser, setTargetUser] = useState(null);

  useEffect(() => {
    fetchSwapRequests();
    
    console.log('SwapRequests: Component mounted, location.state:', location.state);
    
    // Check if we came from browse users with a target user
    if (location.state?.targetUser) {
      console.log('SwapRequests: Target user found:', location.state.targetUser.name);
      setTargetUser(location.state.targetUser);
      setShowCreateModal(true);
    }
  }, [location.state]);

  const fetchSwapRequests = async () => {
    try {
      setLoading(true);
      const response = await api.getUserSwapRequests();
      console.log('SwapRequests: API response:', response.data);
      // The API returns { swaps: [...], pagination: {...} }
      setRequests(response.data.swaps || []);
    } catch (error) {
      console.error('Error fetching swap requests:', error);
      setRequests([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = Array.isArray(requests) ? requests.filter(request => {
    switch (activeTab) {
      case 'pending': return request.status === 'pending';
      case 'accepted': return request.status === 'accepted';
      case 'completed': return request.status === 'completed';
      case 'rejected': return request.status === 'rejected';
      case 'cancelled': return request.status === 'cancelled';
      default: return true;
    }
  }) : [];

  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      await api.updateSwapRequestStatus(requestId, newStatus);
      await fetchSwapRequests();
    } catch (error) {
      console.error('Error updating request status:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTabCount = (status) => {
    if (!Array.isArray(requests)) return 0;
    if (status === 'all') return requests.length;
    return requests.filter(req => req.status === status).length;
  };

  const hasUserProvidedFeedback = (request) => {
    if (!user || !request.feedback || !Array.isArray(request.feedback)) return false;
    return request.feedback.some(feedback => 
      feedback.from === user._id || 
      (typeof feedback.from === 'object' && feedback.from._id === user._id)
    );
  };

  const getSwapDetails = (request) => {
    if (!user || !request) return null;

    const isUserSender = request.fromUser?._id === user._id;
    const otherUser = isUserSender ? request.toUser : request.fromUser;
    const userTeaches = isUserSender ? request.offeredSkill : request.wantedSkill;
    const userLearns = isUserSender ? request.wantedSkill : request.offeredSkill;

    return {
      otherUser,
      userTeaches,
      userLearns,
      isUserSender
    };
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Swap Requests</h1>
            <p className="text-gray-600 mt-2">Manage your skill swap requests</p>
          </div>
          <button
            onClick={() => navigate('/browse-users')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Create New Request
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'all', label: 'All' },
            { key: 'pending', label: 'Pending' },
            { key: 'accepted', label: 'Accepted' },
            { key: 'completed', label: 'Completed' },
            { key: 'rejected', label: 'Rejected' },
            { key: 'cancelled', label: 'Cancelled' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label} ({getTabCount(tab.key)})
            </button>
          ))}
        </nav>
      </div>

      {/* Requests List */}
      {filteredRequests.length > 0 ? (
        <div className="space-y-6">
          {filteredRequests.map((request) => {
          const swapDetails = getSwapDetails(request);
          if (!swapDetails) return null;

          return (
            <div key={request._id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Request Info */}
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {swapDetails.otherUser?.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {swapDetails.userTeaches} ↔ {swapDetails.userLearns}
                      </h3>
                      <p className="text-sm text-gray-600">
                        With {swapDetails.otherUser?.name || 'Unknown User'}
                      </p>
                    </div>
                  </div>

                  {/* Skills Exchange */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-medium text-green-800 mb-2">You'll Teach</h4>
                      <p className="text-green-700">{swapDetails.userTeaches}</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-800 mb-2">You'll Learn</h4>
                      <p className="text-blue-700">{swapDetails.userLearns}</p>
                    </div>
                  </div>

                  {/* Message */}
                  {request.message && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-700 mb-2">Message:</h4>
                      <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{request.message}</p>
                    </div>
                  )}

                  {/* Date and Status */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      Created {new Date(request.createdAt).toLocaleDateString()}
                    </span>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(request.status)}`}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="ml-6">
                  {request.status === 'pending' && (
                    <div className="space-y-2">
                      {swapDetails.isUserSender ? (
                        // Sender can only cancel
                        <button
                          onClick={() => handleStatusUpdate(request._id, 'cancelled')}
                          className="w-full bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors text-sm"
                        >
                          Cancel Request
                        </button>
                      ) : (
                        // Recipient can accept or reject
                        <>
                          <button
                            onClick={() => handleStatusUpdate(request._id, 'accepted')}
                            className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(request._id, 'rejected')}
                            className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors text-sm"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  )}
                  
                  {request.status === 'accepted' && (
                    <div className="space-y-2">
                      <button
                        onClick={() => handleStatusUpdate(request._id, 'completed')}
                        className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
                      >
                        Mark Complete
                      </button>
                    </div>
                  )}

                  {request.status === 'completed' && !hasUserProvidedFeedback(request) && (
                    <button
                      onClick={() => navigate(`/feedback/${request._id}`)}
                      className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors text-sm"
                    >
                      Leave Feedback
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        </div>
      ) : (
        <div className="text-center py-12">
          <svg className="w-24 h-24 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No {activeTab !== 'all' ? activeTab : ''} requests found
          </h3>
          <p className="text-gray-600 mb-4">
            {activeTab === 'all' 
              ? "You haven't created any swap requests yet"
              : `You don't have any ${activeTab} requests`
            }
          </p>
          <button
            onClick={() => navigate('/browse-users')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Browse Users
          </button>
        </div>
      )}

      {/* Create Request Modal */}
      {showCreateModal && (
        <CreateRequestModal
          targetUser={targetUser}
          onClose={() => {
            setShowCreateModal(false);
            setTargetUser(null);
          }}
          onSuccess={() => {
            fetchSwapRequests();
            setShowCreateModal(false);
            setTargetUser(null);
            toast.success('Swap request sent successfully!');
          }}
        />
      )}
    </div>
  );
};

// Create Request Modal Component
const CreateRequestModal = ({ targetUser, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    requesterSkill: '',
    providerSkill: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    console.log('CreateRequestModal: Submitting request with data:', {
      toUser: targetUser._id,
      offeredSkill: formData.requesterSkill,
      wantedSkill: formData.providerSkill,
      message: formData.message
    });

    try {
      await api.createSwapRequest({
        toUser: targetUser._id,
        offeredSkill: formData.requesterSkill,
        wantedSkill: formData.providerSkill,
        message: formData.message
      });
      console.log('CreateRequestModal: Request created successfully');
      onSuccess();
    } catch (error) {
      console.error('CreateRequestModal: Error creating swap request:', error);
      setError(error.response?.data?.error || 'Failed to create swap request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Create Swap Request</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600">Request swap with {targetUser?.name}</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Skill you'll teach
            </label>
            <input
              type="text"
              value={formData.requesterSkill}
              onChange={(e) => setFormData({...formData, requesterSkill: e.target.value})}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter the skill you'll teach"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Skill you want to learn
            </label>
            <select
              value={formData.providerSkill}
              onChange={(e) => setFormData({...formData, providerSkill: e.target.value})}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a skill</option>
              {targetUser?.skillsOffered?.map((skill, index) => (
                <option key={index} value={skill}>{skill}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message (optional)
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add a personal message..."
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Send Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SwapRequests;
