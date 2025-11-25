# Role Permissions Management Guide

## Overview
A new **Role Permissions Management** section has been added to System Settings that allows Super Admins to view and configure what menu items and features are accessible to different user roles.

## Location
Navigate to: **Dashboard → Settings → Role Permissions Management** (below Master Data section)

## Features

### Supported Roles
The system now tracks permissions for three user roles:
1. **Coach** - Instructors who teach courses
2. **Branch Admin** - Administrators who manage branches
3. **Student** - Learners enrolled in courses

### Available Permissions
Each role can be granted access to the following features:
- Dashboard
- Students Management
- Coaches Management
- Attendance
- Messages
- Courses
- Reports
- Profile
- Settings
- Payments
- Branches
- Categories

### How to Use

#### View Permissions
1. Navigate to **Dashboard → Settings**
2. Scroll to the **Role Permissions Management** card
3. Click on any role tab (Coach, Branch Admin, or Student) to view their permissions
4. The badge shows the count of enabled permissions (e.g., "7/10")

#### Modify Permissions
1. Select the role you want to modify
2. Toggle the switch next to any permission to enable/disable it
3. Each permission shows:
   - **Permission Name** - The feature or menu item
   - **Description** - What access this permission grants
4. Click **Save Changes** when done

#### Reset to Defaults
- Click the **Reset to Default** button to restore original permission settings
- This will reload the page with factory defaults

### Current Default Permissions

#### Coach (Default: 7/10 enabled)
✅ Dashboard, Students, Attendance, Messages, Courses, Profile, Settings
❌ Reports, Payments, Branches

#### Branch Admin (Default: 11/12 enabled)
✅ Dashboard, Students, Coaches, Attendance, Messages, Courses, Reports, Profile, Settings, Payments, Branches
❌ Categories

#### Student (Default: 8/10 enabled)
✅ Dashboard, Courses, Attendance, Messages, Profile, Settings, Payments, Coaches
❌ Reports, Branches

## Technical Details

### Storage
- Permissions are currently stored in the browser's `localStorage` under the key `role_permissions`
- Changes persist across browser sessions
- Each browser/device maintains its own permission settings

### Future Enhancements
To make this production-ready, consider:
1. **Backend Integration**: Move permission storage to MongoDB
2. **API Endpoints**: Create `/api/permissions` endpoints for CRUD operations
3. **Real-time Enforcement**: Update navigation components to read from the permissions system
4. **Audit Logging**: Track who changed permissions and when
5. **Multi-tenant Support**: Different permission sets per organization/branch

### Files Modified
- `/components/role-permissions-manager.tsx` - New component for permissions UI
- `/app/dashboard/settings/page.tsx` - Added RolePermissionsManager component

## Notes
- This is currently a **viewing and configuration tool**
- To enforce these permissions in the actual navigation, you'll need to integrate the permission checks into `components/dashboard-header.tsx` and other navigation components
- Permissions are role-based, not user-specific (all coaches share the same permissions)

## Example Integration Code
To enforce permissions in navigation:

```typescript
// In dashboard-header.tsx or navigation component
const getUserPermissions = (userRole: string) => {
  const saved = localStorage.getItem("role_permissions")
  if (saved) {
    const permissions = JSON.parse(saved)
    return permissions.find((r: any) => r.role === userRole)?.permissions || []
  }
  return []
}

// Check if user has permission
const hasPermission = (permissionId: string) => {
  const permissions = getUserPermissions(userRole)
  return permissions.find((p: any) => p.id === permissionId && p.enabled)
}

// Conditionally render menu items
{hasPermission('students') && (
  <Link href="/dashboard/students">Students</Link>
)}
```
