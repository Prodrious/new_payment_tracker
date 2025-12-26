
import { Student, ClassSchedule } from './types';

class ApiService {
  static async getStudents(): Promise<Student[]> {
    const response = await fetch('/api/students');
    if (!response.ok) throw new Error('Failed to fetch students from Node backend');
    return response.json();
  }

  static async saveStudents(students: Student[]): Promise<void> {
    const response = await fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(students),
    });
    if (!response.ok) throw new Error('Failed to save students to MongoDB');
  }

  static async getSchedules(): Promise<ClassSchedule[]> {
    const response = await fetch('/api/schedules');
    if (!response.ok) throw new Error('Failed to fetch schedules from Node backend');
    return response.json();
  }

  static async saveSchedules(schedules: ClassSchedule[]): Promise<void> {
    const response = await fetch('/api/schedules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(schedules),
    });
    if (!response.ok) throw new Error('Failed to save schedules to MongoDB');
  }
}

export default ApiService;
