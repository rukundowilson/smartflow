import { createComment, getCommentsByTicketId, getCommentsByRequisitionId, deleteComment } from "../services/commentService.js";
import db from "../config/db.js";
import { sendNotificationToUsers } from './notificationController.js';

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
          `SELECT t.created_by, t.assigned_to, t.issue_type FROM tickets t WHERE t.id = ?`,
          [commented_id]
        );
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
      } else if (comment_type === 'requisition') {
        const [[row]] = await db.query(
          `SELECT ir.requested_by, ir.assigned_to, ir.item_name FROM item_requisitions ir WHERE ir.id = ?`,
          [commented_id]
        );
        const recipients = new Set();
        if (row?.requested_by && row.requested_by !== commented_by) recipients.add(row.requested_by);
        if (row?.assigned_to && row.assigned_to !== commented_by && row.assigned_to !== row.requested_by) {
          recipients.add(row.assigned_to);
        }
        if (recipients.size > 0) {
          await sendNotificationToUsers(Array.from(recipients), {
            type: 'requisition',
            title: 'New Comment on Requisition',
            message: `A new comment was added on your requisition (${row?.item_name || 'Requisition'}).`,
            related_id: Number(commented_id),
            related_type: 'requisition'
          });
        }
      }
    } catch (notifyErr) {
      console.warn('comment notification failed:', notifyErr?.message || notifyErr);
    }

    res.status(201).json(comment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while creating comment" });
  }
}

export const getTicketComments = async (req, res) => {
  const ticketId = req.params.ticketId;

  try {
    const comments = await getCommentsByTicketId(ticketId);
    res.status(200).json({ success: true, comments: comments.comments });
  } catch (error) {
    console.error("Error in getTicketComments:", error);
    res.status(500).json({ success: false, message: "Failed to fetch comments" });
  }
};

export const getRequisitionComments = async (req, res) => {
  const requisitionId = req.params.requisitionId;

  try {
    const comments = await getCommentsByRequisitionId(requisitionId);
    res.status(200).json({ success: true, comments: comments.comments });
  } catch (error) {
    console.error("Error in getRequisitionComments:", error);
    res.status(500).json({ success: false, message: "Failed to fetch comments" });
  }
};

export const getSystemAccessRequestComments = async (req, res) => {
  const requestId = req.params.requestId;
  try {
    const [comments] = await db.query(
      `SELECT 
         c.id,
         c.comment_type,
         c.commented_id,
         c.commented_by,
         c.content,
         c.created_at,
         u.full_name as commented_by_name,
         u.email as commented_by_email
       FROM comments c
       LEFT JOIN users u ON c.commented_by = u.id
       WHERE c.comment_type = 'system_access_request' AND c.commented_id = ?
       ORDER BY c.created_at ASC`,
      [requestId]
    );
    res.status(200).json({ success: true, comments });
  } catch (error) {
    console.error("Error in getSystemAccessRequestComments:", error);
    res.status(500).json({ success: false, message: "Failed to fetch comments" });
  }
};

export const handleDeleteComment = async (req, res) => {
  const commentId = req.params.commentId;
  const userId = req.body.userId; // Assuming user ID is passed in request body

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const result = await deleteComment(commentId, userId);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error in handleDeleteComment:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to delete comment" });
  }
}; 