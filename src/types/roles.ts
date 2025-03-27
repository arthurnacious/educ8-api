export enum userRole {
  ADMIN = "Admin",
  FINANCE = "Finance",
  USER = "User",
}

export enum departmentRole {
  LECTURER = "Lecturer",
  LEADER = "Leader",
  STUDENT = "Student", //might use this later. not too sure
}

export enum userPrivilege {
  // Users
  CREATE_USERS = "can_create_users",
  READ_USERS = "can_read_users",
  UPDATE_USERS = "can_update_users",
  DELETE_USERS = "can_delete_users",

  // Roles
  CREATE_ROLES = "can_create_roles",
  READ_ROLES = "can_read_roles",
  UPDATE_ROLES = "can_update_roles",
  DELETE_ROLES = "can_delete_roles",

  // Departments
  CREATE_DEPARTMENTS = "can_create_departments",
  READ_DEPARTMENTS = "can_read_departments",
  UPDATE_DEPARTMENTS = "can_update_departments",
  DELETE_DEPARTMENTS = "can_delete_departments",

  // Subjects
  CREATE_SUBJECTS = "can_create_subjects",
  READ_SUBJECTS = "can_read_subjects",
  UPDATE_SUBJECTS = "can_update_subjects",
  DELETE_SUBJECTS = "can_delete_subjects",

  // courses
  CREATE_courses = "can_create_courses",
  READ_courses = "can_read_courses",
  UPDATE_courses = "can_update_courses",
  DELETE_courses = "can_delete_courses",

  // Sessions (Every lesson or a subject)
  CREATE_SESSIONS = "can_create_sessions",
  READ_SESSIONS = "can_read_sessions",
  UPDATE_SESSIONS = "can_update_sessions",
  DELETE_SESSIONS = "can_delete_sessions",
}
