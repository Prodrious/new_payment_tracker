
import { Student, ClassSchedule } from './types';

class ApiService {
  static async getStudents(): Promise<Student[]> {
    const response = await fetch('/api/students');
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to fetch students from Node backend');
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
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to save students to MongoDB');
    }
  }

  static async getSchedules(): Promise<ClassSchedule[]> {
    const response = await fetch('/api/schedules');
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to fetch schedules from Node backend');
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
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to save schedules to MongoDB');
    }
  }
}

export default ApiService;
