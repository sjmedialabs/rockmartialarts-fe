# Testing Role Permissions Management

## Quick Test Steps

### 1. Access the Feature
1. Start your development server: `npm run dev`
2. Login as Super Admin at: `https://admin.skcmines.com/superadmin/login`
3. Navigate to: **Dashboard → Settings**
4. Scroll down to find **Role Permissions Management** card (after Master Data)

### 2. Test Permission Viewing
1. Click on the **Coach** tab
2. You should see 10 permissions listed with toggles
3. By default, 7 permissions should be enabled (green)
4. Switch to **Branch Admin** tab - should show 12 permissions (11 enabled)
5. Switch to **Student** tab - should show 10 permissions (8 enabled)

### 3. Test Permission Modification
1. On the Coach tab, toggle OFF the "Students" permission
2. The "Save Changes" button should become enabled (not grayed out)
3. Toggle it back ON
4. Try toggling multiple permissions
5. Notice the count badge updates (e.g., "6/10" when one is disabled)

### 4. Test Save Functionality
1. Make a change (toggle any permission)
2. Click **Save Changes** button
3. You should see a success toast: "Permissions Saved"
4. Refresh the page
5. The changes should persist (your toggled permission stays in the same state)

### 5. Test Reset Functionality
1. Make several changes to permissions
2. Click **Reset to Default** button
3. The page will reload
4. All permissions should return to their default state
5. The localStorage item `role_permissions` should be removed

## Visual Checks

### Expected UI Elements
- ✅ Shield icon next to "Role Permissions Management" title
- ✅ Three tabs: Coach, Branch Admin, Student (each with their icon)
- ✅ Blue info box showing role details and permission count
- ✅ Each permission in a bordered card with hover effect
- ✅ Toggle switches on the right side of each permission
- ✅ Two buttons at bottom: "Reset to Default" (outline) and "Save Changes" (primary)

### Color Scheme
- Primary blue: #4F5077
- Info box: Blue background (#blue-50)
- Icons: Blue-600
- Hover: Gray-50 background

## Browser Console Tests

### Check localStorage
```javascript
// View current permissions
JSON.parse(localStorage.getItem('role_permissions'))

// Check if permissions exist
localStorage.getItem('role_permissions') !== null

// Clear permissions manually
localStorage.removeItem('role_permissions')
```

### Verify Permission Structure
```javascript
const perms = JSON.parse(localStorage.getItem('role_permissions'))
console.log(`Coach permissions: ${perms[0].permissions.length}`)
console.log(`Enabled: ${perms[0].permissions.filter(p => p.enabled).length}`)
```

## Expected Behavior

### Initial State
- No localStorage entry exists
- Component uses default permissions
- All three roles are visible

### After Making Changes
- localStorage entry created
- Badge counts update in real-time
- "Save Changes" button enabled

### After Save
- Toast notification appears
- localStorage updated
- "Save Changes" button disabled
- Changes persist across page refreshes

### After Reset
- Page reloads automatically
- localStorage cleared
- Default permissions restored

## Troubleshooting

### Component Not Showing
- Check browser console for errors
- Verify file exists: `components/role-permissions-manager.tsx`
- Check import in: `app/dashboard/settings/page.tsx`

### Toggles Not Working
- Check browser console for errors
- Verify `use-toast` hook is working
- Check if localStorage is enabled in browser

### Changes Not Persisting
- Check if localStorage is working: `localStorage.setItem('test', '123')`
- Clear browser cache and try again
- Check browser's localStorage size limit

## Success Criteria
✅ Component renders without errors
✅ Can switch between role tabs
✅ Can toggle permissions on/off
✅ Badge counts update correctly
✅ Save button enables/disables appropriately
✅ Changes persist after page refresh
✅ Reset button clears and reloads
✅ Toast notifications appear
