import { Student, Alumni, LostFoundItem, Club, Notice, FestEvent, LibraryBook, TechnicalEvent, DepartmentDetail, AppNotification } from './types';

interface AppData {
  students: Student[];
  alumni: Alumni[];
  lostFound: LostFoundItem[];
  clubs: Club[];
  notices: Notice[];
  festEvents: FestEvent[];
  books: LibraryBook[];
  techEvents: TechnicalEvent[];
  departments: DepartmentDetail[];
  notifications: AppNotification[];
}

export const initialData: AppData = {
  students: [
    { id: '1', name: 'Alice Smith', email: 'alice@vignan.ac.in', department: 'CSE', year: '3rd Year', image_url: 'https://picsum.photos/seed/student1/200/200', createdAt: Date.now() },
    { id: '2', name: 'Bob Johnson', email: 'bob@vignan.ac.in', department: 'ECE', year: '2nd Year', image_url: 'https://picsum.photos/seed/student2/200/200', createdAt: Date.now() },
    { id: '3', name: 'Priya Sharma', email: 'priya@vignan.ac.in', department: 'CSE', year: '4th Year', image_url: 'https://picsum.photos/seed/student3/200/200', createdAt: Date.now() },
    { id: '4', name: 'Rahul Verma', email: 'rahul@vignan.ac.in', department: 'MECH', year: '1st Year', image_url: 'https://picsum.photos/seed/student4/200/200', createdAt: Date.now() },
  ],
  alumni: [
    { id: '1', name: 'Charlie Brown', email: 'charlie@alumni.com', department: 'CSE', yearOfGraduation: '2023', image_url: 'https://picsum.photos/seed/alumni1/200/200', createdAt: Date.now() },
    { id: '2', name: 'Deepika Rao', email: 'deepika@alumni.com', department: 'ECE', yearOfGraduation: '2022', image_url: 'https://picsum.photos/seed/alumni2/200/200', createdAt: Date.now() },
  ],
  lostFound: [
    { id: '1', title: 'Blue Backpack', description: 'Left in Library near the entrance.', status: 'Lost', type: 'lost', image_url: 'https://picsum.photos/seed/backpack/400/400', createdAt: Date.now() },
    { id: '2', title: 'Silver Watch', description: 'Found in the cafeteria.', status: 'Found', type: 'found', image_url: 'https://picsum.photos/seed/watch/400/400', createdAt: Date.now() },
  ],
  clubs: [
    { 
      id: '1', 
      name: 'V-CODE', 
      description: 'The official coding club of CSE. Building the next generation of developers.', 
      members: 450, 
      achievement: 'Won Smart India Hackathon 2024', 
      president: 'Nihal Kumar (7979752014)',
      category: 'TECHNICAL',
      qualities: ['Competitive Programming', 'Web Dev', 'Open Source']
    },
    { 
      id: '2', 
      name: 'V-CINE', 
      description: 'Film and photography enthusiasts. Capturing life through the lens.', 
      members: 150, 
      achievement: 'Best Short Film - Guntur Film Fest', 
      president: 'Nihal Kumar (7979752014)',
      category: 'CULTURAL',
      qualities: ['Cinematography', 'Editing', 'Storytelling']
    },
    { 
      id: '3', 
      name: 'V-MUSIC', 
      description: 'Vocal and instrumental music club. Celebrating the rhythm of life.', 
      members: 120, 
      achievement: 'State Level Band Competition Winners', 
      president: 'Nihal Kumar (7979752014)',
      category: 'CULTURAL',
      qualities: ['Vocals', 'Instruments', 'Composition']
    },
    { 
      id: '4', 
      name: 'V-DANCE', 
      description: 'Classical and western dance forms. Expressing through movement.', 
      members: 200, 
      achievement: 'National Level Dance Fest Finalists', 
      president: 'Nihal Kumar (7979752014)',
      category: 'CULTURAL',
      qualities: ['Choreography', 'Performance', 'Expression']
    },
    { 
      id: '5', 
      name: 'V-ROBOTICS', 
      description: 'Building the future with robots. Innovation through engineering.', 
      members: 180, 
      achievement: 'RoboWars Champions 2023', 
      president: 'Nihal Kumar (7979752014)',
      category: 'TECHNICAL',
      qualities: ['Robotics', 'AI', 'Hardware']
    },
    { 
      id: '6', 
      name: 'V-LITERARY', 
      description: 'Debate, quiz, and creative writing. The intellectual hub of Vignan.', 
      members: 100, 
      achievement: 'Inter-University Quiz Winners', 
      president: 'Nihal Kumar (7979752014)',
      category: 'ACADEMIC',
      qualities: ['Debating', 'Quizzing', 'Writing']
    }
  ],
  notices: [
    { id: '1', title: 'Mid-Term Exams', content: 'Exams start from April 15th', department: 'ALL', date: '2026-03-31', createdAt: Date.now() },
  ],
  festEvents: [
    { id: '1', title: 'Prompt Master', date: '2025-03-15', venue: 'CSE Lab 4', description: 'Master the art of AI prompting to solve complex challenges.', category: 'Technical' },
    { id: '2', title: 'Debugging & Defend', date: '2025-03-18', venue: 'Main Auditorium', description: 'Find bugs and defend your code against security threats.', category: 'Technical' },
    { id: '3', title: 'Coding Contest', date: '2025-03-22', venue: 'Online Platform', description: 'Competitive programming at its best. Show your skills.', category: 'Technical' },
    { id: '4', title: 'Technical Quiz', date: '2025-03-25', venue: 'Seminar Hall', description: 'Test your knowledge across all domains of Computer Science.', category: 'Technical' },
    { id: '5', title: 'V-Code Hackathon', date: '2025-04-05', venue: 'Innovation Center', description: '24-hour non-stop building and innovation.', category: 'Technical' },
    { id: '6', title: 'Code Hunt', date: '2025-04-10', venue: 'Campus Wide', description: 'A treasure hunt for coders. Solve riddles to find the next clue.', category: 'Technical' },
  ],
  books: [
    { id: '1', title: 'Clean Code', author: 'Robert C. Martin', category: 'Technical', isbn: '978-0132350884', description: 'A Handbook of Agile Software Craftsmanship', publisher: 'Prentice Hall', totalCopies: 5, availableCopies: 5, image_url: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&q=80&w=400', createdAt: Date.now() },
    { id: '2', title: 'The Pragmatic Programmer', author: 'Andrew Hunt', category: 'Technical', isbn: '978-0135957059', description: 'Your journey to mastery', publisher: 'Addison-Wesley', totalCopies: 3, availableCopies: 3, image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400', createdAt: Date.now() },
    { id: '3', title: 'Introduction to Algorithms', author: 'Cormen', category: 'Technical', isbn: '978-0262033848', description: 'The standard reference for algorithms', publisher: 'MIT Press', totalCopies: 10, availableCopies: 8, image_url: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&q=80&w=400', createdAt: Date.now() },
    { id: '4', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', category: 'Fiction', isbn: '978-0743273565', description: 'A classic of American literature', publisher: 'Scribner', totalCopies: 4, availableCopies: 4, image_url: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400', createdAt: Date.now() },
  ],
  techEvents: [
    { id: '1', title: 'Google Summer of Code', type: 'Internship', deadline: '2026-04-10', link: 'https://summerofcode.withgoogle.com', description: 'Global program focused on bringing more student developers into open source software development.' },
    { id: '2', title: 'Microsoft Imagine Cup', type: 'Hackathon', deadline: '2026-05-15', link: 'https://imaginecup.microsoft.com', description: 'The premier global student technology competition.' },
    { id: '3', title: 'React Conf 2026', type: 'Workshop', deadline: '2026-06-01', link: 'https://reactconf.com', description: 'Learn the latest in React and web development.' },
  ],
  departments: [
    { 
      id: 'aiml', 
      name: 'AI & ML', 
      fullName: 'Artificial Intelligence and Machine Learning', 
      description: 'Bachelors in Advanced Computer Science and Engineering. Focus on machine learning, deep learning, and neural networks.', 
      hod: 'Dr. A. I. Expert', 
      courses: ['B.Tech AI & ML', 'M.Tech AI'], 
      achievements: ['Best AI Research Hub', 'Top Placements in Tech Giants'], 
      contact: 'aiml_hod@vignan.ac.in',
      image_url: 'https://images.unsplash.com/photo-1555255707-c07966088b7b?auto=format&fit=crop&q=80&w=800'
    },
    { 
      id: 'cyber', 
      name: 'Cyber Security', 
      fullName: 'Cyber Security', 
      description: 'Bachelors in Advanced Computer Science and Engineering. Specializing in network security, ethical hacking, and digital forensics.', 
      hod: 'Dr. S. Security', 
      courses: ['B.Tech Cyber Security', 'M.Tech Cyber Security'], 
      achievements: ['Certified Ethical Hacking Center', 'National Cyber Security Award'], 
      contact: 'cyber_hod@vignan.ac.in',
      image_url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800'
    },
    { 
      id: 'csbs', 
      name: 'CSBS', 
      fullName: 'Computer Science and Business Systems', 
      description: 'Bachelors in Advanced Computer Science and Engineering. A unique blend of computer science and business management.', 
      hod: 'Dr. B. Systems', 
      courses: ['B.Tech CSBS'], 
      achievements: ['Industry-Ready Curriculum', 'TCS Partnership Program'], 
      contact: 'csbs_hod@vignan.ac.in',
      image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800'
    },
    { 
      id: 'ds', 
      name: 'Data Sciences', 
      fullName: 'Data Sciences', 
      description: 'Bachelors in Advanced Computer Science and Engineering. Mastering big data, analytics, and statistical modeling.', 
      hod: 'Dr. D. Analytics', 
      courses: ['B.Tech Data Sciences'], 
      achievements: ['Big Data Excellence Center', 'Top Data Science Lab'], 
      contact: 'ds_hod@vignan.ac.in',
      image_url: 'https://images.unsplash.com/photo-1551288049-bbda6462f744?auto=format&fit=crop&q=80&w=800'
    },
    { 
      id: 'iot', 
      name: 'IoT', 
      fullName: 'Internet of Things', 
      description: 'Bachelors in Advanced Computer Science and Engineering. Connecting the world through smart devices and sensors.', 
      hod: 'Dr. I. Smart', 
      courses: ['B.Tech IoT'], 
      achievements: ['Smart Campus Project', 'IoT Innovation Lab'], 
      contact: 'iot_hod@vignan.ac.in',
      image_url: 'https://images.unsplash.com/photo-1518444065439-e933c06ce9cd?auto=format&fit=crop&q=80&w=800'
    },
    { 
      id: 'agri', 
      name: 'Agri Eng', 
      fullName: 'Agricultural Engineering', 
      description: 'Bachelors in Agricultural Engineering. Modernizing agriculture with advanced engineering solutions.', 
      hod: 'Dr. A. Green', 
      courses: ['B.Tech Agricultural Engineering'], 
      achievements: ['Sustainable Farming Research', 'Best Agri-Tech Project'], 
      contact: 'agri_hod@vignan.ac.in',
      image_url: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80&w=800'
    },
    { 
      id: 'bioinfo', 
      name: 'Bioinformatics', 
      fullName: 'Bioinformatics', 
      description: 'Bachelors in Bioinformatics. Intersection of biology, computer science, and information technology.', 
      hod: 'Dr. B. Info', 
      courses: ['B.Tech Bioinformatics'], 
      achievements: ['Genomic Research Excellence', 'Bio-IT Innovation'], 
      contact: 'bioinfo_hod@vignan.ac.in',
      image_url: 'https://images.unsplash.com/photo-1532187875605-1ef6c237ddc4?auto=format&fit=crop&q=80&w=800'
    },
    { 
      id: 'biomed', 
      name: 'Biomedical', 
      fullName: 'Biomedical Engineering', 
      description: 'Bachelors in Bio Medical Engineering. Engineering for healthcare and medical advancements.', 
      hod: 'Dr. M. Health', 
      courses: ['B.Tech Biomedical Engineering'], 
      achievements: ['Medical Device Innovation', 'Healthcare Tech Excellence'], 
      contact: 'biomed_hod@vignan.ac.in',
      image_url: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&q=80&w=800'
    },
    { 
      id: 'biotech', 
      name: 'Biotech', 
      fullName: 'Biotechnology', 
      description: 'Bachelors in Biotechnology. Exploring life sciences and genetic engineering.', 
      hod: 'Dr. G. Tech', 
      courses: ['B.Tech Biotechnology'], 
      achievements: ['Genetic Research Breakthrough', 'Best Biotech Lab'], 
      contact: 'biotech_hod@vignan.ac.in',
      image_url: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&q=80&w=800'
    },
    { 
      id: 'chem', 
      name: 'Chemical', 
      fullName: 'Chemical Engineering', 
      description: 'Bachelors in Chemical Engineering. Transforming raw materials into useful products.', 
      hod: 'Dr. C. Process', 
      courses: ['B.Tech Chemical Engineering'], 
      achievements: ['Sustainable Process Design', 'Chemical Safety Excellence'], 
      contact: 'chem_hod@vignan.ac.in',
      image_url: 'https://images.unsplash.com/photo-1532187875605-1ef6c237ddc4?auto=format&fit=crop&q=80&w=800'
    },
    { 
      id: 'civil', 
      name: 'Civil', 
      fullName: 'Civil Engineering', 
      description: 'Bachelors in Civil Engineering. Building the infrastructure of the future.', 
      hod: 'Dr. S. Structure', 
      courses: ['B.Tech Civil Engineering'], 
      achievements: ['Smart City Infrastructure', 'Best Structural Design'], 
      contact: 'civil_hod@vignan.ac.in',
      image_url: 'https://images.unsplash.com/photo-1503387762-592dee58c460?auto=format&fit=crop&q=80&w=800'
    },
    { 
      id: 'cse', 
      name: 'CSE', 
      fullName: 'Computer Science and Engineering', 
      description: 'Bachelors in Computer Science and Engineering. The core of modern technology and software.', 
      hod: 'Dr. K. Hemanth Kumar', 
      courses: ['B.Tech CSE', 'M.Tech CSE', 'Ph.D'], 
      achievements: ['100% Placements in 2024', 'Best Department Award 2023'], 
      contact: 'cse_hod@vignan.ac.in',
      image_url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800'
    },
    { 
      id: 'ece', 
      name: 'ECE', 
      fullName: 'Electronics and Communication Engineering', 
      description: 'Bachelors in Electronics and Communication Engineering. Connecting the world through advanced electronics.', 
      hod: 'Dr. T. Pitchaiah', 
      courses: ['B.Tech ECE', 'M.Tech VLSI', 'Ph.D'], 
      achievements: ['Patent filed for Smart Antenna', 'Research grant of 50 Lakhs'], 
      contact: 'ece_hod@vignan.ac.in',
      image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800'
    },
    { 
      id: 'eee', 
      name: 'EEE', 
      fullName: 'Electrical and Electronics Engineering', 
      description: 'Bachelors in Electrical and Electronics Engineering. Powering the world with sustainable energy.', 
      hod: 'Dr. G. Srinivasa Rao', 
      courses: ['B.Tech EEE', 'M.Tech Power Systems'], 
      achievements: ['Solar Power Project Implementation', 'Best Project Award'], 
      contact: 'eee_hod@vignan.ac.in',
      image_url: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80&w=800'
    },
    { 
      id: 'food', 
      name: 'Food Tech', 
      fullName: 'Food Technology', 
      description: 'Bachelors in Food Technology. Ensuring food safety and innovation in food processing.', 
      hod: 'Dr. F. Safety', 
      courses: ['B.Tech Food Technology'], 
      achievements: ['Food Quality Excellence', 'Innovative Food Products'], 
      contact: 'food_hod@vignan.ac.in',
      image_url: 'https://images.unsplash.com/photo-1532187875605-1ef6c237ddc4?auto=format&fit=crop&q=80&w=800'
    },
    { 
      id: 'it', 
      name: 'IT', 
      fullName: 'Information Technology', 
      description: 'Bachelors in Information Technology. Managing and processing information in the digital age.', 
      hod: 'Dr. I. T. Head', 
      courses: ['B.Tech IT'], 
      achievements: ['Digital Transformation Excellence', 'Top IT Placements'], 
      contact: 'it_hod@vignan.ac.in',
      image_url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=800'
    },
    { 
      id: 'mech', 
      name: 'MECH', 
      fullName: 'Mechanical Engineering', 
      description: 'Bachelors in Mechanical Engineering. Designing and building the machines of tomorrow.', 
      hod: 'Dr. B. Nageswara Rao', 
      courses: ['B.Tech MECH', 'M.Tech Machine Design'], 
      achievements: ['Formula Student Car Design', 'Best Design Award 2023'], 
      contact: 'mech_hod@vignan.ac.in',
      image_url: 'https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?auto=format&fit=crop&q=80&w=800'
    },
    { 
      id: 'robotics', 
      name: 'Robotics', 
      fullName: 'Robotics & Automation', 
      description: 'Bachelors in Mechanical Engineering. Specializing in robotics, automation, and control systems.', 
      hod: 'Dr. R. Auto', 
      courses: ['B.Tech Robotics'], 
      achievements: ['RoboWars Champions', 'Automation Excellence'], 
      contact: 'robotics_hod@vignan.ac.in',
      image_url: 'https://images.unsplash.com/photo-1531746790731-6c087fecd05a?auto=format&fit=crop&q=80&w=800'
    },
    { 
      id: 'textile', 
      name: 'Textile', 
      fullName: 'Textile Technology', 
      description: 'Bachelors in Textile Technology. Innovation in fabric and garment manufacturing.', 
      hod: 'Dr. T. Fabric', 
      courses: ['B.Tech Textile Technology'], 
      achievements: ['Smart Textile Innovation', 'Best Textile Project'], 
      contact: 'textile_hod@vignan.ac.in',
      image_url: 'https://images.unsplash.com/photo-1528460033278-a6ba57020470?auto=format&fit=crop&q=80&w=800'
    },
    { 
      id: 'techtextile', 
      name: 'Tech Textile', 
      fullName: 'Technical Textiles', 
      description: 'Bachelors in Textile Technology. Focus on high-performance and industrial textiles.', 
      hod: 'Dr. T. Industrial', 
      courses: ['B.Tech Technical Textiles'], 
      achievements: ['Industrial Textile Excellence', 'Advanced Material Research'], 
      contact: 'techtextile_hod@vignan.ac.in',
      image_url: 'https://images.unsplash.com/photo-1528460033278-a6ba57020470?auto=format&fit=crop&q=80&w=800'
    },
    { 
      id: 'vlsi', 
      name: 'VLSI', 
      fullName: 'Electronics Engineering (VLSI Design and Technology)', 
      description: 'Bachelors in Electronics Engineering (VLSI Design and Technology). Designing the chips that power the world.', 
      hod: 'Dr. V. Chip', 
      courses: ['B.Tech VLSI'], 
      achievements: ['Chip Design Excellence', 'VLSI Innovation Lab'], 
      contact: 'vlsi_hod@vignan.ac.in',
      image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800'
    },
  ],
  notifications: [
    { id: '1', title: 'New internship posted', type: 'Technical', path: '/technical', createdAt: Date.now() - 120000 },
    { id: '2', title: 'Library book returned', type: 'Library', path: '/library', createdAt: Date.now() - 3600000 },
    { id: '3', title: 'Fest event updated', type: 'Fest', path: '/fest', createdAt: Date.now() - 10800000 }
  ]
};
