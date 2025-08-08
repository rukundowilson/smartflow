-- Enhanced SmartFlow Database Schema
-- This schema includes improvements for better performance, data integrity, and audit trails

-- Enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Create audit log table for comprehensive tracking
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    table_name VARCHAR(50) NOT NULL,
    record_id BIGINT NOT NULL,
    action ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
    old_values JSON,
    new_values JSON,
    user_id BIGINT,
    user_email VARCHAR(255),
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_table_record (table_name, record_id),
    INDEX idx_user_action (user_id, action),
    INDEX idx_created_at (created_at)
);

-- Enhanced users table with better constraints
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    employee_id VARCHAR(50) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    status ENUM('pending', 'active', 'suspended', 'terminated') DEFAULT 'pending',
    last_login_at TIMESTAMP NULL,
    failed_login_attempts INT DEFAULT 0,
    locked_until TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_employee_id (employee_id),
    INDEX idx_status (status),
    INDEX idx_last_login (last_login_at)
);

-- Enhanced departments table
CREATE TABLE IF NOT EXISTS departments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    manager_id BIGINT,
    budget_code VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_name (name),
    INDEX idx_active (is_active)
);

-- Enhanced roles table with approval levels
CREATE TABLE IF NOT EXISTS roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    approval_level INT DEFAULT 1,
    permissions JSON,
    is_system_role BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_approval_level (approval_level),
    INDEX idx_system_role (is_system_role)
);

-- Enhanced user_department_roles with better tracking
CREATE TABLE IF NOT EXISTS user_department_roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    department_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    assigned_by BIGINT,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('active', 'inactive', 'pending') DEFAULT 'active',
    effective_from DATE,
    effective_until DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_user_dept_role (user_id, department_id, role_id),
    INDEX idx_user_status (user_id, status),
    INDEX idx_dept_role (department_id, role_id),
    INDEX idx_effective_dates (effective_from, effective_until)
);

-- Enhanced systems table
CREATE TABLE IF NOT EXISTS systems (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    system_type ENUM('internal', 'external', 'cloud') DEFAULT 'internal',
    url VARCHAR(500),
    api_endpoint VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_active (is_active)
);

-- Enhanced tickets table with better categorization
CREATE TABLE IF NOT EXISTS tickets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    issue_type VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    subcategory VARCHAR(100),
    priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    description TEXT NOT NULL,
    status ENUM('open', 'in_progress', 'resolved', 'closed', 'cancelled') DEFAULT 'open',
    created_by BIGINT NOT NULL,
    assigned_to BIGINT,
    reviewed_by BIGINT,
    department_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    reviewed_at TIMESTAMP NULL,
    sla_deadline TIMESTAMP NULL,
    estimated_hours DECIMAL(5,2),
    actual_hours DECIMAL(5,2),
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    INDEX idx_status_priority (status, priority),
    INDEX idx_assigned_to (assigned_to),
    INDEX idx_created_by (created_by),
    INDEX idx_department (department_id),
    INDEX idx_created_at (created_at),
    INDEX idx_sla_deadline (sla_deadline)
);

-- Enhanced item_requisitions table
CREATE TABLE IF NOT EXISTS item_requisitions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    item_name VARCHAR(255) NOT NULL,
    description TEXT,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    urgency ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    justification TEXT NOT NULL,
    status ENUM('pending', 'approved', 'rejected', 'assigned', 'scheduled', 'delivered', 'cancelled') DEFAULT 'pending',
    requested_by BIGINT NOT NULL,
    assigned_to BIGINT,
    approved_by BIGINT,
    department_id BIGINT,
    budget_code VARCHAR(50),
    preferred_supplier VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    approved_at TIMESTAMP NULL,
    delivered_at TIMESTAMP NULL,
    FOREIGN KEY (requested_by) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    INDEX idx_status_urgency (status, urgency),
    INDEX idx_requested_by (requested_by),
    INDEX idx_assigned_to (assigned_to),
    INDEX idx_department (department_id),
    INDEX idx_created_at (created_at)
);

