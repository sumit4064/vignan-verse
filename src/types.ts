export interface Student {
  id: string;
  name: string;
  email: string;
  department: string;
  year: string;
  image_url?: string;
  photo?: string; // Base64 photo
  createdAt: number;
}

export interface Alumni {
  id: string;
  name: string;
  email: string;
  department: string;
  yearOfGraduation: string;
  image_url?: string;
  photo?: string; // Base64 photo
  createdAt: number;
}

export interface LostFoundItem {
  id: string;
  title: string;
  description: string;
  status: 'Lost' | 'Found' | 'Resolved';
  type: 'lost' | 'found';
  image?: string;
  photo?: string; // Base64 photo
  image_url?: string;
  createdAt: number;
}

export interface Club {
  id: string;
  name: string;
  description: string;
  members: number;
  achievement: string;
  president?: string;
  category?: string;
  image_url?: string;
  qualities?: string[];
}

export interface DepartmentDetail {
  id: string;
  name: string;
  fullName: string;
  description: string;
  hod: string;
  courses: string[];
  achievements: string[];
  contact: string;
  image_url?: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  department: string;
  date: string;
  createdAt: number;
}

export interface FestEvent {
  id: string;
  title: string;
  date: string;
  venue: string;
  description: string;
  category?: string;
  image_url?: string;
}

export interface LibraryBook {
  id: string;
  title: string;
  author: string;
  category: string;
  isbn?: string;
  description?: string;
  publisher?: string;
  totalCopies: number;
  availableCopies: number;
  image_url?: string;
  createdAt: number;
}

export interface BorrowingRecord {
  id: string;
  bookId: string;
  bookTitle: string;
  studentId: string;
  studentName: string;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'Borrowed' | 'Returned' | 'Overdue';
  fine: number;
}

export interface TechnicalEvent {
  id: string;
  title: string;
  type: 'Internship' | 'Hackathon' | 'Workshop' | 'Webinar';
  deadline: string;
  link: string;
  description: string;
}

export interface AppNotification {
  id: string;
  title: string;
  type: string;
  path: string;
  createdAt: number;
}

