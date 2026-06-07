import React, { useState, useEffect } from 'react';
import { Book, Plus, Trash2, X, Search, Filter, Clock, User, AlertCircle, History, CheckCircle2, AlertTriangle } from 'lucide-react';
import { dataService } from '../dataService';
import { LibraryBook, BorrowingRecord, Student } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { auth } from '../firebase';

interface LibraryPageProps {
  currentRole: string;
}

const Library: React.FC<LibraryPageProps> = ({ currentRole }) => {
  const [books, setBooks] = useState<LibraryBook[]>([]);
  const [records, setRecords] = useState<BorrowingRecord[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [activeBookId, setActiveBookId] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [formData, setFormData] = useState({ 
    title: '', 
    author: '', 
    category: 'Technical',
    isbn: '',
    description: '',
    publisher: '',
    totalCopies: 1
  });

  const currentUser = auth.currentUser;

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    const unsubBooks = dataService.subscribeLibraryBooks(setBooks);
    const unsubStudents = dataService.subscribeStudents(setStudents);
    
    let unsubRecords: () => void;
    if (currentRole === 'Admin') {
      unsubRecords = dataService.subscribeBorrowingRecords(setRecords);
    } else if (currentUser) {
      unsubRecords = dataService.subscribeStudentBorrowings(currentUser.uid, setRecords);
    }

    return () => {
      unsubBooks();
      unsubStudents();
      if (unsubRecords) unsubRecords();
    };
  }, [currentRole, currentUser]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await dataService.addLibraryBook({
      ...formData,
      totalCopies: Number(formData.totalCopies)
    });
    setShowAddModal(false);
    setFormData({ title: '', author: '', category: 'Technical', isbn: '', description: '', publisher: '', totalCopies: 1 });
    setToast({ message: 'RESOURCE_INITIALIZED', type: 'success' });
  };

  const handleBorrow = async (book: LibraryBook) => {
    if (!currentUser) {
      setToast({ message: 'PLEASE_LOGIN_FIRST', type: 'error' });
      return;
    }

    const student = students.find(s => s.email === currentUser.email);
    if (!student) {
      setToast({ message: 'STUDENT_PROFILE_NOT_FOUND', type: 'error' });
      return;
    }

    try {
      await dataService.borrowBook(book.id, book.title, currentUser.uid, student.name);
      setToast({ message: 'BORROW_SUCCESSFUL', type: 'success' });
    } catch (error) {
      setToast({ message: 'BORROW_FAILED', type: 'error' });
    }
  };

  const handleReturn = async (record: BorrowingRecord) => {
    try {
      await dataService.returnBook(record.id, record.bookId);
      setToast({ message: 'RETURN_SUCCESSFUL', type: 'success' });
    } catch (error) {
      setToast({ message: 'RETURN_FAILED', type: 'error' });
    }
  };

  const handleSeed = async () => {
    try {
      await dataService.seedLibrary();
      setToast({ message: 'LIBRARY_SEEDED_SUCCESSFULLY', type: 'success' });
    } catch (error) {
      setToast({ message: 'SEEDING_FAILED', type: 'error' });
    }
  };

  const handleDelete = async () => {
    if (deleteConfirmation) {
      setIsDeleting(true);
      try {
        await dataService.deleteLibraryBook(deleteConfirmation);
        setToast({ message: 'BOOK_DELETED_SUCCESSFULLY', type: 'success' });
        setDeleteConfirmation(null);
      } catch (error) {
        setToast({ message: 'ERROR_DELETING_BOOK', type: 'error' });
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const filtered = books.filter(b => 
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.author.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-12 md:space-y-32 py-6 md:py-12 pb-32 md:pb-48 px-4 md:px-6">
      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-12 lg:gap-16 max-w-[1800px] mx-auto">
        <div className="space-y-6 md:space-y-8">
          <div className="flex items-center gap-4 md:gap-5">
            <div className="micro-label text-primary">KNOWLEDGE_HUB</div>
            <div className="h-px w-12 md:w-24 bg-slate-800"></div>
          </div>
          <h2 className="text-4xl md:text-6xl lg:text-massive text-white tracking-tight leading-none">
            LIBRARY <br className="hidden md:block" />
            <span className="italic-serif lowercase text-primary md:ml-0">archives</span>
          </h2>
          <p className="text-slate-400 font-medium max-w-xl text-lg md:text-2xl leading-tight tracking-tight">
            Manage academic resources, track borrowings, and handle returns with precision.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-8 w-full xl:w-auto">
          <div className="relative w-full sm:w-[400px] group">
            <Search className="absolute left-6 md:left-8 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Search resources..." 
              className="w-full pl-16 md:pl-20 pr-8 py-4 md:py-6 bg-slate-900/50 border border-slate-800 rounded-2xl md:rounded-3xl focus:bg-slate-900 transition-all text-xs md:text-sm font-bold tracking-wider outline-none focus:border-primary/30 text-white placeholder:text-slate-600"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <button 
              onClick={() => setShowHistoryModal(true)} 
              className="flex-1 sm:flex-none p-4 md:p-6 rounded-2xl md:rounded-3xl border border-slate-800 bg-slate-900/50 text-slate-400 hover:text-primary hover:border-primary/30 transition-all flex justify-center"
              title="View Borrowing History"
            >
              <History size={24} />
            </button>
            {currentRole === 'Admin' && (
              <div className="flex-1 flex gap-4">
                {books.length === 0 && (
                  <button 
                    onClick={handleSeed} 
                    className="flex-1 px-6 md:px-8 py-4 md:py-6 rounded-2xl md:rounded-3xl border border-primary/30 bg-primary/5 text-primary text-[10px] md:text-sm font-bold tracking-wider hover:bg-primary/10 transition-all"
                  >
                    SEED_DB
                  </button>
                )}
                <button 
                  onClick={() => setShowAddModal(true)} 
                  className="premium-btn px-6 md:px-12 py-4 md:py-6 flex-1 sm:flex-none"
                >
                  <Plus size={20} /> ADD_BOOK
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-[1800px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-16">
        {filtered.map((book, index) => (
          <motion.div 
            key={book.id} 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.8 }}
            className="group relative bg-slate-900 border border-slate-800 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl hover:border-primary/30 transition-all duration-500 h-[450px] md:h-[500px]"
            onClick={() => setActiveBookId(activeBookId === book.id ? null : book.id)}
          >
            {/* Hover/Touch Details Overlay */}
            <div className={cn(
              "absolute inset-0 bg-slate-900/95 p-8 md:p-10 transition-opacity duration-300 z-20 flex flex-col justify-between pointer-events-none group-hover:pointer-events-auto group-hover:opacity-100",
              activeBookId === book.id ? "opacity-100 pointer-events-auto" : "opacity-0"
            )}>
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <span className="px-4 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 text-[8px] font-black uppercase tracking-widest">{book.category}</span>
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">ISBN: {book.isbn || 'N/A'}</span>
                </div>
                <h4 className="text-3xl font-black tracking-tighter text-white uppercase leading-tight">{book.title}</h4>
                <div className="space-y-6">
                  <p className="text-sm text-slate-400 leading-relaxed font-medium">
                    {book.description || 'No description available for this resource.'}
                  </p>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Publisher</p>
                      <p className="text-[10px] font-bold text-slate-300 uppercase">{book.publisher || 'Unknown'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Author</p>
                      <p className="text-[10px] font-bold text-slate-300 uppercase">{book.author}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="pt-8 border-t border-slate-800 flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Inventory</p>
                  <p className="text-[10px] font-bold text-white">{book.availableCopies} / {book.totalCopies} Available</p>
                </div>
                <button 
                  disabled={book.availableCopies <= 0}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBorrow(book);
                  }}
                  className="px-10 py-4 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-primary/80 transition-all shadow-lg shadow-primary/20 disabled:opacity-30"
                >
                  BORROW_NOW
                </button>
              </div>
            </div>

            {/* Main Content */}
            <div className="h-full flex flex-col p-6 md:p-10 gap-6 md:gap-8">
              <div className="relative h-40 md:h-56 rounded-2xl md:rounded-3xl overflow-hidden shrink-0 shadow-lg">
                <img 
                  src={book.image_url || 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&q=80&w=400'} 
                  alt={book.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                {!book.availableCopies && (
                  <div className="absolute top-4 right-4 px-3 py-1 bg-red-500/80 text-white text-[8px] font-black uppercase tracking-widest rounded-full">OUT_OF_STOCK</div>
                )}
              </div>
              
              <div className="flex-1 flex flex-col justify-between">
                <div className="space-y-4 md:space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="px-4 py-1.5 rounded-lg bg-secondary/10 text-secondary border border-secondary/20 text-[8px] font-black uppercase tracking-widest w-fit">{book.category}</div>
                    <div className={cn(
                      "text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full border",
                      book.availableCopies > 0 ? "text-emerald-500 border-emerald-500/20 bg-emerald-500/5" : "text-red-500 border-red-500/20 bg-red-500/5"
                    )}>
                      {book.availableCopies} / {book.totalCopies} AVAILABLE
                    </div>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black tracking-tighter uppercase group-hover:text-primary transition-colors line-clamp-2 leading-tight text-white">{book.title}</h3>
                  <div className="space-y-1">
                    <p className="micro-label text-slate-500">{book.author}</p>
                    {book.isbn && <p className="text-[8px] font-mono text-slate-600 uppercase tracking-widest">ISBN: {book.isbn}</p>}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 md:pt-6 border-t border-slate-800">
                  {currentRole === 'Admin' && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirmation(book.id);
                      }}
                      className="p-3 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                  <div className="flex-1 flex justify-end">
                    <div className="flex items-center gap-2 text-slate-500 text-[8px] font-black uppercase tracking-widest animate-pulse">
                      {window.innerWidth < 768 ? 'Tap for details' : 'Hover for details'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>


      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="bg-slate-900 p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] border border-slate-800 shadow-2xl w-full max-w-2xl relative my-auto"
          >
            <button onClick={() => setShowAddModal(false)} className="absolute top-6 md:top-8 right-6 md:right-8 text-slate-500 hover:text-white transition-colors"><X size={24} /></button>
            
            <div className="mb-8 md:mb-12">
              <p className="micro-label text-primary mb-2">System Protocol</p>
              <h2 className="text-3xl md:text-4xl font-black tracking-tighter italic uppercase text-white">Add_Resource</h2>
            </div>

            <form onSubmit={handleAdd} className="space-y-6 md:space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Book Title</label>
                  <input required placeholder="e.g. Clean Code" className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-4 focus:border-primary/50 transition-all outline-none text-white placeholder:text-slate-600" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Author Name</label>
                  <input required placeholder="e.g. Robert C. Martin" className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-4 focus:border-primary/50 transition-all outline-none text-white placeholder:text-slate-600" value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">ISBN</label>
                  <input placeholder="e.g. 978-0132350884" className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-4 focus:border-primary/50 transition-all outline-none text-white placeholder:text-slate-600" value={formData.isbn} onChange={e => setFormData({...formData, isbn: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Publisher</label>
                  <input placeholder="e.g. Prentice Hall" className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-4 focus:border-primary/50 transition-all outline-none text-white placeholder:text-slate-600" value={formData.publisher} onChange={e => setFormData({...formData, publisher: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Category</label>
                  <select className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-4 focus:border-primary/50 transition-all outline-none text-white appearance-none" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    <option value="Technical" className="bg-slate-900">Technical</option>
                    <option value="Fiction" className="bg-slate-900">Fiction</option>
                    <option value="Reference" className="bg-slate-900">Reference</option>
                    <option value="Magazine" className="bg-slate-900">Magazine</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Total Copies</label>
                  <input type="number" min="1" className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-4 focus:border-primary/50 transition-all outline-none text-white placeholder:text-slate-600" value={formData.totalCopies} onChange={e => setFormData({...formData, totalCopies: Number(e.target.value)})} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Description</label>
                <textarea rows={3} placeholder="Brief book description..." className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-4 focus:border-primary/50 transition-all outline-none text-white placeholder:text-slate-600 resize-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>

              <div className="flex gap-4 pt-4">
                <button type="submit" className="premium-btn w-full justify-center py-6 text-lg">INITIALIZE_RESOURCE</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {deleteConfirmation && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="bg-slate-900 p-12 rounded-[3rem] border border-slate-800 shadow-2xl w-full max-w-md text-center"
          >
            <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 text-red-500 border border-red-500/20">
              <Trash2 size={40} className={isDeleting ? 'animate-pulse' : ''} />
            </div>
            <h2 className="text-3xl font-black tracking-tighter uppercase italic mb-4 text-white">Confirm_Deletion</h2>
            <p className="text-slate-400 mb-10 font-medium leading-relaxed">
              {isDeleting ? 'Initializing deletion protocol...' : 'Are you sure you want to remove this book from the library database? This action is permanent and cannot be undone.'}
            </p>
            <div className="flex gap-4">
              <button 
                disabled={isDeleting}
                onClick={() => setDeleteConfirmation(null)}
                className="flex-1 px-8 py-4 rounded-2xl bg-slate-800 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:bg-slate-700 transition-all border border-slate-700 disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                disabled={isDeleting}
                onClick={handleDelete}
                className="flex-1 px-8 py-4 rounded-2xl bg-red-500 text-white font-black uppercase tracking-widest text-[10px] hover:bg-red-600 transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    DELETING...
                  </>
                ) : 'Delete'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* History Modal */}
      <AnimatePresence>
        {showHistoryModal && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4 md:p-6 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-slate-900 p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] border border-slate-800 shadow-2xl w-full max-w-5xl md:max-h-[80vh] overflow-hidden flex flex-col relative my-auto"
            >
              <button onClick={() => setShowHistoryModal(false)} className="absolute top-6 md:top-8 right-6 md:right-8 text-slate-500 hover:text-white transition-colors"><X size={24} /></button>
              
              <div className="mb-8 md:mb-12 shrink-0">
                <p className="micro-label text-primary mb-2">Transaction Logs</p>
                <h2 className="text-3xl md:text-4xl font-black tracking-tighter italic uppercase text-white leading-tight">Borrowing History</h2>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-4 md:space-y-6 custom-scrollbar">
                {records.length === 0 ? (
                  <div className="py-12 md:py-20 text-center space-y-4 md:space-y-6">
                    <History className="mx-auto text-slate-800 w-12 h-12 md:w-16 md:h-16" />
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">No transactions found</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {records.map((record) => (
                      <div key={record.id} className="p-6 md:p-8 rounded-2xl border border-slate-800 bg-slate-800/30 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 md:gap-8">
                        <div className="space-y-3 md:space-y-4 w-full">
                          <div className="flex flex-wrap items-center gap-3 md:gap-4">
                            <h4 className="text-lg md:text-xl font-black tracking-tight text-white uppercase truncate">{record.bookTitle}</h4>
                            <div className={cn(
                              "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border shrink-0",
                              record.status === 'Returned' ? "text-emerald-500 border-emerald-500/20 bg-emerald-500/5" : 
                              record.status === 'Overdue' ? "text-red-500 border-red-500/20 bg-red-500/5" : 
                              "text-amber-500 border-amber-500/20 bg-amber-500/5"
                            )}>
                              {record.status}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-4 md:gap-6 text-slate-500">
                            <div className="flex items-center gap-2">
                              <User size={12} className="text-primary" />
                              <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider">{record.studentName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock size={12} className="text-primary" />
                              <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider">Due: {new Date(record.dueDate).toLocaleDateString()}</span>
                            </div>
                            {record.fine > 0 && (
                              <div className="flex items-center gap-2 text-red-500">
                                <AlertTriangle size={12} />
                                <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider">Fine: {record.fine}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {record.status !== 'Returned' && (currentRole === 'Admin' || (currentUser && record.studentId === currentUser.uid)) && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReturn(record);
                            }}
                            className="w-full lg:w-auto px-8 py-3 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-primary/80 transition-all shadow-lg shadow-primary/20"
                          >
                            RETURN_NOW
                          </button>
                        )}
                        {record.status === 'Returned' && (
                          <div className="flex items-center gap-2 text-emerald-500 shrink-0">
                            <CheckCircle2 size={18} />
                            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">Completed</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {toast && (
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className={cn(
            "fixed bottom-12 left-1/2 -translate-x-1/2 z-[200] px-8 py-4 rounded-2xl border font-black uppercase tracking-widest text-xs shadow-2xl flex items-center gap-4 bg-slate-900 backdrop-blur-xl",
            toast.type === 'success' ? "border-emerald-500 text-emerald-500" : "border-red-500 text-red-500"
          )}
        >
          <div className={cn("w-2 h-2 rounded-full animate-pulse", toast.type === 'success' ? "bg-emerald-500" : "bg-red-500")} />
          {toast.message}
        </motion.div>
      )}
    </div>
  );
};

export default Library;
