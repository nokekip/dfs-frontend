/**
 * Mock Data Store
 * Simulates Django database with localStorage persistence
 */

import { 
  User, 
  Teacher, 
  Document, 
  DocumentCategory, 
  ActivityLog, 
  DashboardStats,
  TeacherDashboardStats,
  SystemSettings,
  SecuritySettings,
  Notification
} from './types';

// Storage keys
const STORAGE_KEYS = {
  USERS: 'dfs_users',
  TEACHERS: 'dfs_teachers',
  DOCUMENTS: 'dfs_documents',
  CATEGORIES: 'dfs_categories',
  ACTIVITY_LOGS: 'dfs_activity_logs',
  SYSTEM_SETTINGS: 'dfs_system_settings',
  SECURITY_SETTINGS: 'dfs_security_settings',
  NOTIFICATIONS: 'dfs_notifications',
  AUTH_TOKEN: 'dfs_auth_token',
  CURRENT_USER: 'dfs_current_user',
} as const;

// Helper functions for localStorage
const getFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const saveToStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

// Initial mock data
const INITIAL_USERS: User[] = [
  {
    id: 'admin-1',
    email: 'admin@school.co.ke',
    firstName: 'System',
    lastName: 'Administrator',
    role: 'admin',
    isActive: true,
    dateJoined: '2024-01-01T00:00:00Z',
    lastLogin: '2024-01-20T10:30:00Z',
  },
  {
    id: 'teacher-1',
    email: 'teacher@school.co.ke',
    firstName: 'Jane',
    lastName: 'Mwangi',
    role: 'teacher',
    isActive: true,
    dateJoined: '2024-01-15T00:00:00Z',
    lastLogin: '2024-01-20T09:15:00Z',
  },
  {
    id: 'teacher-2',
    email: 'john.kiprotich@school.co.ke',
    firstName: 'John',
    lastName: 'Kiprotich',
    role: 'teacher',
    isActive: true,
    dateJoined: '2024-01-10T00:00:00Z',
    lastLogin: '2024-01-19T14:20:00Z',
  },
  {
    id: 'teacher-3',
    email: 'mary.ochieng@school.co.ke',
    firstName: 'Mary',
    lastName: 'Ochieng',
    role: 'teacher',
    isActive: true,
    dateJoined: '2024-01-20T00:00:00Z',
  },
];

const INITIAL_TEACHERS: Teacher[] = [
  {
    id: 'teacher-1',
    user: INITIAL_USERS.find(u => u.id === 'teacher-1')!,
    phoneNumber: '+254 712 345 678',
    bio: 'Passionate educator with 8 years of experience in primary education.',
    status: 'active',
    approvedBy: 'admin-1',
    approvedAt: '2024-01-15T10:00:00Z',
    documentsCount: 24,
    sharedDocumentsCount: 8,
    totalDownloads: 156,
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-20T09:15:00Z',
  },
  {
    id: 'teacher-2',
    user: INITIAL_USERS.find(u => u.id === 'teacher-2')!,
    phoneNumber: '+254 723 456 789',
    bio: 'Mathematics and Science teacher focused on innovative teaching methods.',
    status: 'active',
    approvedBy: 'admin-1',
    approvedAt: '2024-01-10T11:00:00Z',
    documentsCount: 18,
    sharedDocumentsCount: 5,
    totalDownloads: 89,
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-19T14:20:00Z',
  },
  {
    id: 'teacher-3',
    user: INITIAL_USERS.find(u => u.id === 'teacher-3')!,
    phoneNumber: '+254 734 567 890',
    bio: 'Early childhood education specialist with a focus on literacy development.',
    status: 'pending',
    documentsCount: 0,
    sharedDocumentsCount: 0,
    totalDownloads: 0,
    createdAt: '2024-01-20T00:00:00Z',
    updatedAt: '2024-01-20T00:00:00Z',
  },
];

