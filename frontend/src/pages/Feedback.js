import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';

const Feedback = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    rating: 5,
    comment: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchSwapRequest();
  }, [requestId]);

  const fetchSwapRequest = async () => {
    try {
      setLoading(true);
      const response = await api.getSwapRequest(requestId);
      setRequest(response.data);
    } catch (error) {
      console.error('Error fetching swap request:', error);
      setMessage({ type: 'error', text: 'Failed to load swap request' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await api.submitFeedback(requestId, formData);
      setMessage({ type: 'success', text: 'Feedback submitted successfully!' });
      setTimeout(() => navigate('/swap-requests'), 2000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to submit feedback' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRatingChange = (rating) => {
    setFormData({ ...formData, rating });
  };

  const getSwapDetails = (request) => {
    if (!user || !request) return null;

    const isUserSender = request.fromUser?._id === user._id;
    const otherUser = isUserSender ? request.toUser : request.fromUser;
    const userTaught = isUserSender ? request.offeredSkill : request.wantedSkill;
    const userLearned = isUserSender ? request.wantedSkill : request.offeredSkill;

    return {
      otherUser,
      userTaught,
      userLearned,
      isUserSender
    };
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!request) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Swap Request Not Found</h1>
          <button
            onClick={() => navigate('/swap-requests')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to Requests
          </button>
        </div>
      </div>
    );
  }

  if (request.status !== 'completed') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Cannot Leave Feedback</h1>
          <p className="text-gray-600 mb-4">
            Feedback can only be submitted for completed swaps.
          </p>
          <button
            onClick={() => navigate('/swap-requests')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to Requests
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Leave Feedback</h1>
        <p className="text-gray-600 mt-2">
          Share your experience with this skill swap
        </p>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-md ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Swap Details */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Swap Details</h2>
        
        {(() => {
          const swapDetails = getSwapDetails(request);
          if (!swapDetails) return null;
          
          return (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-medium text-green-800 mb-2">You Taught</h3>
                  <p className="text-green-700">{swapDetails.userTaught}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-800 mb-2">You Learned</h3>
                  <p className="text-blue-700">{swapDetails.userLearned}</p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                  {swapDetails.otherUser?.name?.charAt(0).toUpperCase() || '?'}
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    Swap with {swapDetails.otherUser?.name || 'Unknown User'}
                  </p>
                  <p className="text-sm text-gray-600">
                    Completed on {new Date(request.completedAt || request.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </>
          );
        })()}
      </div>

      {/* Feedback Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              How would you rate this skill swap experience?
            </label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingChange(star)}
                  className={`w-8 h-8 ${
                    star <= formData.rating
                      ? 'text-yellow-400 hover:text-yellow-500'
                      : 'text-gray-300 hover:text-gray-400'
                  } transition-colors`}
                >
                  <svg
                    className="w-full h-full"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
              <span className="ml-4 text-sm text-gray-600">
                {formData.rating} star{formData.rating !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Comment */}
          <div>
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
              Share your experience
            </label>
            <textarea
              id="comment"
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              rows={4}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Tell others about your experience with this skill swap..."
            />
          </div>

          {/* Guidelines */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Feedback Guidelines</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Be honest and constructive in your feedback</li>
              <li>• Focus on the learning experience and teaching quality</li>
              <li>• Mention specific aspects that were helpful or could be improved</li>
              <li>• Keep it professional and respectful</li>
            </ul>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/swap-requests')}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Feedback;
