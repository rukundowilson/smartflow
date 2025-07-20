# smart flow

A centralized internal web app for managing IT support operations including ticket tracking, system access requests, access revocations, and IT item requisitions.

---

## 🚀 Tech Stack

| Layer        | Tech                             |
|--------------|----------------------------------|
| Frontend     | [Next.js](https://nextjs.org/) with TypeScript |
| Backend      | [Node.js](https://nodejs.org/) with Express.js |
| Database     | [MySQL](https://www.mysql.com/)  |
| Auth         | JWT-based authentication (optional: OTP/Email Link verification) |
| ORM/Query    | Raw SQL or Query Builder (e.g., knex.js or sequelize) |
| Deployment   | (To be added: Vercel, Render, Railway, etc.) |

---

## 📌 Features

### ✅ Core Modules

1. **IT Ticketing Tool**
   - Report technical issues
   - Track issue progress
   - Assign and resolve tickets

2. **IT Access Request**
   - HR or Managers request system access for employees
   - Approval workflow by IT team

3. **IT Access Revocation**
   - Securely revoke system access for exiting or flagged staff

4. **IT Item Requisition**
   - Employees request IT assets like laptops, printers, and cables
   - Track request approvals and delivery

---

## 👤 User Roles & Permissions

| Role        | Permissions                                      |
|-------------|--------------------------------------------------|
| Super Admin | Add HR, manage all users, oversee all activity   |
| HR          | Approve employee registrations, request/revoke access |
| IT Staff    | Manage tickets, approve requests, deliver items  |
| Employee    | Submit tickets and requests                      |

---

## 🔐 Registration & Access Flow

- **Super Admin** adds HR users manually
- **Employees** apply for registration → HR approves/rejects
- **Access Links** expire after 24 hours for security
- Email confirmation and authentication planned

---

## 🗃️ Database Structure (Simplified)

### Example Tables:
- `users` – stores employees, HR, IT, and admins
- `tickets` – for IT support issues
- `access_requests` – new system access requests
- `revocations` – access removals
- `item_requests` – laptop, printer, cable requests
- `registration_tokens` – time-limited registration links
