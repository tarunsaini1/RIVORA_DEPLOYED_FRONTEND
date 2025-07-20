import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, X, Clock, UserCheck, UserX, Users, Bell, RefreshCw, 
  Filter, ChevronDown, CalendarClock, ArrowUpRight, Search,
  AlertCircle, CheckCircle, FileText, Award, Shield, Eye
} from 'lucide-react';
import API from '../../api/api';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const InvitationHandler = () => {
  const [invitations, setInvitations] = useState([]);
  const [filteredInvitations, setFilteredInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchInvitations();
    
    // Set up auto-refresh every 5 minutes
    const refreshInterval = setInterval(() => {
      fetchInvitations(true);
    }, 300000); // 5 minutes
    
    return () => clearInterval(refreshInterval);
  }, []);
  
  // Filter invitations whenever dependencies change
  useEffect(() => {
    filterInvitations();
  }, [invitations, activeTab, searchTerm, roleFilter]);

  // Handle filtering logic
  const filterInvitations = () => {
    const filtered = invitations.filter(invitation => {
      // Filter by status
      const statusMatch = 
        activeTab === 'pending' ? invitation.status === 'pending' : 
        activeTab === 'accepted' ? invitation.status === 'accepted' : 
        activeTab === 'declined' ? (invitation.status === 'rejected' || invitation.status === 'declined') : 
        true;
      
      // Search term filter (case insensitive)
      const searchMatch = !searchTerm || 
        (invitation.projectId?.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (invitation.inviterId?.username?.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Role filter
      const roleMatch = roleFilter === 'all' || invitation.role === roleFilter;
      
      return statusMatch && searchMatch && roleMatch;
    });
    
    // Sort by date
    const sorted = [...filtered].sort((a, b) => {
      return new Date(b.sentAt || b.createdAt) - new Date(a.sentAt || a.createdAt);
    });
    
    setFilteredInvitations(sorted);
  };

  const fetchInvitations = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      if (silent) setRefreshing(true);
      
      const response = await API.get('/api/invites/requests');
      console.log('Invitations API response:', response.data);

      setInvitations(response.data.invitations || []);
      setError(null);
      
      // If silent refresh, show a small notification
      if (silent && response.data.invitations?.length > 0) {
        toast.info('Invitation list refreshed');
      }
    } catch (error) {
      console.error('Error fetching invitations:', error);
      if (!silent) {
        setError('Failed to load invitations');
      } else {
        toast.error('Failed to refresh invitations');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleInvitationResponse = async (invitationId, action) => {
    try {
      setLoading(true);
      
      // Log for debugging
      console.log(`Responding to invitation with ID: ${invitationId}`);
      
      const response = await API.post('/api/invites/respond', {
        invitationId,
        action, // 'accept' or 'reject'
        message: '' // optional message
      });
      console.log('Invitation response:', response.data);

      if (response.data.success) {
        // Update local state for immediate feedback
        setInvitations(prevInvitations => 
          prevInvitations.map(inv => {
            const id = inv._id || inv.invitationId;
            if (id === invitationId) {
              return {
                ...inv,
                status: action === 'accept' ? 'accepted' : 'declined',
                respondedAt: new Date()
              };
            }
            return inv;
          })
        );
        
        // Show success message
        toast.success(
          action === 'accept' 
            ? '🎉 Invitation accepted! You now have access to the project.' 
            : '✓ Invitation declined'
        );
        
        // After a short delay, refresh to get the latest data
        setTimeout(() => {
          fetchInvitations(true);
        }, 1000);
      }
    } catch (error) {
      console.error('Error responding to invitation:', error);
      
      let errorMessage = 'Failed to respond to invitation';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 404) {
        errorMessage = 'This invitation could not be found or has been processed already';
      } else if (error.response?.status === 403) {
        errorMessage = 'You do not have permission to respond to this invitation';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Get badge counts
  const pendingCount = invitations.filter(inv => inv.status === 'pending').length;
  const acceptedCount = invitations.filter(inv => inv.status === 'accepted').length;
  const declinedCount = invitations.filter(inv => 
    inv.status === 'declined' || inv.status === 'rejected'
  ).length;
  
  // Get role icon
  const getRoleIcon = (role) => {
    switch(role) {
      case 'admin':
        return <Shield size={14} className="text-amber-600" />;
      case 'member':
        return <Users size={14} className="text-blue-600" />;
      case 'editor':
        return <FileText size={14} className="text-purple-600" />;
      case 'viewer':
        return <Eye size={14} className="text-emerald-600" />;
      default:
        return null;
    }
  };
  
  // Status badge component
  const StatusBadge = ({ status }) => {
    let bgColor = 'bg-gray-100';
    let textColor = 'text-gray-600';
    let icon = <Clock size={14} />;
    let label = 'Unknown';
    
    if (status === 'pending') {
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-600';
      icon = <Clock size={14} />;
      label = 'Pending';
    } else if (status === 'accepted') {
      bgColor = 'bg-green-100';
      textColor = 'text-green-600';
      icon = <CheckCircle size={14} />;
      label = 'Accepted';
    } else if (status === 'declined' || status === 'rejected') {
      bgColor = 'bg-red-100';
      textColor = 'text-red-600';
      icon = <X size={14} />;
      label = 'Declined';
    }
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${bgColor} ${textColor} text-xs font-medium`}>
        {icon}
        {label}
      </span>
    );
  };

  // Loading state with skeleton UI
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 w-1/3 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 w-1/2 rounded mb-6"></div>
              
              <div className="flex gap-4 mb-6">
                <div className="h-10 bg-gray-200 w-full rounded"></div>
                <div className="h-10 bg-gray-200 w-32 rounded"></div>
              </div>
              
              <div className="flex border-b border-gray-200 mb-6">
                <div className="h-12 bg-gray-200 w-1/3 rounded-t"></div>
                <div className="h-12 bg-gray-100 w-1/3 rounded-t"></div>
                <div className="h-12 bg-gray-100 w-1/3 rounded-t"></div>
              </div>
            </div>
            
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-4 border border-gray-100 animate-pulse">
                  <div className="flex justify-between mb-3">
                    <div className="h-6 bg-gray-200 w-1/4 rounded"></div>
                    <div className="h-8 bg-gray-200 w-24 rounded"></div>
                  </div>
                  <div className="h-4 bg-gray-200 w-2/3 rounded mb-3"></div>
                  <div className="flex gap-2">
                    <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
                    <div className="h-6 bg-gray-200 w-1/4 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state with retry button
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col items-center justify-center py-12">
              <AlertCircle size={48} className="text-red-500 mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Oops! Something went wrong</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={() => fetchInvitations()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <RefreshCw size={16} />
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">
                  Project Invitations
                </h1>
                {pendingCount > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white text-xs font-medium rounded-full">
                    {pendingCount}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Manage collaboration invitations to your projects
              </p>
            </div>
            
            <button
              onClick={() => fetchInvitations()}
              disabled={refreshing}
              className={`px-3 py-1.5 bg-white border border-gray-300 rounded-lg 
                    hover:bg-gray-50 text-gray-700 text-sm transition-colors
                    flex items-center gap-2 ${refreshing ? 'opacity-70' : ''}`}
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
          
          {/* Search and filter */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search projects or people..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 py-2 px-4 block w-full border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <X size={16} className="text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
            
            <div className="relative inline-block">
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className="w-full sm:w-auto px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 
                       flex items-center gap-2 text-sm text-gray-700"
              >
                <Filter size={14} className="text-gray-500" />
                Filter by role
                <ChevronDown size={14} className={`ml-1 transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {filterOpen && (
                <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-56 py-1 animate-fadeIn">
                  <div className="px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-100">
                    Filter by role
                  </div>
                  <button
                    onClick={() => { setRoleFilter('all'); setFilterOpen(false); }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${roleFilter === 'all' ? 'text-blue-600 bg-blue-50' : ''}`}
                  >
                    All roles
                  </button>
                  <button
                    onClick={() => { setRoleFilter('admin'); setFilterOpen(false); }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center ${roleFilter === 'admin' ? 'text-blue-600 bg-blue-50' : ''}`}
                  >
                    <Shield size={14} className="mr-2 text-amber-600" />
                    Admin
                  </button>
                  <button
                    onClick={() => { setRoleFilter('member'); setFilterOpen(false); }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center ${roleFilter === 'member' ? 'text-blue-600 bg-blue-50' : ''}`}
                  >
                    <Users size={14} className="mr-2 text-blue-600" />
                    Member
                  </button>
                  <button
                    onClick={() => { setRoleFilter('viewer'); setFilterOpen(false); }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center ${roleFilter === 'viewer' ? 'text-blue-600 bg-blue-50' : ''}`}
                  >
                    <Eye size={14} className="mr-2 text-emerald-600" />
                    Viewer
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('pending')}
                className={`py-3 px-1 border-b-2 text-sm font-medium flex items-center
                        ${activeTab === 'pending'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
              >
                <Clock size={16} className="mr-1.5" />
                Pending
                {pendingCount > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center w-5 h-5 bg-blue-100 text-blue-600 text-xs font-medium rounded-full">
                    {pendingCount}
                  </span>
                )}
              </button>
              
              <button
                onClick={() => setActiveTab('accepted')}
                className={`py-3 px-1 border-b-2 text-sm font-medium flex items-center
                        ${activeTab === 'accepted'
                          ? 'border-green-500 text-green-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
              >
                <CheckCircle size={16} className="mr-1.5" />
                Accepted
                {acceptedCount > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center w-5 h-5 bg-green-100 text-green-600 text-xs font-medium rounded-full">
                    {acceptedCount}
                  </span>
                )}
              </button>
              
              <button
                onClick={() => setActiveTab('declined')}
                className={`py-3 px-1 border-b-2 text-sm font-medium flex items-center
                        ${activeTab === 'declined'
                          ? 'border-red-500 text-red-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
              >
                <X size={16} className="mr-1.5" />
                Declined
                {declinedCount > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center w-5 h-5 bg-red-100 text-red-600 text-xs font-medium rounded-full">
                    {declinedCount}
                  </span>
                )}
              </button>
            </nav>
          </div>
        </div>
        
        {/* Content */}
        <div className="space-y-5">
          <AnimatePresence mode="wait">
            {filteredInvitations.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                key="empty-state"
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center"
              >
                {activeTab === 'pending' ? (
                  <>
                    <Bell size={40} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-gray-800 text-lg font-medium mb-1">No pending invitations</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                      You don't have any pending project invitations. When someone invites you to collaborate, it will appear here.
                    </p>
                  </>
                ) : activeTab === 'accepted' ? (
                  <>
                    <CheckCircle size={40} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-gray-800 text-lg font-medium mb-1">No accepted invitations</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                      You haven't accepted any invitations yet. After accepting, they will appear here for easy access.
                    </p>
                  </>
                ) : (
                  <>
                    <X size={40} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-gray-800 text-lg font-medium mb-1">No declined invitations</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                      You haven't declined any invitations. Declined invitations will be stored here for reference.
                    </p>
                  </>
                )}
              </motion.div>
            ) : (
              <div>
                {filteredInvitations.map((invitation) => {
                  // Get the correct ID (could be either _id or invitationId)
                  const id = invitation._id || invitation.invitationId;
                  
                  // Safely access nested data with fallbacks
                  const projectName = invitation.projectId?.name || 'Untitled Project';
                  const projectDescription = invitation.projectId?.description || 'No description provided';
                  
                  const inviterName = invitation.inviterId?.username || 'Unknown';
                  const inviterPic = invitation.inviterId?.profilePicture;
                  
                  // Format the date
                  const dateObj = new Date(invitation.sentAt || invitation.createdAt);
                  const formattedDate = dateObj.toLocaleDateString();
                  
                  // Check if invitation is from team deployment
                  const isTeamInvite = invitation.teamDeployment;
                  
                  return (
                    <motion.div
                      key={id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={`bg-white rounded-xl shadow-sm border 
                               ${invitation.status === 'pending' ? 'border-blue-100 hover:border-blue-200' : 
                                 invitation.status === 'accepted' ? 'border-green-100 hover:border-green-200' :
                                 'border-gray-200 hover:border-gray-300'} 
                               p-5 transition-all hover:shadow-md`}
                    >
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                        <div className="flex-grow">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900">
                              {projectName}
                            </h3>
                            
                            <StatusBadge status={invitation.status} />
                            
                            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
                                         ${invitation.role === 'admin' ? 'bg-amber-100 text-amber-700' : 
                                           invitation.role === 'member' ? 'bg-blue-100 text-blue-700' :
                                           'bg-emerald-100 text-emerald-700'}`}>
                              {getRoleIcon(invitation.role)}
                              {invitation.role}
                            </div>
                            
                            {isTeamInvite && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-medium">
                                <Users size={12} />
                                Team invite
                              </span>
                            )}
                          </div>
                          
                          <p className="text-gray-600 text-sm mb-3">
                            {projectDescription}
                          </p>
                          
                          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-3">
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
                                {inviterPic ? (
                                  <img 
                                    src={inviterPic} 
                                    alt={inviterName}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = 'https://via.placeholder.com/40?text=' + inviterName.charAt(0);
                                    }}
                                  />
                                ) : (
                                  <span className="text-xs font-medium text-gray-600">
                                    {inviterName.charAt(0).toUpperCase()}
                                  </span>
                                )}
                              </div>
                              <span>From {inviterName}</span>
                            </div>
                            
                            <div className="flex items-center gap-1.5">
                              <CalendarClock size={14} className="text-gray-400" />
                              <span>{formattedDate}</span>
                            </div>
                          </div>
                          
                          {invitation.message && (
                            <div className="text-sm italic text-gray-600 bg-gray-50 p-3 rounded-md border border-gray-100">
                              "{invitation.message}"
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-shrink-0 self-start">
                          {invitation.status === 'pending' ? (
                            <div className="flex flex-col gap-2">
                              <button
                                onClick={() => handleInvitationResponse(id, 'accept')}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg
                                         shadow-sm transition-colors flex items-center gap-2 w-full justify-center"
                              >
                                <CheckCircle size={16} />
                                <span>Accept</span>
                              </button>
                              <button
                                onClick={() => handleInvitationResponse(id, 'reject')}
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg
                                         border border-gray-300 transition-colors flex items-center gap-2 w-full justify-center"
                              >
                                <X size={16} />
                                <span>Decline</span>
                              </button>
                            </div>
                          ) : invitation.status === 'accepted' ? (
                            <Link
                              to={`/project/${typeof invitation.projectId === 'string' ? invitation.projectId : invitation.projectId?._id}`}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg
                                     transition-colors flex items-center gap-2"
                            >
                              <ArrowUpRight size={16} />
                              <span>View Project</span>
                            </Link>
                          ) : (
                            <span className="text-sm text-gray-500">
                              Declined on {new Date(invitation.respondedAt || invitation.updatedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Helpful tips section */}
        {activeTab === 'pending' && pendingCount > 0 && (
          <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <Award size={20} className="text-blue-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Project Collaboration Tips</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Admin roles can manage project settings and invites</li>
                    <li>Member roles can contribute to project content</li>
                    <li>Viewer roles can access but not modify content</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvitationHandler;