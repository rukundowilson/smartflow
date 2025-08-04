# 🏢 SmartFlow System Requirements

## Overview

SmartFlow is a comprehensive workflow management system that handles IT ticketing, access requests, requisitions, and administrative processes. The system operates on a role-based access control (RBAC) model with specific departments and roles that are essential for proper functionality.

---

## 🏬 Required Departments

The following departments are **mandatory** for the system to function correctly:

### Core Departments

| Department | Description | Access Level | Dashboard Path |
|------------|-------------|--------------|----------------|
| **IT Department** | Handles technical support, system access, and IT infrastructure | Special | `/departments/it-department/overview` |
| **HR Department** | Manages employee onboarding, approvals, and HR processes | Special | `/administration/hr` |
| **Super Admin Unit** | Reserved for highest-level system operators | Special | `/administration/superadmin/overview` |

### Standard Departments

| Department | Description | Access Level | Dashboard Path |
|------------|-------------|--------------|----------------|
| **Finance Department** | Handles financial processes and accounting | Standard | `/departments/others/overview` |
| **Marketing Department** | Manages marketing and sales activities | Standard | `/departments/others/overview` |
| **Other Departments** | Any additional departments created dynamically | Standard | `/departments/others/overview` |

> **Note**: Core departments have special routing and dedicated dashboards, while standard departments use the general "others" dashboard.

---

## 👥 Required Roles

### System-Level Roles

| Role | Description | Approval Level | Access Level |
|------|-------------|----------------|--------------|
| **Super Admin** | Full system access and control | N/A | All systems |
| **IT Manager** | IT Department management and third-level approvals | 3rd Level | IT systems + admin |
| **HOD (Head of Department)** | Department-level management and second-level approvals | 2nd Level | Department + admin |
| **Line Manager** | Team management and first-level approvals | 1st Level | Team + basic admin |
| **HR Manager** | HR Department management and employee oversight | 2nd Level | HR systems + admin |

### Department-Specific Roles

#### IT Department Roles
| Role | Description | Responsibilities |
|------|-------------|------------------|
| **IT Manager** | IT Department Manager | Third-level approver, system administration |
| **HOD** | Head of IT Department | Second-level approver, department oversight |
| **Line Manager** | IT Team Manager | First-level approver, team management |
| **IT Support** | IT Support Technician | Technical support, ticket resolution |
| **Developer** | Software Developer | Development tasks, system maintenance |
| **User** | Regular IT User | Basic IT access, ticket creation |

#### HR Department Roles
| Role | Description | Responsibilities |
|------|-------------|------------------|
| **HR Manager** | HR Department Manager | HR oversight, employee management |
| **HR Officer** | HR Operations | Employee relations, policy enforcement |
| **Recruiter** | Recruitment Specialist | Hiring processes, candidate management |
| **HR User** | Regular HR User | Basic HR access, employee data |

#### Finance Department Roles
| Role | Description | Responsibilities |
|------|-------------|------------------|
| **Finance Manager** | Finance Department Manager | Financial oversight, budget management |
| **Accountant** | Accounting Specialist | Financial reporting, bookkeeping |
| **Finance User** | Regular Finance User | Basic financial access |

#### Marketing Department Roles
| Role | Description | Responsibilities |
|------|-------------|------------------|
| **Marketing Manager** | Marketing Department Manager | Marketing strategy, campaign oversight |
| **Marketing Specialist** | Marketing Operations | Campaign execution, content creation |
| **Marketing User** | Regular Marketing User | Basic marketing access |

---

## 🔄 Approval Hierarchy

The system implements a three-level approval hierarchy:

### Level 1: Line Manager
- **Role**: Line Manager
- **Responsibilities**: First-level approval for tickets, requests, and requisitions
- **Access**: Team management, basic approvals

### Level 2: Head of Department (HOD)
- **Role**: HOD
- **Responsibilities**: Second-level approval, department oversight
- **Access**: Department management, escalated approvals

### Level 3: Department Manager
- **Role**: IT Manager, HR Manager, Finance Manager, etc.
- **Responsibilities**: Final approval, department strategy
- **Access**: Full department access, strategic decisions