const INITIAL_CATEGORIES: DocumentCategory[] = [
  {
    id: 'cat-1',
    name: 'Lesson Plans',
    description: 'Teaching plans and curriculum materials for daily lessons',
    requiresClassSubject: true,
    documentsCount: 45,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 'cat-2',
    name: 'Assessment Reports',
    description: 'Student assessment results and progress reports',
    requiresClassSubject: true,
    documentsCount: 32,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-12T00:00:00Z',
  },
  {
    id: 'cat-3',
    name: 'Student Records',
    description: 'Individual student files and academic records',
    requiresClassSubject: true,
    documentsCount: 28,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-10T00:00:00Z',
  },
  {
    id: 'cat-4',
    name: 'Administrative Forms',
    description: 'School administrative documents and forms',
    requiresClassSubject: false,
    documentsCount: 15,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-08T00:00:00Z',
  },
  {
    id: 'cat-5',
    name: 'Professional Development',
    description: 'Training materials and professional growth documents',
    requiresClassSubject: false,
    documentsCount: 12,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-05T00:00:00Z',
  },
  {
    id: 'cat-6',
    name: 'Meeting Minutes',
    description: 'Records of staff meetings and conferences',
    requiresClassSubject: false,
    documentsCount: 8,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-03T00:00:00Z',
  },
];

const INITIAL_DOCUMENTS: Document[] = [
  {
    id: 'doc-1',
    title: 'Mathematics Lesson Plan - Week 5',
    description: 'Comprehensive lesson plan covering fractions and decimals for Grade 4',
    category: INITIAL_CATEGORIES[0],
    teacher: INITIAL_TEACHERS[0],
    fileName: 'math-lesson-week5.pdf',
    fileSize: 2048000, // 2MB
    fileType: 'application/pdf',
    filePath: '/uploads/documents/math-lesson-week5.pdf',
    classLevel: 'Grade 4',
    subject: 'Mathematics',
    isShared: true,
    sharedWith: ['teacher-2', 'teacher-3'], // Shared with other teachers
    sharedAt: '2024-01-18T00:00:00Z',
    downloadCount: 23,
    status: 'active',
    tags: ['mathematics', 'fractions', 'grade4'],
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-18T00:00:00Z',
  },
  {
    id: 'doc-2',
    title: 'Science Assessment Template',
    description: 'Standardized assessment template for science subjects',
    category: INITIAL_CATEGORIES[1],
    teacher: INITIAL_TEACHERS[1],
    fileName: 'science-assessment-template.docx',
    fileSize: 1024000, // 1MB
    fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    filePath: '/uploads/documents/science-assessment-template.docx',
    classLevel: 'Grade 5',
    subject: 'Science',
    isShared: true,
    sharedWith: ['teacher-1', 'teacher-3'], // Shared with other teachers
    sharedAt: '2024-01-17T00:00:00Z',
    downloadCount: 18,
    status: 'flagged',
    tags: ['science', 'assessment', 'template'],
    createdAt: '2024-01-14T16:45:00Z',
    updatedAt: '2024-01-17T00:00:00Z',
  },
  {
    id: 'doc-3',
    title: 'Archived History Worksheet',
    description: 'Old worksheet about World War 2 for Grade 6',
    category: INITIAL_CATEGORIES[2],
    teacher: INITIAL_TEACHERS[0],
    fileName: 'history-ww2-worksheet.pdf',
    fileSize: 1536000, // 1.5MB
    fileType: 'application/pdf',
    filePath: '/uploads/documents/history-ww2-worksheet.pdf',
    classLevel: 'Grade 6',
    subject: 'History',
    isShared: false,
    sharedWith: [], // Not shared
    sharedAt: null,
    downloadCount: 5,
    status: 'archived',
    tags: ['history', 'ww2', 'grade6'],
    createdAt: '2024-01-10T09:20:00Z',
    updatedAt: '2024-01-12T00:00:00Z',
  },
];

