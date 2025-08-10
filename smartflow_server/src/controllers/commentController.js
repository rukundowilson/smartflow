import { createComment, getCommentsByTicketId, getCommentsByRequisitionId, deleteComment } from "../services/commentService.js";
import db from "../config/db.js";
import { sendNotificationToUsers } from './notificationController.js';
import { sendTicketCommentEmail } from '../services/emailService.js';

export async function handleCreateComment(req, res) {
  const { comment_type, commented_id, commented_by, content } = req.body;
  
  if (!comment_type || !commented_id || !commented_by || !content) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const comment = await createComment({
      comment_type,
      commented_id,
      commented_by,
      content,
    });

    // Emit notifications to the normal user (owner/requester) depending on type
    try {
      if (comment_type === 'ticket') {
        const [[row]] = await db.query(
          `SELECT t.created_by, t.assigned_to, t.issue_type, u.email AS user_email
           FROM tickets t JOIN users u ON u.id = t.created_by
           WHERE t.id = ?`,
          [commented_id]
        );
        const [[who]] = await db.query(`SELECT full_name FROM users WHERE id = ?`, [commented_by]);
        const recipients = new Set();
        if (row?.created_by && row.created_by !== commented_by) recipients.add(row.created_by);
        // Optional: notify current assignee if different from commenter and different from owner
        if (row?.assigned_to && row.assigned_to !== commented_by && row.assigned_to !== row.created_by) {
          recipients.add(row.assigned_to);
        }
        if (recipients.size > 0) {
          await sendNotificationToUsers(Array.from(recipients), {
            type: 'ticket',
            title: 'New Comment on Ticket',
            message: `A new comment was added on your ticket (${row?.issue_type || 'Ticket'}).`,
            related_id: Number(commented_id),
            related_type: 'ticket'
          });
        }
        // Email the ticket owner
        if (row?.user_email && row.created_by !== commented_by) {
          try {
            await sendTicketCommentEmail({ to: row.user_email, ticketId: commented_id, issueType: row.issue_type, commenterName: who?.full_name });
          } catch (mailErr) {
            console.warn('ticket comment email failed (non-blocking):', mailErr?.message || mailErr);
          }
        }
      } else if (comment_type === 'requisition') {
        const [[row]] = await db.query
          (`SELECT r.requester_id, u.email AS requester_email
            FROM item_requisitions r JOIN users u ON u.id = r.requester_id
            WHERE r.id = ?`, [commented_id]);
        const recipients = new Set();
        if (row?.requester_id && row.requester_id !== commented_by) recipients.add(row.requester_id);
        if (recipients.size > 0) {
          await sendNotificationToUsers(Array.from(recipients), {
            type: 'requisition',
            title: 'New Comment on Requisition',
            message: 'A new comment was added to your item requisition.',
            related_id: Number(commented_id),
            related_type: 'item_requisition'
          });
        }
        // Email could be added here similarly if desired
      }
    } catch (nerr) {
      console.warn('comment notification failed:', nerr?.message || nerr);
    }

    return res.status(201).json({ success: true, comment });
  } catch (error) {
    console.error("Error creating comment:", error);
    return res.status(500).json({ message: error.message || "Failed to create comment" });
  }
}

export async function handleGetCommentsByTicketId(req, res) {
  try {
    const { ticketId } = req.params;
    const comments = await getCommentsByTicketId(ticketId);
    return res.status(200).json({ success: true, comments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return res.status(500).json({ message: error.message || 'Failed to fetch comments' });
  }
}

export async function handleGetCommentsByRequisitionId(req, res) {
  try {
    const { requisitionId } = req.params;
    const comments = await getCommentsByRequisitionId(requisitionId);
    return res.status(200).json({ success: true, comments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return res.status(500).json({ message: error.message || 'Failed to fetch comments' });
  }
}

export async function handleDeleteComment(req, res) {
  try {
    const { commentId } = req.params;
    await deleteComment(commentId);
    return res.status(200).json({ success: true, message: 'Comment deleted' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return res.status(500).json({ message: error.message || 'Failed to delete comment' });
  }
} 