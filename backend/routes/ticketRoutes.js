import express from 'express';
import {
  createTicket,
  getTickets,
  getTicket,
  updateTicket,
  deleteTicket
} from '../controllers/ticketController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected - require JWT authentication
router.use(protect);

router.route('/')
  .post(createTicket)
  .get(getTickets);

router.route('/:id')
  .get(getTicket)
  .patch(updateTicket)
  .delete(deleteTicket);

export default router;