---

## 🛠️ System Access Levels

### Special Access Departments
These departments have dedicated dashboards and enhanced functionality:

1. **IT Department**
   - Full ticketing system access
   - System administration capabilities
   - Technical support tools
   - Access request management

2. **HR Department**
   - Employee management
   - Registration approvals
   - Role assignments
   - Department oversight

3. **Super Admin Unit**
   - Complete system access
   - User management
   - System configuration
   - Global oversight

### Standard Access Departments
These departments use the general dashboard:

- Finance Department
- Marketing Department
- Any additional departments

---

## 📋 Required System Setup

### Database Initialization
The system requires the following to be seeded during initial setup:

1. **Departments** (from `clear_and_setup_database.js`):
   ```javascript
   const departments = [
     { name: 'IT Department', description: 'Information Technology Department' },
     { name: 'HR Department', description: 'Human Resources Department' },
     { name: 'Finance Department', description: 'Finance and Accounting Department' },
     { name: 'Marketing Department', description: 'Marketing and Sales Department' }
   ];
   ```

2. **Roles** (from `clear_and_setup_database.js`):
   ```javascript
   const roles = [
     // IT Department Roles
     { name: 'IT Manager', description: 'IT Department Manager - Third level approver' },
     { name: 'HOD', description: 'Head of Department - Second level approver' },
     { name: 'Line Manager', description: 'Line Manager - First level approver' },
     { name: 'IT Support', description: 'IT Support Technician' },
     { name: 'Developer', description: 'Software Developer' },
     { name: 'User', description: 'Regular IT Department User' },
     // ... additional roles
   ];
   ```

### Critical Roles Protection
The following roles should be **protected from deletion**:
- Super Admin
- IT Manager
- HOD
- Line Manager
- HR Manager

---

## 🔐 Authentication & Authorization

### Login Flow
1. User enters credentials (email, employee ID, password)
2. System validates credentials
3. User is redirected based on department and roles
4. Multi-role users can select their active role

### Role Selection
Users with multiple roles can switch between them:
- Line Manager → `/administration/office/linemanager`
- HOD → `/administration/office/hod`
- IT Manager → `/administration/office/itmanager`
- Department-specific roles → Department dashboards

---

## 📊 System Features by Department

### IT Department
- **Ticketing System**: Create, manage, and resolve tickets
- **Access Requests**: Manage system access approvals
- **Requisitions**: Handle IT equipment requests
- **System Management**: Monitor and maintain IT infrastructure

### HR Department
- **Employee Directory**: Manage employee information
- **Registration Approvals**: Review new employee registrations
- **Role Management**: Assign and manage user roles
- **Access Management**: Control system access permissions

### Finance Department
- **Requisitions**: Handle financial equipment requests
- **Approvals**: Manage financial request approvals
- **Reporting**: Generate financial reports

### Marketing Department
- **Requisitions**: Handle marketing equipment requests
- **Approvals**: Manage marketing request approvals
- **Campaign Management**: Track marketing activities

---

## 🚨 Important Notes

1. **Core Departments**: IT, HR, and Super Admin departments are essential and cannot be removed
2. **Role Hierarchy**: Approval levels must be maintained for proper workflow
3. **Multi-Role Users**: Users can have multiple roles across departments
4. **System Protection**: Critical roles should be protected from deletion
5. **Dynamic Creation**: Additional departments and roles can be created as needed

---

## 🔧 Technical Implementation

### Database Tables
- `departments`: Stores department information
- `roles`: Stores role definitions
- `users`: Stores user information
- `user_department_roles`: Links users to departments and roles
- `access_requests`: Manages access request workflow
- `tickets`: Manages ticketing system
- `systems`: Defines available systems

### API Endpoints
- `/api/departments`: Department management
- `/api/roles`: Role management
- `/api/users`: User management
- `/api/access-requests`: Access request workflow
- `/api/tickets`: Ticket management

---

*This document should be updated whenever new departments or roles are added to the system.* 