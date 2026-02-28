# Role-Based Access Control (RBAC) Guide

## ✅ What You Have (Backend)

### 1. **User Roles System**
- Database entity has `roles: string[]` field (default: `['user']`)
- JWT payload includes roles
- Available roles: `'user'`, `'admin'` (can add more)

### 2. **Authentication Infrastructure**
- ✅ JWT Authentication
- ✅ API Key Authentication  
- ✅ OAuth42 (42 Intra)
- ✅ Auth Guards (JWT, API Key, Public)
- ✅ Roles Guard

### 3. **Backend Guards & Decorators**

**AuthGuard** - `backend/gateway/src/common/guards/auth.guard.ts`
```typescript
@Auth(AuthType.JWT)         // Requires JWT
@Auth(AuthType.PUBLIC)      // No auth needed
@Auth(AuthType.API_KEY_ONLY)
@Auth(AuthType.JWT_OR_API_KEY)
```

**RolesGuard** - `backend/gateway/src/common/guards/roles.guard.ts`
```typescript
@Roles(['admin'])           // Requires admin role
@Roles(['user'])            // Requires user role
@Roles(['user', 'admin'])   // Requires either role
@UseGuards(AuthGuard, RolesGuard)
```

**Example Backend Endpoint:**
```typescript
@Get('admin-only')
@Auth(AuthType.JWT)
@Roles(['admin'])
@UseGuards(AuthGuard, RolesGuard)
adminOnlyEndpoint() {
  // Only admins can access
}
```

---

## ✅ What I Added (Frontend)

### 1. **Updated User Interface**
File: `frontend/src/api/authentification.ts`

```typescript
export interface User {
  id: number;
  username: string;
  email: string;
  roles: string[];      // ← Now includes roles!
  createdAt: string;
  updatedAt: string;
}
```

### 2. **Role Helper Functions**
File: `frontend/src/api/authentification.ts`

```typescript
// Check if user is admin
export function isAdmin(user: User | null): boolean

// Check if user has 'user' role
export function isUser(user: User | null): boolean

// Check if user has specific role
export function hasRole(user: User | null, role: string): boolean

```

### 3. **Updated useAuth Hook**
File: `frontend/src/hooks/useAuth.tsx`

```typescript
const { 
  user,       // User object with roles
  loading,    // Loading state
  login,      // Login function
  signup,     // Signup function
  logout,     // Logout function
  isAdmin,    // boolean - is user admin?
  isUser,     // boolean - is user regular user?
  hasRole     // function - check specific role
} = useAuth();
```

---

## 📦 Example Components Created

### 1. **AdminPanel.tsx** - Admin-only component
```typescript
import { useAuth } from '../hooks/useAuth';

export default function AdminPanel() {
  const { isAdmin, user } = useAuth();
  
  if (!isAdmin) {
    return <div>Access Denied</div>;
  }
  
  return <div>Welcome Admin {user?.username}!</div>;
}
```

### 2. **RoleBasedLayout.tsx** - Different layouts per role
- **Unauthorized**: Simple nav with Login/Signup
- **Regular User**: Blue theme with standard nav
- **Admin**: Purple theme with admin sidebar

### 3. **ProtectedRoute.tsx** - Route protection
```typescript
// Protect route - requires login
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>

// Protect route - requires admin role
<ProtectedRoute requiredRole="admin">
  <AdminPanel />
</ProtectedRoute>
```

---

## 🚀 Usage Examples

### Example 1: Conditional Rendering by Role
```typescript
function MyComponent() {
  const { user, isAdmin, isUser } = useAuth();
  
  return (
    <div>
      {/* Show to everyone */}
      <h1>Welcome!</h1>
      
      {/* Show only to logged-in users */}
      {user && <p>Hello, {user.username}</p>}
      
      {/* Show only to admins */}
      {isAdmin && <button>Admin Settings</button>}
      
      {/* Show only to regular users */}
      {isUser && !isAdmin && <p>Regular user content</p>}
    </div>
  );
}
```

### Example 2: Protected Admin Page
```typescript
// pages/AdminPage.tsx
import ProtectedRoute from '../components/ProtectedRoute';
import AdminPanel from '../components/AdminPanel';

export default function AdminPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminPanel />
    </ProtectedRoute>
  );
}
```

### Example 3: Role-Based Navigation
```typescript
function Navigation() {
  const { user, isAdmin } = useAuth();
  
  return (
    <nav>
      <a href="/">Home</a>
      {user && <a href="/dashboard">Dashboard</a>}
      {isAdmin && <a href="/admin">Admin Panel</a>}
    </nav>
  );
}
```

---

## 🔧 How to Create Admin Users

### Option 1: Database Direct
```sql
-- Connect to database
docker exec -it db-dev psql -U transcendence -d transcendence

-- Update user to admin
UPDATE users SET roles = ARRAY['user', 'admin'] WHERE username = 'your_username';

-- Or create admin-only user
UPDATE users SET roles = ARRAY['admin'] WHERE username = 'admin_user';
```

### Option 2: Create Backend Endpoint (Recommended)
Add to `backend/core/src/users/users.controller.ts`:

```typescript
@Patch('id/:id/roles')
@Auth(AuthType.JWT)
@Roles(['admin'])  // Only admins can change roles
@UseGuards(AuthGuard, RolesGuard)
updateUserRoles(
  @Param('id', ParseIntPipe) id: number,
  @Body() body: { roles: string[] }
) {
  return this.usersService.updateRoles(id, body.roles);
}
```

Then add service method in `users.service.ts`:
```typescript
async updateRoles(id: number, roles: string[]) {
  const user = await this.usersRepo.findOneBy({ id });
  if (!user) throw new NotFoundException();
  
  user.roles = roles;
  return this.usersRepo.save(user);
}
```

---

## 🎨 Layout Differences

### Unauthorized User
- Simple header with Login/Signup buttons
- Limited navigation
- Public content only

### Regular User (role: 'user')
- Blue theme
- User navigation menu
- Access to user features
- Logout button

### Admin (role: 'admin')
- Purple theme  
- Admin sidebar with:
  - User Management
  - Settings
  - Analytics
  - Link to User View
- Full access to all features

---

## 🔒 Security Notes

1. **Always protect admin routes** with `@Roles(['admin'])` on backend
2. **Frontend role checks are cosmetic** - real security is on backend
3. **Use RolesGuard with AuthGuard** together for proper protection
4. **Test with different roles** to ensure proper access control

---

## 📝 To Do Next

1. ✅ Update User interface to include roles
2. ✅ Add role helper functions
3. ✅ Update useAuth hook
4. ✅ Create example components
5. ⚠️ **Create your first admin user** (see "How to Create Admin Users")
6. ⚠️ **Test the role-based layouts**
7. ⚠️ **Add admin-only backend endpoints** if needed
8. ⚠️ **Create admin management pages** (user management, etc.)

---

## 🧪 Testing

### Test as Unauthorized User
1. Open app in incognito mode
2. Should see login/signup layout

### Test as Regular User
1. Login with regular account
2. Should see blue user layout
3. Should NOT see admin links

### Test as Admin
1. Create admin user (see above)
2. Login with admin account
3. Should see purple admin layout
4. Should see admin sidebar
5. Should have access to all features

---

## Need Help?

Check the example files:
- `frontend/src/components/AdminPanel.tsx`
- `frontend/src/components/RoleBasedLayout.tsx`
- `frontend/src/components/ProtectedRoute.tsx`
- `frontend/src/hooks/useAuth.tsx`
- `frontend/src/api/authentification.ts`
