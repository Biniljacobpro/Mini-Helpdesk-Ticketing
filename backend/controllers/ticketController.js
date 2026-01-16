import Ticket from '../models/Ticket.js';

// @desc    Create new ticket
// @route   POST /api/tickets
// @access  Private
export const createTicket = async (req, res) => {
  try {
    const { title, description, priority, category } = req.body;

    // Validation
    if (!title || !description || !priority) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide title, description, and priority' 
      });
    }

    if (title.length < 5) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title must be at least 5 characters' 
      });
    }

    if (description.length < 15) {
      return res.status(400).json({ 
        success: false, 
        message: 'Description must be at least 15 characters' 
      });
    }

    if (!['High', 'Medium', 'Low'].includes(priority)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Priority must be High, Medium, or Low' 
      });
    }

    // Create ticket with userId from JWT (req.userId set by auth middleware)
    const ticket = await Ticket.create({
      userId: req.userId, // CRITICAL: Use userId from JWT, never trust frontend
      title,
      description,
      priority,
      category: category || 'Other',
      status: 'Open'
    });

    res.status(201).json({
      success: true,
      message: 'Ticket created successfully',
      ticket
    });
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while creating ticket' 
    });
  }
};

// @desc    Get all tickets for logged-in user
// @route   GET /api/tickets
// @access  Private
export const getTickets = async (req, res) => {
  try {
    const { status, priority } = req.query;

    // Build filter - CRITICAL: Always filter by userId from JWT
    const filter = { userId: req.userId };

    // Add optional filters
    if (status && ['Open', 'Closed'].includes(status)) {
      filter.status = status;
    }

    if (priority && ['High', 'Medium', 'Low'].includes(priority)) {
      filter.priority = priority;
    }

    // Get tickets with sorting:
    // 1. Open tickets first
    // 2. Priority: High -> Medium -> Low
    // 3. Latest first (createdAt desc)
    const tickets = await Ticket.find(filter).sort({
      status: 1,  // Open (O) comes before Closed (C) alphabetically
      priority: 1, // High (H) -> Low (L) -> Medium (M) alphabetically, need custom sort
      createdAt: -1
    });

    // Custom sort for proper priority order: High -> Medium -> Low
    const priorityOrder = { 'High': 1, 'Medium': 2, 'Low': 3 };
    const sortedTickets = tickets.sort((a, b) => {
      // First by status (Open before Closed)
      if (a.status !== b.status) {
        return a.status === 'Open' ? -1 : 1;
      }
      // Then by priority (High -> Medium -> Low)
      if (a.priority !== b.priority) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      // Finally by date (latest first)
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    res.status(200).json({
      success: true,
      count: sortedTickets.length,
      tickets: sortedTickets
    });
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching tickets' 
    });
  }
};

// @desc    Get single ticket
// @route   GET /api/tickets/:id
// @access  Private
export const getTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ 
        success: false, 
        message: 'Ticket not found' 
      });
    }

    // CRITICAL: Check if ticket belongs to logged-in user
    if (ticket.userId.toString() !== req.userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to access this ticket' 
      });
    }

    res.status(200).json({
      success: true,
      ticket
    });
  } catch (error) {
    console.error('Get ticket error:', error);
    
    // Handle invalid MongoDB ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ 
        success: false, 
        message: 'Ticket not found' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching ticket' 
    });
  }
};

// @desc    Update ticket status/priority
// @route   PATCH /api/tickets/:id
// @access  Private
export const updateTicket = async (req, res) => {
  try {
    const { status, priority } = req.body;

    // Find ticket first
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ 
        success: false, 
        message: 'Ticket not found' 
      });
    }

    // CRITICAL: Check if ticket belongs to logged-in user
    if (ticket.userId.toString() !== req.userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to update this ticket' 
      });
    }

    // Validate and update fields
    if (status && ['Open', 'Closed'].includes(status)) {
      ticket.status = status;
    }

    if (priority && ['High', 'Medium', 'Low'].includes(priority)) {
      ticket.priority = priority;
    }

    ticket.updatedAt = Date.now();
    await ticket.save();

    res.status(200).json({
      success: true,
      message: 'Ticket updated successfully',
      ticket
    });
  } catch (error) {
    console.error('Update ticket error:', error);
    
    // Handle invalid MongoDB ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ 
        success: false, 
        message: 'Ticket not found' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error while updating ticket' 
    });
  }
};

// @desc    Delete ticket
// @route   DELETE /api/tickets/:id
// @access  Private
export const deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ 
        success: false, 
        message: 'Ticket not found' 
      });
    }

    // CRITICAL: Check if ticket belongs to logged-in user
    if (ticket.userId.toString() !== req.userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to delete this ticket' 
      });
    }

    await ticket.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Ticket deleted successfully'
    });
  } catch (error) {
    console.error('Delete ticket error:', error);
    
    // Handle invalid MongoDB ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ 
        success: false, 
        message: 'Ticket not found' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error while deleting ticket' 
    });
  }
};
