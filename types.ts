
export enum PaymentStatus {
  UNPAID = 'UNPAID',
  PAID = 'PAID'
}

export enum PaymentMethod {
  NONE = 'NONE',
  TRANSFER = 'TRANSFER',
  CASH = 'CASH'
}

export enum AttendanceStatus {
  FIX = 'FIX',
  CANCELLED = 'CANCELLED',
  WAITING_5050 = 'WAITING_5050',
  WAITING_FIX = 'WAITING_FIX',
  WAITING_PUBLIC = 'WAITING_PUBLIC'
}

export interface Player {
  id: string;
  name: string;
  status: AttendanceStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  joinedAt: number;
  cancelledAt?: number;
  isLateCancel: boolean;
}

export interface Session {
  id: string;
  title: string; // New field
  date: string;
  location: string;
  maxPlayers: number;
  customMessage?: string; // New field for custom spirit/announcement
}
