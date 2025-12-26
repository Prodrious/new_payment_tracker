
import { Student, ClassSchedule } from './types';

class ApiService {
  /**
   * These calls now target the Vercel /api routes which connect to MongoDB.
   */
  static async getStudents(): Promise<Student[]> {
    const response = await fetch('/api/students');
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch students from DB');
    }
    return response.json();
  }

  static async saveStudents(students: Student[]): Promise<void> {
    const response = await fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(students),
    });
    if (!response.ok) {
      throw new Error('Failed to save students to DB');
    }
  }

  static async getSchedules(): Promise<ClassSchedule[]> {
    const response = await fetch('/api/schedules');
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch schedules from DB');
    }
    return response.json();
  }

  static async saveSchedules(schedules: ClassSchedule[]): Promise<void> {
    const response = await fetch('/api/schedules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(schedules),
    });
    if (!response.ok) {
      throw new Error('Failed to save schedules to DB');
    }
  }
}

export default ApiService;
