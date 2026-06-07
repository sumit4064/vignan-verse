import { Student, Alumni, LostFoundItem, Club, Notice, FestEvent, LibraryBook, TechnicalEvent, DepartmentDetail, BorrowingRecord, AppNotification } from './types';
import { Users, GraduationCap, Trophy, PartyPopper, Library, Laptop, Search } from 'lucide-react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy, 
  setDoc,
  getDocs,
  getDoc,
  limit,
  where
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';

export const dataService = {
  // Users & Roles
  subscribeUserData: (userId: string, callback: (userData: any) => void) => {
    return onSnapshot(doc(db, 'users', userId), (snapshot) => {
      if (snapshot.exists()) {
        callback({ ...snapshot.data(), uid: userId });
      } else {
        callback(null);
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, `users/${userId}`));
  },
  subscribeUserRole: (userId: string, callback: (role: string) => void) => {
    return onSnapshot(doc(db, 'users', userId), (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data().role || 'Student');
      } else {
        callback('Student');
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, `users/${userId}`));
  },
  updateUserRole: async (userId: string, role: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), { role });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
    }
  },
  updateRegistrationNumber: async (userId: string, registrationNumber: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), { 
        registrationNumber,
        verified: true 
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
    }
  },

  // Students
  subscribeStudents: (callback: (students: Student[]) => void) => {
    const q = query(collection(db, 'students'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const students = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Student));
      callback(students);
    }, (error) => handleFirestoreError(error, OperationType.GET, 'students'));
  },
  addStudent: async (student: Omit<Student, 'id' | 'createdAt'>) => {
    try {
      const docRef = await addDoc(collection(db, 'students'), {
        ...student,
        createdAt: Date.now()
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'students');
    }
  },
  deleteStudent: async (id: string) => {
    try {
      await deleteDoc(doc(db, 'students', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `students/${id}`);
    }
  },

  // Alumni
  subscribeAlumni: (callback: (alumni: Alumni[]) => void) => {
    const q = query(collection(db, 'alumni'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const alumni = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Alumni));
      callback(alumni);
    }, (error) => handleFirestoreError(error, OperationType.GET, 'alumni'));
  },
  addAlumni: async (alumni: Omit<Alumni, 'id' | 'createdAt'>) => {
    try {
      const docRef = await addDoc(collection(db, 'alumni'), {
        ...alumni,
        createdAt: Date.now()
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'alumni');
    }
  },
  deleteAlumni: async (id: string) => {
    try {
      await deleteDoc(doc(db, 'alumni', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `alumni/${id}`);
    }
  },

  // Lost & Found
  subscribeLostFound: (callback: (items: LostFoundItem[]) => void) => {
    const q = query(collection(db, 'lostFound'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as LostFoundItem));
      callback(items);
    }, (error) => handleFirestoreError(error, OperationType.GET, 'lostFound'));
  },
  addLostFound: async (item: Omit<LostFoundItem, 'id' | 'createdAt'>) => {
    try {
      const docRef = await addDoc(collection(db, 'lostFound'), {
        ...item,
        createdAt: Date.now()
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'lostFound');
    }
  },
  resolveLostFound: async (id: string) => {
    try {
      await updateDoc(doc(db, 'lostFound', id), { status: 'Resolved' });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `lostFound/${id}`);
    }
  },
  deleteLostFound: async (id: string) => {
    try {
      await deleteDoc(doc(db, 'lostFound', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `lostFound/${id}`);
    }
  },

  // Clubs
  subscribeClubs: (callback: (clubs: Club[]) => void) => {
    return onSnapshot(collection(db, 'clubs'), (snapshot) => {
      const clubs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Club));
      callback(clubs);
    }, (error) => handleFirestoreError(error, OperationType.GET, 'clubs'));
  },
  addClub: async (club: Omit<Club, 'id'>) => {
    try {
      const docRef = await addDoc(collection(db, 'clubs'), club);
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'clubs');
    }
  },
  deleteClub: async (id: string) => {
    try {
      await deleteDoc(doc(db, 'clubs', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `clubs/${id}`);
    }
  },

  // Notices
  subscribeNotices: (callback: (notices: Notice[]) => void) => {
    const q = query(collection(db, 'notices'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const notices = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Notice));
      callback(notices);
    }, (error) => handleFirestoreError(error, OperationType.GET, 'notices'));
  },
  addNotice: async (notice: Omit<Notice, 'id' | 'createdAt' | 'date'>) => {
    try {
      const docRef = await addDoc(collection(db, 'notices'), {
        ...notice,
        createdAt: Date.now(),
        date: new Date().toISOString().split('T')[0]
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'notices');
    }
  },
  deleteNotice: async (id: string) => {
    try {
      await deleteDoc(doc(db, 'notices', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `notices/${id}`);
    }
  },

  // Notifications
  subscribeNotifications: (callback: (notifications: AppNotification[]) => void) => {
    const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as AppNotification));
      callback(notifications);
    }, (error) => handleFirestoreError(error, OperationType.GET, 'notifications'));
  },
  addNotification: async (notification: Omit<AppNotification, 'id' | 'createdAt'>) => {
    try {
      const docRef = await addDoc(collection(db, 'notifications'), {
        ...notification,
        createdAt: Date.now()
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'notifications');
    }
  },
  deleteNotification: async (id: string) => {
    try {
      await deleteDoc(doc(db, 'notifications', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `notifications/${id}`);
    }
  },

  // Fest Events
  subscribeFestEvents: (callback: (events: FestEvent[]) => void) => {
    return onSnapshot(collection(db, 'festEvents'), (snapshot) => {
      const events = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as FestEvent));
      callback(events);
    }, (error) => handleFirestoreError(error, OperationType.GET, 'festEvents'));
  },
  addFestEvent: async (event: Omit<FestEvent, 'id'>) => {
    try {
      const docRef = await addDoc(collection(db, 'festEvents'), event);
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'festEvents');
    }
  },
  deleteFestEvent: async (id: string) => {
    try {
      await deleteDoc(doc(db, 'festEvents', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `festEvents/${id}`);
    }
  },

  // Library
  subscribeLibraryBooks: (callback: (books: LibraryBook[]) => void) => {
    return onSnapshot(collection(db, 'books'), (snapshot) => {
      const books = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as LibraryBook));
      callback(books);
    }, (error) => handleFirestoreError(error, OperationType.GET, 'books'));
  },
  addLibraryBook: async (book: Omit<LibraryBook, 'id' | 'availableCopies' | 'createdAt'>) => {
    try {
      const docRef = await addDoc(collection(db, 'books'), { 
        ...book, 
        availableCopies: book.totalCopies,
        createdAt: Date.now() 
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'books');
    }
  },
  deleteLibraryBook: async (id: string) => {
    try {
      await deleteDoc(doc(db, 'books', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `books/${id}`);
    }
  },
  borrowBook: async (bookId: string, bookTitle: string, studentId: string, studentName: string) => {
    try {
      const bookRef = doc(db, 'books', bookId);
      const bookSnap = await getDoc(bookRef);
      
      if (!bookSnap.exists()) throw new Error('Book not found');
      const bookData = bookSnap.data() as LibraryBook;
      
      if (bookData.availableCopies <= 0) throw new Error('No copies available');

      const borrowDate = new Date().toISOString();
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);

      // Create borrowing record
      await addDoc(collection(db, 'borrowingRecords'), {
        bookId,
        bookTitle,
        studentId,
        studentName,
        borrowDate,
        dueDate: dueDate.toISOString(),
        status: 'Borrowed',
        fine: 0
      });

      // Update book availability
      await updateDoc(bookRef, {
        availableCopies: bookData.availableCopies - 1
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `books/${bookId}`);
    }
  },
  returnBook: async (recordId: string, bookId: string) => {
    try {
      const recordRef = doc(db, 'borrowingRecords', recordId);
      const recordSnap = await getDoc(recordRef);
      if (!recordSnap.exists()) throw new Error('Record not found');
      
      const recordData = recordSnap.data() as BorrowingRecord;
      const returnDate = new Date().toISOString();
      
      // Calculate fine if overdue
      const due = new Date(recordData.dueDate);
      const now = new Date();
      let fine = 0;
      if (now > due) {
        const diffDays = Math.ceil((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
        fine = diffDays * 5; // 5 units per day
      }

      await updateDoc(recordRef, {
        returnDate,
        status: 'Returned',
        fine
      });

      const bookRef = doc(db, 'books', bookId);
      const bookSnap = await getDoc(bookRef);
      if (bookSnap.exists()) {
        await updateDoc(bookRef, {
          availableCopies: (bookSnap.data() as LibraryBook).availableCopies + 1
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `borrowingRecords/${recordId}`);
    }
  },
  subscribeBorrowingRecords: (callback: (records: BorrowingRecord[]) => void) => {
    const q = query(collection(db, 'borrowingRecords'), orderBy('borrowDate', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const records = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as BorrowingRecord));
      callback(records);
    }, (error) => handleFirestoreError(error, OperationType.GET, 'borrowingRecords'));
  },
  subscribeStudentBorrowings: (studentId: string, callback: (records: BorrowingRecord[]) => void) => {
    const q = query(
      collection(db, 'borrowingRecords'), 
      where('studentId', '==', studentId),
      orderBy('borrowDate', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      const records = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as BorrowingRecord));
      callback(records);
    }, (error) => handleFirestoreError(error, OperationType.GET, 'borrowingRecords'));
  },

  // Tech Events
  subscribeTechnicalEvents: (callback: (events: TechnicalEvent[]) => void) => {
    return onSnapshot(collection(db, 'techEvents'), (snapshot) => {
      const events = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as TechnicalEvent));
      callback(events);
    }, (error) => handleFirestoreError(error, OperationType.GET, 'techEvents'));
  },
  addTechnicalEvent: async (event: Omit<TechnicalEvent, 'id'>) => {
    try {
      const docRef = await addDoc(collection(db, 'techEvents'), event);
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'techEvents');
    }
  },

  seedLibrary: async () => {
    const engineeringBooks = [
      {
        title: "Introduction to Algorithms",
        author: "Thomas H. Cormen",
        category: "Computer Science",
        isbn: "978-0262033848",
        description: "The standard textbook for algorithms courses worldwide, covering a broad range of algorithms in depth.",
        publisher: "MIT Press",
        totalCopies: 5,
        availableCopies: 5,
        image_url: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=800&q=80",
        createdAt: Date.now()
      },
      {
        title: "Clean Code",
        author: "Robert C. Martin",
        category: "Software Engineering",
        isbn: "978-0132350884",
        description: "A handbook of agile software craftsmanship, providing practical advice on writing better code.",
        publisher: "Prentice Hall",
        totalCopies: 3,
        availableCopies: 3,
        image_url: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&w=800&q=80",
        createdAt: Date.now()
      },
      {
        title: "The Pragmatic Programmer",
        author: "Andrew Hunt",
        category: "Software Engineering",
        isbn: "978-0135957059",
        description: "One of the most significant books in software development, offering timeless advice for developers.",
        publisher: "Addison-Wesley",
        totalCopies: 4,
        availableCopies: 4,
        image_url: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80",
        createdAt: Date.now()
      },
      {
        title: "Thermodynamics: An Engineering Approach",
        author: "Yunus Cengel",
        category: "Mechanical Engineering",
        isbn: "978-0073398174",
        description: "A comprehensive introduction to the principles of thermodynamics for engineering students.",
        publisher: "McGraw-Hill",
        totalCopies: 2,
        availableCopies: 2,
        image_url: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=800&q=80",
        createdAt: Date.now()
      },
      {
        title: "Electric Machinery Fundamentals",
        author: "Stephen J. Chapman",
        category: "Electrical Engineering",
        isbn: "978-0073529547",
        description: "A clear and accessible introduction to the principles of electric machinery.",
        publisher: "McGraw-Hill",
        totalCopies: 3,
        availableCopies: 3,
        image_url: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=800&q=80",
        createdAt: Date.now()
      },
      {
        title: "Structural Analysis",
        author: "Russell C. Hibbeler",
        category: "Civil Engineering",
        isbn: "978-0133942842",
        description: "A thorough introduction to the theory and application of structural analysis.",
        publisher: "Pearson",
        totalCopies: 2,
        availableCopies: 2,
        image_url: "https://images.unsplash.com/photo-1503387762-592be5a52680?auto=format&fit=crop&w=800&q=80",
        createdAt: Date.now()
      },
      {
        title: "Artificial Intelligence: A Modern Approach",
        author: "Stuart Russell",
        category: "Computer Science",
        isbn: "978-0136042594",
        description: "The definitive introduction to the theory and practice of artificial intelligence.",
        publisher: "Pearson",
        totalCopies: 6,
        availableCopies: 6,
        image_url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80",
        createdAt: Date.now()
      },
      {
        title: "Digital Design",
        author: "M. Morris Mano",
        category: "Electronics",
        isbn: "978-0132774208",
        description: "A classic text on digital circuits and logic design for engineering students.",
        publisher: "Pearson",
        totalCopies: 4,
        availableCopies: 4,
        image_url: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
        createdAt: Date.now()
      }
    ];

    try {
      const batch = engineeringBooks.map(book => addDoc(collection(db, 'books'), book));
      await Promise.all(batch);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'books');
    }
  },
  deleteTechnicalEvent: async (id: string) => {
    try {
      await deleteDoc(doc(db, 'techEvents', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `techEvents/${id}`);
    }
  },

  // Departments
  subscribeDepartments: (callback: (depts: DepartmentDetail[]) => void) => {
    return onSnapshot(collection(db, 'departments'), (snapshot) => {
      const depts = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as DepartmentDetail));
      callback(depts);
    }, (error) => handleFirestoreError(error, OperationType.GET, 'departments'));
  },
  addDepartment: async (dept: Omit<DepartmentDetail, 'id'>) => {
    try {
      const docRef = await addDoc(collection(db, 'departments'), dept);
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'departments');
    }
  },
  deleteDepartment: async (id: string) => {
    try {
      await deleteDoc(doc(db, 'departments', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `departments/${id}`);
    }
  },

  // Global Search
  globalSearch: async (queryStr: string) => {
    const q = queryStr.toLowerCase();
    const results: any[] = [];
    
    // Note: Global search across collections in Firestore is complex. 
    // For this app, we'll fetch limited data from each collection.
    // In a real app, you'd use a search index like Algolia.
    
    const searchInCollection = async (colName: string, type: string, icon: any, path: string, field: string = 'name') => {
      const snap = await getDocs(query(collection(db, colName), limit(20)));
      snap.docs.forEach(doc => {
        const data = doc.data();
        const val = data[field] || '';
        if (val.toLowerCase().includes(q)) {
          results.push({ title: val, type, path, icon });
        }
      });
    };

    await Promise.all([
      searchInCollection('students', 'Student', Users, '/students'),
      searchInCollection('alumni', 'Alumni', GraduationCap, '/alumni'),
      searchInCollection('clubs', 'Club', Trophy, '/clubs'),
      searchInCollection('festEvents', 'Fest Event', PartyPopper, '/fest', 'title'),
      searchInCollection('books', 'Library Book', Library, '/library', 'title'),
      searchInCollection('techEvents', 'Tech Event', Laptop, '/technical', 'title'),
      searchInCollection('lostFound', 'Lost & Found', Search, '/lostfound', 'title')
    ]);

    return results.slice(0, 8);
  },

  // Live Activity
  getLiveActivity: () => {
    return [
      { id: '1', user: 'Alice Smith', action: 'borrowed "Clean Code"', time: '2m ago', icon: Library, path: '/library' },
      { id: '2', user: 'V-Code Club', action: 'posted a new notice', time: '15m ago', icon: Trophy, path: '/clubs' },
      { id: '3', user: 'Rahul Verma', action: 'found a Silver Watch', time: '45m ago', icon: Search, path: '/lostfound' },
      { id: '4', user: 'Fest Committee', action: 'added "Code Hunt" event', time: '2h ago', icon: PartyPopper, path: '/fest' },
      { id: '5', user: 'Deepika Rao', action: 'joined as Alumni Mentor', time: '4h ago', icon: GraduationCap, path: '/alumni' },
    ];
  },

  // Seed Data
  seedInitialData: async (initialData: any) => {
    try {
      const metadataRef = doc(db, 'metadata', 'seeding');
      const metadataSnap = await getDoc(metadataRef);
      
      if (metadataSnap.exists() && metadataSnap.data().isSeeded) {
        console.log("[DEBUG] Data already seeded, skipping...");
        return;
      }

      console.log("[DEBUG] Seeding initial data...");
      
      const seedCollection = async (name: string, data: any[]) => {
        const snap = await getDocs(query(collection(db, name), limit(1)));
        if (snap.empty) {
          const promises = data.map(item => {
            const { id, ...rest } = item;
            if (id) {
              return setDoc(doc(db, name, id), rest);
            }
            return addDoc(collection(db, name), rest);
          });
          await Promise.all(promises);
        }
      };

      await Promise.all([
        seedCollection('students', initialData.students),
        seedCollection('alumni', initialData.alumni),
        seedCollection('lostFound', initialData.lostFound),
        seedCollection('clubs', initialData.clubs),
        seedCollection('notices', initialData.notices),
        seedCollection('festEvents', initialData.festEvents),
        seedCollection('books', initialData.books),
        seedCollection('techEvents', initialData.techEvents),
        seedCollection('departments', initialData.departments),
        seedCollection('notifications', initialData.notifications)
      ]);

      await setDoc(metadataRef, { isSeeded: true, seededAt: Date.now() });
      console.log("[DEBUG] Seeding completed successfully.");
    } catch (error) {
      console.error("[DEBUG] Seeding error:", error);
    }
  }
};
