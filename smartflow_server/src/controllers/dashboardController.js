import db from '../config/db.js';

export const getDashboardStats = async (req, res) => {
  try {
    let ticketStats = { total: 0, open: 0, in_progress: 0, resolved: 0, closed: 0 };
    let ticketStatusBreakdown = [];
    let requisitionStats = { total: 0, pending: 0, approved: 0, rejected: 0, assigned: 0, delivered: 0 };
    let requisitionStatusBreakdown = [];
    let userStats = { total: 0, pending: 0, approved: 0, rejected: 0 };
    let userStatusBreakdown = [];

    // Try to get ticket statistics
    try {
      const [ticketStatsResult] = await db.query(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open,
          SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
          SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved,
          SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed
        FROM tickets
      `);
      ticketStats = ticketStatsResult[0] || ticketStats;

      const [ticketStatusBreakdownResult] = await db.query(`
        SELECT status, COUNT(*) as count
        FROM tickets
        GROUP BY status
        ORDER BY count DESC
      `);
      ticketStatusBreakdown = ticketStatusBreakdownResult;
    } catch (error) {
      console.log('Tickets table not available or empty:', error.message);
    }

    // Try to get requisition statistics
    try {
      const [requisitionStatsResult] = await db.query(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
          SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
          SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
          SUM(CASE WHEN status = 'assigned' THEN 1 ELSE 0 END) as assigned,
          SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered
        FROM item_requisitions
      `);
      requisitionStats = requisitionStatsResult[0] || requisitionStats;

      const [requisitionStatusBreakdownResult] = await db.query(`
        SELECT status, COUNT(*) as count
        FROM item_requisitions
        GROUP BY status
        ORDER BY count DESC
      `);
      requisitionStatusBreakdown = requisitionStatusBreakdownResult;
    } catch (error) {
      console.log('Item requisitions table not available or empty:', error.message);
    }

    // Try to get user statistics
    try {
      const [userStatsResult] = await db.query(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
          SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as approved,
          SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as rejected
        FROM users
      `);
      userStats = userStatsResult[0] || userStats;

      const [userStatusBreakdownResult] = await db.query(`
        SELECT status, COUNT(*) as count
        FROM users
        GROUP BY status
        ORDER BY count DESC
      `);
      userStatusBreakdown = userStatusBreakdownResult;
    } catch (error) {
      console.log('Users table not available or empty:', error.message);
    }

    const data = {
      tickets: {
        total: ticketStats.total || 0,
        open: ticketStats.open || 0,
        in_progress: ticketStats.in_progress || 0,
        resolved: ticketStats.resolved || 0,
        closed: ticketStats.closed || 0,
        byStatus: ticketStatusBreakdown.length > 0 ? ticketStatusBreakdown.map(row => ({
          status: row.status,
          count: row.count
        })) : []
      },
      requisitions: {
        total: requisitionStats.total || 0,
        pending: requisitionStats.pending || 0,
        approved: requisitionStats.approved || 0,
        rejected: requisitionStats.rejected || 0,
        assigned: requisitionStats.assigned || 0,
        delivered: requisitionStats.delivered || 0,
        byStatus: requisitionStatusBreakdown.length > 0 ? requisitionStatusBreakdown.map(row => ({
          status: row.status,
          count: row.count
        })) : []
      },
      users: {
        total: userStats.total || 0,
        pending: userStats.pending || 0,
        approved: userStats.approved || 0,
        rejected: userStats.rejected || 0,
        byStatus: userStatusBreakdown.length > 0 ? userStatusBreakdown.map(row => ({
          status: row.status,
          count: row.count
        })) : []
      }
    };

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard statistics'
    });
  }
};

export const getRecentActivities = async (req, res) => {
  try {
    let allActivities = [];

    // Try to get recent tickets
    try {
      const [recentTickets] = await db.query(`
        SELECT 
          t.id,
          'ticket' as type,
          CASE 
            WHEN t.status = 'open' THEN 'created'
            WHEN t.status = 'in_progress' THEN 'assigned'
            WHEN t.status = 'resolved' THEN 'resolved'
            WHEN t.status = 'closed' THEN 'closed'
          END as action,
          CONCAT('Ticket #', t.id, ' - ', t.issue_type) as description,
          t.created_at as timestamp,
          u.full_name as user
        FROM tickets t
        LEFT JOIN users u ON t.created_by = u.id
        ORDER BY t.created_at DESC
        LIMIT 5
      `);
      allActivities.push(...recentTickets.map(t => ({ ...t, id: `T${t.id}` })));
    } catch (error) {
      console.log('Tickets query failed:', error.message);
    }

    // Try to get recent requisitions
    try {
      const [recentRequisitions] = await db.query(`
        SELECT 
          ir.id,
          'requisition' as type,
          CASE 
            WHEN ir.status = 'pending' THEN 'created'
            WHEN ir.status = 'approved' THEN 'approved'
            WHEN ir.status = 'rejected' THEN 'rejected'
            WHEN ir.status = 'assigned' THEN 'assigned'
            WHEN ir.status = 'delivered' THEN 'delivered'
          END as action,
          CONCAT('Requisition #', ir.id, ' - ', ir.item_name) as description,
          ir.created_at as timestamp,
          u.full_name as user
        FROM item_requisitions ir
        LEFT JOIN users u ON ir.requested_by = u.id
        ORDER BY ir.created_at DESC
        LIMIT 5
      `);
      allActivities.push(...recentRequisitions.map(r => ({ ...r, id: `R${r.id}` })));
    } catch (error) {
      console.log('Requisitions query failed:', error.message);
    }

    // Try to get recent user applications
    try {
      const [recentUsers] = await db.query(`
        SELECT 
          ra.id as id,
          'user' as type,
          CASE 
            WHEN ra.status = 'pending' THEN 'applied'
            WHEN ra.status = 'approved' THEN 'approved'
            WHEN ra.status = 'rejected' THEN 'rejected'
          END as action,
          CONCAT('User application - ', u.full_name) as description,
          ra.reviewed_at as timestamp,
          u.full_name as user
        FROM registration_applications ra
        LEFT JOIN users u ON ra.user_id = u.id
        ORDER BY ra.reviewed_at DESC
        LIMIT 5
      `);
      allActivities.push(...recentUsers.map(u => ({ ...u, id: `U${u.id}` })));
    } catch (error) {
      console.log('User applications query failed:', error.message);
    }

    // Sort and limit activities
    const sortedActivities = allActivities
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);

    // If no activities found, return empty array
    // No hardcoded fallback data

    res.json({
      success: true,
      activities: sortedActivities
    });
  } catch (error) {
    console.error('Recent activities error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recent activities'
    });
  }
}; 