const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: 'log-1',
    user: INITIAL_USERS[1],
    action: 'upload',
    targetType: 'document',
    targetId: 'doc-1',
    targetName: 'Mathematics Lesson Plan - Week 5',
    description: 'uploaded "Mathematics Lesson Plan - Week 5"',
    createdAt: '2024-01-15T10:30:00Z',
  },
  {
    id: 'log-2',
    user: INITIAL_USERS[2],
    action: 'share',
    targetType: 'document',
    targetId: 'doc-2',
    targetName: 'Science Assessment Template',
    description: 'shared "Science Assessment Template"',
    createdAt: '2024-01-15T09:15:00Z',
  },
  {
    id: 'log-3',
    user: INITIAL_USERS[1],
    action: 'login',
    description: 'logged into the system',
    createdAt: '2024-01-15T08:00:00Z',
  },
];

const INITIAL_SYSTEM_SETTINGS: SystemSettings = {
  siteName: 'Digital Filing System for Teachers',
  siteDescription: 'Kenya Teacher Document Management System',
  maxFileSize: 10, // MB
  allowedFileTypes: ['pdf', 'docx', 'xlsx', 'pptx', 'jpg', 'png'],
  sessionTimeout: 30, // minutes
  maintenanceMode: false,
  registrationEnabled: true,
  requireAdminApproval: true,
};

const INITIAL_SECURITY_SETTINGS: SecuritySettings = {
  twoFactorRequired: true,
  enableAuditLogs: true,
};

// Mock Data Store Class
export class MockDataStore {
  private static instance: MockDataStore;

  public static getInstance(): MockDataStore {
    if (!MockDataStore.instance) {
      MockDataStore.instance = new MockDataStore();
    }
    return MockDataStore.instance;
  }

  constructor() {
    this.initializeData();
  }

  private initializeData(): void {
    // Initialize data if not exists
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      this.saveUsers(INITIAL_USERS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.TEACHERS)) {
      this.saveTeachers(INITIAL_TEACHERS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
      this.saveCategories(INITIAL_CATEGORIES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.DOCUMENTS)) {
      this.saveDocuments(INITIAL_DOCUMENTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.ACTIVITY_LOGS)) {
      this.saveActivityLogs(INITIAL_ACTIVITY_LOGS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SYSTEM_SETTINGS)) {
      this.saveSystemSettings(INITIAL_SYSTEM_SETTINGS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SECURITY_SETTINGS)) {
      this.saveSecuritySettings(INITIAL_SECURITY_SETTINGS);
    }
  }

  // Users
  getUsers(): User[] {
    return getFromStorage(STORAGE_KEYS.USERS, []);
  }

  saveUsers(users: User[]): void {
    saveToStorage(STORAGE_KEYS.USERS, users);
  }

  // Teachers
  getTeachers(): Teacher[] {
    return getFromStorage(STORAGE_KEYS.TEACHERS, []);
  }

  saveTeachers(teachers: Teacher[]): void {
    saveToStorage(STORAGE_KEYS.TEACHERS, teachers);
  }

  // Documents
  getDocuments(): Document[] {
    return getFromStorage(STORAGE_KEYS.DOCUMENTS, []);
  }

  saveDocuments(documents: Document[]): void {
    saveToStorage(STORAGE_KEYS.DOCUMENTS, documents);
  }

  // Categories
  getCategories(): DocumentCategory[] {
    return getFromStorage(STORAGE_KEYS.CATEGORIES, []);
  }

  saveCategories(categories: DocumentCategory[]): void {
    saveToStorage(STORAGE_KEYS.CATEGORIES, categories);
  }

  // Activity Logs
  getActivityLogs(): ActivityLog[] {
    return getFromStorage(STORAGE_KEYS.ACTIVITY_LOGS, []);
  }

  saveActivityLogs(logs: ActivityLog[]): void {
    saveToStorage(STORAGE_KEYS.ACTIVITY_LOGS, logs);
  }

  // Settings
  getSystemSettings(): SystemSettings {
    return getFromStorage(STORAGE_KEYS.SYSTEM_SETTINGS, INITIAL_SYSTEM_SETTINGS);
  }

  saveSystemSettings(settings: SystemSettings): void {
    saveToStorage(STORAGE_KEYS.SYSTEM_SETTINGS, settings);
  }

