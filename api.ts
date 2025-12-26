
import { Student, ClassSchedule } from './types';

class ApiService {
  static async getStudents(): Promise<Student[]> {
    try {
      const response = await fetch('/api/students');
      if (!response.ok) return [];
      return await response.json();
    } catch (e) {
      console.warn("API unavailable, running locally.");
      return [];
    }
  }

  static async saveStudents(students: Student[]): Promise<void> {
    try {
      await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(students),
      });
    } catch (e) {}
  }

  static async getSchedules(): Promise<ClassSchedule[]> {
    try {
      const response = await fetch('/api/schedules');
      if (!response.ok) return [];
      return await response.json();
    } catch (e) {
      return [];
    }
  }

  static async saveSchedules(schedules: ClassSchedule[]): Promise<void> {
    try {
      await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(schedules),
      });
    } catch (e) {}
  }
}

export default ApiService;
