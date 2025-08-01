# HR Module - Refactored Structure

This directory contains the refactored HR module with a proper component-based architecture and navigation structure.

## Structure

```
hr/
├── components/           # Reusable UI components
│   ├── HRNavbar.tsx     # Navigation header
│   ├── HRSidebar.tsx    # Sidebar navigation
│   ├── HRLayout.tsx     # Main layout wrapper
│   ├── StatCard.tsx     # Statistics card component
│   ├── ActionButton.tsx # Action button component
│   ├── StatusBadge.tsx  # Status indicator component
│   ├── Overview.tsx     # Dashboard overview component
│   ├── EmployeeRegistrations.tsx # Employee registration management
│   ├── AccessManagement.tsx # Access request management
│   ├── EmployeeDirectory.tsx # Employee directory
│   ├── loading.tsx      # Loading component
│   └── index.ts         # Component exports
├── registrations/        # Employee registrations page
│   └── page.tsx
├── access-management/    # Access management page
│   └── page.tsx
├── directory/           # Employee directory page
│   └── page.tsx
├── page.tsx            # Main HR dashboard (overview)
└── README.md           # This file
```

## Components

### Layout Components
- **HRNavbar**: Header with user info and notifications
- **HRSidebar**: Navigation sidebar with module links and quick actions
- **HRLayout**: Main layout wrapper that combines navbar and sidebar

### UI Components
- **StatCard**: Reusable statistics card with icon and subtitle
- **ActionButton**: Button component with different variants (primary, secondary, success, danger)
- **StatusBadge**: Status indicator with color coding

### Feature Components
- **Overview**: Dashboard overview with stats and recent activity
- **EmployeeRegistrations**: Employee registration management with table and actions
- **AccessManagement**: Access request and revocation management
- **EmployeeDirectory**: Employee directory with search and management features

## Navigation

The HR module now uses proper Next.js routing:

- `/administration/hr` - Overview/Dashboard
- `/administration/hr/registrations` - Employee Registrations
- `/administration/hr/access-management` - Access Management
- `/administration/hr/directory` - Employee Directory

## Features

### Overview Page
- Statistics cards showing key metrics
- Urgent employee registrations
- Recent HR activity feed

### Employee Registrations
- Table view of all registration requests
- Search and filter functionality
- Bulk selection and actions
- Status management (approve/reject)

### Access Management
- Access request tracking
- Revocation request management
- System access overview

### Employee Directory
- Complete employee listing
- Search and filter capabilities
- Individual employee actions
- System access management

## Benefits of Refactoring

1. **Modularity**: Each feature is now in its own component
2. **Reusability**: Common UI components can be reused
3. **Maintainability**: Easier to maintain and update individual features
4. **Navigation**: Proper routing with Next.js file-based routing
5. **Performance**: Better code splitting and lazy loading
6. **Scalability**: Easy to add new features and components

## Usage

```tsx
// Import components
import { HRLayout, Overview } from './components';

// Use in pages
const HRDashboard = () => (
  <HRLayout>
    <Overview />
  </HRLayout>
);
```

## Styling

The module uses Tailwind CSS with a consistent color scheme:
- Primary: Sky blue (`sky-600`)
- Success: Green (`green-600`)
- Warning: Orange (`orange-600`)
- Danger: Red (`red-600`)
- Background: Duck egg (`#F0F8F8`) 