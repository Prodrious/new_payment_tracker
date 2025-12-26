
import { Student, ClassSchedule } from './types';

const STORAGE_KEYS = {
  STUDENTS: 'tutortrack_students',
  SCHEDULES: 'tutortrack_schedules'
};

class ApiService {
  static async getStudents(): Promise<Student[]> {
    // Try cloud first
    try {
      const response = await fetch('/api/students');
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(data));
        return data;
      }
    } catch (e) {}
    
    // Fallback to local
    const local = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    return local ? JSON.parse(local) : [];
  }

  static async saveStudents(students: Student[]): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
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
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(data));
        return data;
      }
    } catch (e) {}
    
    const local = localStorage.getItem(STORAGE_KEYS.SCHEDULES);
    return local ? JSON.parse(local) : [];
  }

  static async saveSchedules(schedules: ClassSchedule[]): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(schedules));
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
