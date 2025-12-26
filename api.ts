
import { Student, ClassSchedule } from './types';

const STORAGE_KEYS = {
  STUDENTS: 'tutortrack_students_v1',
  SCHEDULES: 'tutortrack_schedules_v1'
};

class ApiService {
  static async getStudents(): Promise<Student[]> {
    try {
      const response = await fetch('/api/students');
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(data));
          return data;
        }
      }
    } catch (e) {
      console.warn("Cloud fetch failed, using local storage.");
    }
    
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
    } catch (e) {
      console.error("Cloud save failed, data kept locally.");
    }
  }

  static async getSchedules(): Promise<ClassSchedule[]> {
    try {
      const response = await fetch('/api/schedules');
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(data));
          return data;
        }
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
