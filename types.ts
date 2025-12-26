
export type PaymentType = 'upfront' | 'postpaid';

export interface UpfrontTopup {
  id: string;
  amount: number;
  date: string;
}

export interface Student {
  id: string;
  name: string;
  className: string;
  hourlyRate: number;
  paymentType: PaymentType;
  advancePayment: number;
  topups: UpfrontTopup[];
  createdAt: string; 
}

export type ClassStatus = 'scheduled' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid';

export interface ClassSchedule {
  id: string;
  studentId: string;
  date: string;
  startTime: string; 
  endTime: string;   
  status: ClassStatus;
  paymentStatus: PaymentStatus;
}
