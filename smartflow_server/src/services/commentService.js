import db from "../config/db.js";

export async function createComment(commentData) {
  try {
    const { comment_type, commented_id, commented_by, content } = commentData;
    
    const [result] = await db.query(
      "INSERT INTO comments (comment_type, commented_id, commented_by, content) VALUES (?, ?, ?, ?)",
      [comment_type, commented_id, commented_by, content]
    );
    
    // Fetch the created comment with user information
    const [comments] = await db.query(
      `SELECT 
        c.id,
        c.comment_type,
        c.commented_id,
        c.content,
        c.created_at,
        u.full_name as commented_by_name,
        u.email as commented_by_email
      FROM comments c
      LEFT JOIN users u ON c.commented_by = u.id
      WHERE c.id = ?`,
      [result.insertId]
    );
    
    return comments[0];
  } catch (error) {
    console.error("Error creating comment:", error);
    throw new Error("Failed to create comment");
  }
}

export async function getCommentsByTicketId(ticketId) {
  try {
    const [comments] = await db.query(
      `SELECT 
        c.id,
        c.comment_type,
        c.commented_id,
        c.content,
        c.created_at,
        u.full_name as commented_by_name,
        u.email as commented_by_email
      FROM comments c
      LEFT JOIN users u ON c.commented_by = u.id
      WHERE c.comment_type = 'ticket' AND c.commented_id = ?
      ORDER BY c.created_at ASC`,
      [ticketId]
    );
    
    return { comments };
  } catch (error) {
    console.error("Error fetching comments:", error);
    throw new Error("Failed to fetch comments");
  }
}

export async function getCommentsByRequisitionId(requisitionId) {
  try {
    const [comments] = await db.query(
      `SELECT 
        c.id,
        c.comment_type,
        c.commented_id,
        c.content,
        c.created_at,
        u.full_name as commented_by_name,
        u.email as commented_by_email
      FROM comments c
      LEFT JOIN users u ON c.commented_by = u.id
      WHERE c.comment_type = 'requisition' AND c.commented_id = ?
      ORDER BY c.created_at ASC`,
      [requisitionId]
    );
    
    return { comments };
  } catch (error) {
    console.error("Error fetching comments:", error);
    throw new Error("Failed to fetch comments");
  }
}

export async function deleteComment(commentId, userId) {
  try {
    // First check if the comment exists and belongs to the user
    const [comment] = await db.query(
      "SELECT * FROM comments WHERE id = ? AND commented_by = ?",
      [commentId, userId]
    );
    
    if (comment.length === 0) {
      throw new Error("Comment not found or unauthorized");
    }
    
    const [result] = await db.query(
      "DELETE FROM comments WHERE id = ?",
      [commentId]
    );
    
    if (result.affectedRows === 0) {
      throw new Error("Comment not found");
    }
    
    return { success: true, message: "Comment deleted successfully" };
  } catch (error) {
    console.error("Error deleting comment:", error);
    throw error;
  }
} 