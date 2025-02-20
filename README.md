# Academic System API Design

This document outlines the RESTful API design for an academic system with users (admin, staff, students) and departments.

## User Role Structure

The system implements a two-level role structure:
1. **Primary Roles**: Admin, Staff, Student (stored in the `users` table)
2. **Staff Roles**: Within departments, staff members can have specific roles like Leader or Lecturer (stored in the `department_staff` pivot table)

## Database Schema Overview

```
users
  - id
  - name
  - email
  - role (enum: admin, staff, student)
  
departments
  - id
  - name
  - description
  
department_staff (pivot table)
  - id
  - user_id (foreign key to users)
  - department_id (foreign key to departments)
  - role (enum: leader, lecturer)
```

## API Endpoints

### User Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/users` | GET | Get all users with optional role filtering (`?role=staff`) |
| `/users/{userId}` | GET | Get a specific user by ID |
| `/users/{userId}` | PUT | Update a specific user |
| `/users/{userId}` | DELETE | Delete a specific user |
| `/users` | POST | Create a new user |

### Staff-Specific Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/staff` | GET | Get all staff members |
| `/staff/{staffId}/departments` | GET | Get all departments associated with a specific staff member |
| `/staff/departments` | GET | Get departments for the currently authenticated staff member |

### Department Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/departments` | GET | Get all departments |
| `/departments/{departmentId}` | GET | Get a specific department by ID |
| `/departments` | POST | Create a new department |
| `/departments/{departmentId}` | PUT | Update a specific department |
| `/departments/{departmentId}` | DELETE | Delete a specific department |

### Department Staff Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/departments/{departmentId}/staff` | GET | Get all staff in a department with optional role filtering (`?role=lecturer`) |
| `/departments/{departmentId}/staff/{staffId}` | GET | Get a specific staff member in a department |
| `/departments/{departmentId}/staff` | POST | Assign a staff member to a department with a specific role |
| `/departments/{departmentId}/staff/{staffId}` | PUT | Update a staff member's role within a department |
| `/departments/{departmentId}/staff/{staffId}` | DELETE | Remove a staff member from a department |

## Implementation Example

Using Drizzle ORM and Hono framework for the staff endpoints:

```typescript
// Get all staff members
app.get('/staff', async (c) => {
  try {
    const staffMembers = await db
      .select()
      .from(users)
      .where(eq(users.role, 'staff'));
    
    return c.json(staffMembers);
  } catch (error) {
    console.error('Error fetching staff:', error);
    return c.json({ error: 'Failed to fetch staff' }, 500);
  }
});

// Get departments for a specific staff member with their role
app.get('/staff/:staffId/departments', async (c) => {
  const staffId = c.req.param('staffId');
  
  try {
    const staffDepartments = await db
      .select({
        departmentId: departments.id,
        departmentName: departments.name, 
        staffRole: departmentStaff.role
      })
      .from(departmentStaff)
      .innerJoin(departments, eq(departmentStaff.departmentId, departments.id))
      .where(eq(departmentStaff.userId, parseInt(staffId)));
    
    return c.json(staffDepartments);
  } catch (error) {
    return c.json({ error: 'Failed to fetch departments' }, 500);
  }
});

// Get staff in a specific department, optionally filtered by role
app.get('/departments/:departmentId/staff', async (c) => {
  const departmentId = c.req.param('departmentId');
  const staffRole = c.req.query('role');
  
  try {
    let query = db
      .select({
        userId: users.id,
        name: users.name,
        email: users.email,
        staffRole: departmentStaff.role
      })
      .from(departmentStaff)
      .innerJoin(users, eq(departmentStaff.userId, users.id))
      .where(eq(departmentStaff.departmentId, parseInt(departmentId)));
    
    if (staffRole) {
      query = query.where(and(
        eq(departmentStaff.departmentId, parseInt(departmentId)),
        eq(departmentStaff.role, staffRole)
      ));
    }
    
    const departmentStaffMembers = await query;
    return c.json(departmentStaffMembers);
  } catch (error) {
    return c.json({ error: 'Failed to fetch department staff' }, 500);
  }
});
```

## Benefits of This Design

1. **Clean Separation of Concerns**: Primary roles (admin, staff, student) are separate from department roles (leader, lecturer)
2. **RESTful Structure**: Resources are clearly defined with appropriate endpoints
3. **Flexible Querying**: Filter parameters allow for versatile data access
4. **Hierarchical Relationships**: The API structure reflects the organizational hierarchy

## Authentication and Authorization

All endpoints should implement:
- Authentication to verify user identity
- Authorization to ensure users can only access resources appropriate to their role
