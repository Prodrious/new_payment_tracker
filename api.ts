
import { Student, ClassSchedule } from './types';

class ApiService {
  static async getStudents(): Promise<Student[]> {
    const response = await fetch('/api/students');
    if (!response.ok) throw new Error('Failed to fetch students');
    return response.json();
  }

  static async saveStudents(students: Student[]): Promise<void> {
    await fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(students),
    });
  }

  static async getSchedules(): Promise<ClassSchedule[]> {
    const response = await fetch('/api/schedules');
    if (!response.ok) throw new Error('Failed to fetch schedules');
    return response.json();
  }

  static async saveSchedules(schedules: ClassSchedule[]): Promise<void> {
    await fetch('/api/schedules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(schedules),
    });
  }
}

export default ApiService;
