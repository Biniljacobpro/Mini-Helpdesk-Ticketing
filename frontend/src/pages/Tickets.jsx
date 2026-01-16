import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../utils/api';
import '../styles/Tickets.css';

const Tickets = () => {
  const { user, logout } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState({ show: false, ticketId: null });
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    category: 'Other'
  });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, [statusFilter, priorityFilter]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;

      const response = await api.get('/tickets', { params });
      setTickets(response.data.tickets || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    setFormError('');

    // Validation
    if (formData.title.length < 5) {
      setFormError('Title must be at least 5 characters');
      return;
    }

    if (formData.title.length > 100) {
      setFormError('Title must not exceed 100 characters');
      return;
    }

    if (formData.description.length < 15) {
      setFormError('Description must be at least 15 characters');
      return;
    }

    if (formData.description.length > 500) {
      setFormError('Description must not exceed 500 characters');
      return;
    }

    try {
      setFormLoading(true);
      await api.post('/tickets', formData);
      
      // Reset form and close modal
      setFormData({
        title: '',
        description: '',
        priority: 'Medium',
        category: 'Other'
      });
      setShowCreateModal(false);
      
      // Refresh tickets
      fetchTickets();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create ticket');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateStatus = async (ticketId, newStatus) => {
    try {
      await api.patch(`/tickets/${ticketId}`, { status: newStatus });
      fetchTickets();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update ticket');
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    setDeleteConfirmModal({ show: true, ticketId });
  };

  const confirmDelete = async () => {
    const ticketId = deleteConfirmModal.ticketId;
    setDeleteConfirmModal({ show: false, ticketId: null });

    try {
      await api.delete(`/tickets/${ticketId}`);
      fetchTickets();
      setSelectedTicket(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete ticket');
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmModal({ show: false, ticketId: null });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'priority-high';
      case 'Medium': return 'priority-medium';
      case 'Low': return 'priority-low';
      default: return 'priority-medium';
    }
  };

  const getStatusColor = (status) => {
    return status === 'Open' ? 'status-open' : 'status-closed';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="tickets-container">
      {/* Header */}
      <header className="tickets-header">
        <div className="header-content">
          <div>
            <h1>My Tickets</h1>
            <p className="header-subtitle">Logged in as {user?.email}</p>
          </div>
          <div className="header-actions">
            <button onClick={() => setShowCreateModal(true)} className="btn-primary">
              + New Ticket
            </button>
            <button onClick={logout} className="btn-secondary">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="filters-section">
        <div className="filters">
          <div className="filter-group">
            <label>Status:</label>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">All</option>
              <option value="Open">Open</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Priority:</label>
            <select 
              value={priorityFilter} 
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">All</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {(statusFilter || priorityFilter) && (
            <button 
              onClick={() => {
                setStatusFilter('');
                setPriorityFilter('');
              }}
              className="btn-clear"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-banner">
          {error}
          <button onClick={() => setError('')} className="close-btn">×</button>
        </div>
      )}

      {/* Tickets List */}
      <main className="tickets-main">
        {loading ? (
          <div className="loading">Loading tickets...</div>
        ) : tickets.length === 0 ? (
          <div className="empty-state">
            <p>No tickets found</p>
            <button onClick={() => setShowCreateModal(true)} className="btn-primary">
              Create your first ticket
            </button>
          </div>
        ) : (
          <div className="tickets-grid">
            {tickets.map((ticket) => (
              <div 
                key={ticket._id} 
                className="ticket-card"
                onClick={() => setSelectedTicket(ticket)}
              >
                <div className="ticket-header">
                  <h3 className="ticket-title">{ticket.title}</h3>
                  <div className="ticket-badges">
                    <span className={`badge ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                    <span className={`badge ${getStatusColor(ticket.status)}`}>
                      {ticket.status}
                    </span>
                  </div>
                </div>
                
                <p className="ticket-description">{ticket.description}</p>
                
                <div className="ticket-footer">
                  <span className="ticket-category">{ticket.category}</span>
                  <span className="ticket-date">{formatDate(ticket.createdAt)}</span>
                </div>

                <div className="ticket-actions" onClick={(e) => e.stopPropagation()}>
                  {ticket.status === 'Open' ? (
                    <button 
                      onClick={() => handleUpdateStatus(ticket._id, 'Closed')}
                      className="btn-action btn-close"
                    >
                      Close Ticket
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleUpdateStatus(ticket._id, 'Open')}
                      className="btn-action btn-reopen"
                    >
                      Reopen Ticket
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Ticket</h2>
              <button 
                onClick={() => setShowCreateModal(false)} 
                className="modal-close"
              >
                ×
              </button>
            </div>

            {formError && <div className="error-message">{formError}</div>}

            <form onSubmit={handleCreateTicket} className="ticket-form">
              <div className="form-group">
                <label htmlFor="title">
                  Title * 
                  <span className="char-counter">
                    {formData.title.length}/100
                  </span>
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Brief description of the issue (5-100 chars)"
                  maxLength={100}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">
                  Description * 
                  <span className="char-counter">
                    {formData.description.length}/500
                  </span>
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed description of the issue (15-500 chars)"
                  maxLength={500}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="priority">Priority *</label>
                  <select
                    id="priority"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    required
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="category">Category</label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="Bug">Bug</option>
                    <option value="Feature">Feature</option>
                    <option value="Support">Support</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={formLoading}
                >
                  {formLoading ? 'Creating...' : 'Create Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ticket Details Modal */}
      {selectedTicket && (
        <div className="modal-overlay" onClick={() => setSelectedTicket(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Ticket Details</h2>
              <button 
                onClick={() => setSelectedTicket(null)} 
                className="modal-close"
              >
                ×
              </button>
            </div>

            <div className="ticket-details">
              <div className="detail-row">
                <h3>{selectedTicket.title}</h3>
                <div className="ticket-badges">
                  <span className={`badge ${getPriorityColor(selectedTicket.priority)}`}>
                    {selectedTicket.priority}
                  </span>
                  <span className={`badge ${getStatusColor(selectedTicket.status)}`}>
                    {selectedTicket.status}
                  </span>
                </div>
              </div>

              <div className="detail-row">
                <div className="detail-label">Category:</div>
                <div>{selectedTicket.category}</div>
              </div>

              <div className="detail-row">
                <div className="detail-label">Created:</div>
                <div>{formatDate(selectedTicket.createdAt)}</div>
              </div>

              <div className="detail-row">
                <div className="detail-label">Updated:</div>
                <div>{formatDate(selectedTicket.updatedAt)}</div>
              </div>

              <div className="detail-section">
                <div className="detail-label">Description:</div>
                <p className="detail-description">{selectedTicket.description}</p>
              </div>

              <div className="modal-actions">
                <button 
                  onClick={() => handleDeleteTicket(selectedTicket._id)}
                  className="btn-danger"
                >
                  Delete Ticket
                </button>
                {selectedTicket.status === 'Open' ? (
                  <button 
                    onClick={() => {
                      handleUpdateStatus(selectedTicket._id, 'Closed');
                      setSelectedTicket(null);
                    }}
                    className="btn-primary"
                  >
                    Close Ticket
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      handleUpdateStatus(selectedTicket._id, 'Open');
                      setSelectedTicket(null);
                    }}
                    className="btn-primary"
                  >
                    Reopen Ticket
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmModal.show && (
        <div className="modal-overlay" onClick={cancelDelete}>
          <div className="modal delete-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirm Delete</h2>
              <button className="close-btn" onClick={cancelDelete}>×</button>
            </div>
            <div className="modal-body">
              <div className="delete-confirm-content">
                <svg className="delete-warning-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="13"></line>
                  <circle cx="12" cy="16.5" r="0.5" fill="currentColor"></circle>
                </svg>
                <p className="delete-confirm-text">
                  Are you sure you want to delete this ticket? This action cannot be undone.
                </p>
              </div>
              <div className="delete-confirm-actions">
                <button onClick={cancelDelete} className="btn-secondary">
                  Cancel
                </button>
                <button onClick={confirmDelete} className="btn-danger">
                  Delete Ticket
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tickets;