-- Enhanced access_requests table with better workflow tracking
CREATE TABLE IF NOT EXISTS access_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    department_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    system_id BIGINT NOT NULL,
    justification TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    is_permanent BOOLEAN DEFAULT FALSE,
    access_level ENUM('read', 'write', 'admin') DEFAULT 'read',
    status ENUM('pending_line_manager', 'pending_hod', 'pending_it_manager', 'ready_for_assignment', 'granted', 'rejected', 'cancelled') DEFAULT 'pending_line_manager',
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP NULL,
    rejected_at TIMESTAMP NULL,
    granted_at TIMESTAMP NULL,
    current_approver_id BIGINT,
    rejection_reason TEXT,
    workflow_instance_id BIGINT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (system_id) REFERENCES systems(id) ON DELETE CASCADE,
    FOREIGN KEY (current_approver_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_status (user_id, status),
    INDEX idx_status (status),
    INDEX idx_current_approver (current_approver_id),
    INDEX idx_submitted_at (submitted_at),
    INDEX idx_workflow_instance (workflow_instance_id)
);

-- Enhanced registration_applications table
CREATE TABLE IF NOT EXISTS registration_applications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    submitted_by VARCHAR(255) NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_by BIGINT,
    reviewed_at TIMESTAMP NULL,
    rejection_reason TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_status (user_id, status),
    INDEX idx_submitted_at (submitted_at),
    INDEX idx_reviewed_by (reviewed_by)
);

-- Enhanced comments table
CREATE TABLE IF NOT EXISTS comments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    record_type ENUM('ticket', 'requisition', 'access_request') NOT NULL,
    record_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_record (record_type, record_id),
    INDEX idx_user (user_id),
    INDEX idx_created_at (created_at)
);

-- Workflow management tables
CREATE TABLE IF NOT EXISTS workflows (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type ENUM('ticket', 'requisition', 'access_request', 'registration') NOT NULL,
    department_id BIGINT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    INDEX idx_type_department (type, department_id),
    INDEX idx_active (is_active)
);

CREATE TABLE IF NOT EXISTS workflow_steps (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    workflow_id BIGINT NOT NULL,
    step_order INT NOT NULL,
    role_id BIGINT NOT NULL,
    action_type ENUM('approve', 'reject', 'assign', 'review') NOT NULL,
    is_required BOOLEAN DEFAULT TRUE,
    can_skip BOOLEAN DEFAULT FALSE,
    auto_approve_conditions JSON,
    timeout_hours INT,
    escalation_role_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (escalation_role_id) REFERENCES roles(id) ON DELETE SET NULL,
    UNIQUE KEY unique_workflow_step (workflow_id, step_order),
    INDEX idx_workflow (workflow_id),
    INDEX idx_role (role_id)
);