  getSecuritySettings(): SecuritySettings {
    return getFromStorage(STORAGE_KEYS.SECURITY_SETTINGS, INITIAL_SECURITY_SETTINGS);
  }

  saveSecuritySettings(settings: SecuritySettings): void {
    saveToStorage(STORAGE_KEYS.SECURITY_SETTINGS, settings);
  }

  // Notifications
  getNotifications(): Notification[] {
    return getFromStorage(STORAGE_KEYS.NOTIFICATIONS, []);
  }

  saveNotifications(notifications: Notification[]): void {
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
  }

  // Authentication
  getCurrentUser(): User | null {
    return getFromStorage(STORAGE_KEYS.CURRENT_USER, null);
  }

  saveCurrentUser(user: User | null): void {
    saveToStorage(STORAGE_KEYS.CURRENT_USER, user);
  }

  getAuthToken(): string | null {
    return getFromStorage(STORAGE_KEYS.AUTH_TOKEN, null);
  }

  saveAuthToken(token: string | null): void {
    saveToStorage(STORAGE_KEYS.AUTH_TOKEN, token);
  }

  // Utility methods
  generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  addActivityLog(log: Omit<ActivityLog, 'id' | 'createdAt'>): void {
    const logs = this.getActivityLogs();
    const newLog: ActivityLog = {
      ...log,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
    };
    logs.unshift(newLog); // Add to beginning
    this.saveActivityLogs(logs.slice(0, 100)); // Keep only last 100 logs
  }

  // Dashboard stats computation
  getDashboardStats(): DashboardStats {
    const teachers = this.getTeachers();
    const documents = this.getDocuments();
    const categories = this.getCategories();
    const activityLogs = this.getActivityLogs();

    return {
      totalTeachers: teachers.length,
      activeTeachers: teachers.filter(t => t.status === 'active').length,
      pendingTeachers: teachers.filter(t => t.status === 'pending').length,
      suspendedTeachers: teachers.filter(t => t.status === 'suspended').length,
      totalDocuments: documents.length,
      sharedDocuments: documents.filter(d => d.isShared).length,
      totalCategories: categories.length,
      activeCategories: categories.filter(c => c.isActive).length,
      totalDownloads: documents.reduce((sum, doc) => sum + doc.downloadCount, 0),
      recentActivity: activityLogs.slice(0, 10),
      documentsUploadedToday: documents.filter(d => 
        new Date(d.createdAt).toDateString() === new Date().toDateString()
      ).length,
      documentsUploadedThisWeek: documents.filter(d => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return new Date(d.createdAt) >= weekAgo;
      }).length,
      documentsUploadedThisMonth: documents.filter(d => {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return new Date(d.createdAt) >= monthAgo;
      }).length,
    };
  }

  getTeacherDashboardStats(teacherId: string): TeacherDashboardStats {
    const documents = this.getDocuments().filter(d => d.teacher.id === teacherId);
    const activityLogs = this.getActivityLogs().filter(log => log.user.id === teacherId);
    const categories = this.getCategories();

    const categoryBreakdown = categories.map(cat => ({
      category: cat.name,
      count: documents.filter(d => d.category.id === cat.id).length,
    })).filter(item => item.count > 0);

    return {
      documentsUploaded: documents.length,
      documentsShared: documents.filter(d => d.isShared).length,
      totalDownloads: documents.reduce((sum, doc) => sum + doc.downloadCount, 0),
      recentDocuments: documents.slice(0, 5),
      recentActivity: activityLogs.slice(0, 10),
      categoryBreakdown,
    };
  }

  // Clear all data (for testing)
  clearAllData(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    this.initializeData();
  }

  // Refresh only documents data
  refreshDocuments(): void {
    localStorage.removeItem(STORAGE_KEYS.DOCUMENTS);
    this.saveDocuments(INITIAL_DOCUMENTS);
  }
}

// Export singleton instance
export const mockDataStore = MockDataStore.getInstance();
export default mockDataStore;
