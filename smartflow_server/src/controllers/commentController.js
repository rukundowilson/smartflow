import { createComment, getCommentsByTicketId, getCommentsByRequisitionId, deleteComment } from "../services/commentService.js";

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