CREATE TABLE IF NOT EXISTS workflow_instances (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    workflow_id BIGINT NOT NULL,
    record_id BIGINT NOT NULL,
    record_type VARCHAR(50) NOT NULL,
    current_step INT DEFAULT 1,
    status ENUM('active', 'completed', 'cancelled', 'escalated') DEFAULT 'active',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    current_assignee_id BIGINT,
    escalation_reason TEXT,
    FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE,
    FOREIGN KEY (current_assignee_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_record (record_type, record_id),
    INDEX idx_status (status),
    INDEX idx_current_assignee (current_assignee_id)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('ticket', 'requisition', 'access_request', 'registration', 'system') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    recipient_id BIGINT NOT NULL,
    sender_id BIGINT,
    related_id BIGINT,
    related_type VARCHAR(50),
    status ENUM('unread', 'read') DEFAULT 'unread',
    priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL,
    FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_recipient_status (recipient_id, status),
    INDEX idx_type_related (type, related_type, related_id),
    INDEX idx_created_at (created_at),
    INDEX idx_priority (priority)
);

-- User preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    ticket_updates BOOLEAN DEFAULT TRUE,
    requisition_updates BOOLEAN DEFAULT TRUE,
    access_request_updates BOOLEAN DEFAULT TRUE,
    approval_requests BOOLEAN DEFAULT TRUE,
    theme ENUM('light', 'dark', 'auto') DEFAULT 'auto',
    language VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'UTC',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create triggers for audit logging
DELIMITER //

CREATE TRIGGER audit_users_insert
AFTER INSERT ON users
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (table_name, record_id, action, new_values, user_id)
    VALUES ('users', NEW.id, 'INSERT', JSON_OBJECT('id', NEW.id, 'full_name', NEW.full_name, 'email', NEW.email), NEW.id);
END//

CREATE TRIGGER audit_users_update
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (table_name, record_id, action, old_values, new_values, user_id)
    VALUES ('users', NEW.id, 'UPDATE', 
        JSON_OBJECT('id', OLD.id, 'full_name', OLD.full_name, 'email', OLD.email, 'status', OLD.status),
        JSON_OBJECT('id', NEW.id, 'full_name', NEW.full_name, 'email', NEW.email, 'status', NEW.status),
        NEW.id);
END//

CREATE TRIGGER audit_tickets_insert
AFTER INSERT ON tickets
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (table_name, record_id, action, new_values, user_id)
    VALUES ('tickets', NEW.id, 'INSERT', 
        JSON_OBJECT('id', NEW.id, 'issue_type', NEW.issue_type, 'status', NEW.status, 'priority', NEW.priority),
        NEW.created_by);
END//

CREATE TRIGGER audit_tickets_update
AFTER UPDATE ON tickets
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (table_name, record_id, action, old_values, new_values, user_id)
    VALUES ('tickets', NEW.id, 'UPDATE',
        JSON_OBJECT('id', OLD.id, 'status', OLD.status, 'assigned_to', OLD.assigned_to),
        JSON_OBJECT('id', NEW.id, 'status', NEW.status, 'assigned_to', NEW.assigned_to),
        NEW.assigned_to);
END//

DELIMITER ;

-- Create views for common queries
CREATE OR REPLACE VIEW active_users AS
SELECT u.*, d.name as department_name, r.name as role_name
FROM users u
LEFT JOIN user_department_roles udr ON u.id = udr.user_id AND udr.status = 'active'
LEFT JOIN departments d ON udr.department_id = d.id
LEFT JOIN roles r ON udr.role_id = r.id
WHERE u.status = 'active';

CREATE OR REPLACE VIEW pending_approvals AS
SELECT 
    'ticket' as type,
    t.id as record_id,
    t.issue_type as title,
    t.status,
    t.created_by,
    t.assigned_to as current_approver,
    t.created_at
FROM tickets t
WHERE t.status IN ('open', 'in_progress')
UNION ALL
SELECT 
    'requisition' as type,
    r.id as record_id,
    r.item_name as title,
    r.status,
    r.requested_by as created_by,
    r.assigned_to as current_approver,
    r.created_at
FROM item_requisitions r
WHERE r.status = 'pending'
UNION ALL
SELECT 
    'access_request' as type,
    ar.id as record_id,
    CONCAT(s.name, ' access') as title,
    ar.status,
    ar.user_id as created_by,
    ar.current_approver_id as current_approver,
    ar.submitted_at as created_at
FROM access_requests ar
JOIN systems s ON ar.system_id = s.id
WHERE ar.status LIKE 'pending_%';

-- Create indexes for better performance
CREATE INDEX idx_tickets_status_priority_created ON tickets(status, priority, created_at);
CREATE INDEX idx_requisitions_status_urgency_created ON item_requisitions(status, urgency, created_at);
CREATE INDEX idx_access_requests_status_submitted ON access_requests(status, submitted_at);
CREATE INDEX idx_notifications_recipient_created ON notifications(recipient_id, created_at);
CREATE INDEX idx_audit_logs_table_record_created ON audit_logs(table_name, record_id, created_at); 