import { z } from 'zod';

// Base schemas
export const emailSchema = z.string().email('Invalid email address');
export const passwordSchema = z.string().min(8, 'Password must be at least 8 characters')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number');

// User validation schemas
export const userRegistrationSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  email: emailSchema,
  password: passwordSchema,
  department_id: z.number().positive('Department is required'),
  employee_id: z.string().min(3, 'Employee ID must be at least 3 characters'),
  phone_number: z.string().optional(),
  position: z.string().optional(),
});

export const userLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

// Ticket validation schemas
export const ticketCreationSchema = z.object({
  issue_type: z.string().min(1, 'Issue type is required'),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().optional(),
  attachments: z.array(z.string()).optional(),
});

export const ticketUpdateSchema = z.object({
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']).optional(),
  assigned_to: z.number().optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  description: z.string().optional(),
  resolution_notes: z.string().optional(),
});

// Requisition validation schemas
export const requisitionCreationSchema = z.object({
  item_name: z.string().min(1, 'Item name is required'),
  quantity: z.number().positive('Quantity must be positive'),
  justification: z.string().min(10, 'Justification must be at least 10 characters'),
  urgency: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  preferred_supplier: z.string().optional(),
  budget_code: z.string().optional(),
});

export const requisitionUpdateSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected', 'assigned', 'scheduled', 'delivered']).optional(),
  assigned_to: z.number().optional(),
  approved_by: z.number().optional(),
  rejection_reason: z.string().optional(),
  delivery_notes: z.string().optional(),
});

// Access request validation schemas
export const accessRequestSchema = z.object({
  system_id: z.number().positive('System is required'),
  role_id: z.number().positive('Role is required'),
  justification: z.string().min(10, 'Justification must be at least 10 characters'),
  start_date: z.string().datetime('Invalid start date'),
  end_date: z.string().datetime('Invalid end date').optional(),
  is_permanent: z.boolean().optional(),
  access_level: z.enum(['read', 'write', 'admin']).optional(),
});

// Workflow validation schemas
export const workflowActionSchema = z.object({
  action: z.enum(['approve', 'reject', 'assign', 'skip', 'escalate']),
  comments: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

// Department and role schemas
export const departmentSchema = z.object({
  name: z.string().min(2, 'Department name must be at least 2 characters'),
  description: z.string().optional(),
  manager_id: z.number().optional(),
  budget_code: z.string().optional(),
});

export const roleSchema = z.object({
  name: z.string().min(2, 'Role name must be at least 2 characters'),
  description: z.string().optional(),
  permissions: z.array(z.string()).optional(),
  approval_level: z.number().min(1).max(5).optional(),
});

// Validation helper functions
export class ValidationHelper {
  static async validate<T>(schema: z.ZodSchema<T>, data: any): Promise<{ success: boolean; data?: T; errors?: string[] }> {
    try {
      const validatedData = await schema.parseAsync(data);
      return { success: true, data: validatedData };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const issues = (error as z.ZodError).issues;
        const errors = issues.map(err => `${(err.path || []).join('.')}: ${err.message}`);
        return { success: false, errors };
      }
      return { success: false, errors: ['Validation failed'] };
    }
  }

  static validateEmail(email: string): boolean {
    return emailSchema.safeParse(email).success;
  }

  static validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const result = passwordSchema.safeParse(password);
    if (result.success) {
      return { isValid: true, errors: [] };
    } else {
      const issues = result.error.issues;
      return { isValid: false, errors: issues.map(err => err.message) };
    }
  }

  static sanitizeInput(input: string): string {
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  static validateFileUpload(file: File, maxSize: number = 5 * 1024 * 1024): { isValid: boolean; error?: string } {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'];
    
    if (!allowedTypes.includes(file.type)) {
      return { isValid: false, error: 'File type not allowed' };
    }
    
    if (file.size > maxSize) {
      return { isValid: false, error: `File size must be less than ${maxSize / 1024 / 1024}MB` };
    }
    
    return { isValid: true };
  }

  static validateDateRange(startDate: string, endDate: string): { isValid: boolean; error?: string } {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return { isValid: false, error: 'Invalid date format' };
    }
    
    if (start >= end) {
      return { isValid: false, error: 'End date must be after start date' };
    }
    
    return { isValid: true };
  }

  static validatePriority(priority: string): boolean {
    return ['low', 'medium', 'high', 'critical'].includes(priority.toLowerCase());
  }

  static validateStatus(status: string, allowedStatuses: string[]): boolean {
    return allowedStatuses.includes(status.toLowerCase());
  }
}

 