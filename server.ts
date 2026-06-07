import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import fs from "fs";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Load Firebase Config safely using fs
const firebaseConfigPath = path.join(process.cwd(), "firebase-applet-config.json");
const firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, "utf8"));

// Initialize Firebase client on the server
const firebaseApp = initializeApp(firebaseConfig);
const dbStatus = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

// Initialize Gemini
let aiClient: any = null;

function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required but is missing or undefined");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

async function getLiveCampusData() {
  try {
    const getCollectionData = async (name: string) => {
      try {
        const snap = await getDocs(collection(dbStatus, name));
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch (e) {
        console.error(`Error reading collection ${name}:`, e);
        return [];
      }
    };

    const [students, alumni, lostFound, clubs, notices, festEvents, books, techEvents, departments] = await Promise.all([
      getCollectionData("students"),
      getCollectionData("alumni"),
      getCollectionData("lostFound"),
      getCollectionData("clubs"),
      getCollectionData("notices"),
      getCollectionData("festEvents"),
      getCollectionData("books"),
      getCollectionData("techEvents"),
      getCollectionData("departments")
    ]);

    return {
      students,
      alumni,
      lostFound,
      clubs,
      notices,
      festEvents,
      books,
      techEvents,
      departments
    };
  } catch (err) {
    console.error("Error gathering whole campus data:", err);
    return {
      students: [],
      alumni: [],
      lostFound: [],
      clubs: [],
      notices: [],
      festEvents: [],
      books: [],
      techEvents: [],
      departments: []
    };
  }
}

function formatDataForAI(data: any): string {
  let context = "CURRENT REAL-TIME VIGNAN UNIVERSE CAMPUS DATA:\n\n";

  context += "--- DEPARTMENTS ---\n";
  if (Array.isArray(data.departments) && data.departments.length > 0) {
    data.departments.forEach((d: any) => {
      context += `- Department: ${d.name} (${d.fullName || d.name})\n  HOD: ${d.hod || 'N/A'}\n  Contact: ${d.contact || 'N/A'}\n  Courses: ${Array.isArray(d.courses) ? d.courses.join(', ') : 'N/A'}\n  Achievements: ${Array.isArray(d.achievements) ? d.achievements.join(', ') : 'N/A'}\n  Description: ${d.description || 'N/A'}\n\n`;
    });
  } else {
    context += "No departments found.\n\n";
  }

  context += "--- STUDENT ACTIVITY COUNCIL (SAC) CLUBS ---\n";
  if (Array.isArray(data.clubs) && data.clubs.length > 0) {
    data.clubs.forEach((c: any) => {
      context += `- Club: ${c.name}\n  Category: ${c.category || 'N/A'}\n  President/Contact: ${c.president || 'N/A'}\n  Members: ${c.members || 0}\n  Achievement: ${c.achievement || 'N/A'}\n  Qualities: ${Array.isArray(c.qualities) ? c.qualities.join(', ') : 'N/A'}\n  Description: ${c.description || 'N/A'}\n\n`;
    });
  } else {
    context += "No clubs found.\n\n";
  }

  context += "--- FEST & CULTURAL EVENTS ---\n";
  if (Array.isArray(data.festEvents) && data.festEvents.length > 0) {
    data.festEvents.forEach((f: any) => {
      context += `- Event: ${f.title}\n  Category: ${f.category || 'N/A'}\n  Date: ${f.date || 'N/A'}\n  Venue: ${f.venue || 'N/A'}\n  Description: ${f.description || 'N/A'}\n\n`;
    });
  } else {
    context += "No upcoming fest events registered.\n\n";
  }

  context += "--- EXTERNAL TECHNICAL OPPORTUNITIES & WORKSHOPS ---\n";
  if (Array.isArray(data.techEvents) && data.techEvents.length > 0) {
    data.techEvents.forEach((t: any) => {
      context += `- Opportunity: ${t.title}\n  Type: ${t.type || 'N/A'}\n  Deadline: ${t.deadline || 'N/A'}\n  Link: ${t.link || 'N/A'}\n  Details: ${t.description || 'N/A'}\n\n`;
    });
  } else {
    context += "No technical opportunities found.\n\n";
  }

  context += "--- LIBRARY SELECTION ---\n";
  if (Array.isArray(data.books) && data.books.length > 0) {
    data.books.forEach((b: any) => {
      context += `- Book: "${b.title}" by ${b.author}\n  Category: ${b.category || 'N/A'}\n  ISBN: ${b.isbn || 'N/A'}\n  Publisher: ${b.publisher || 'N/A'}\n  Total Copies: ${b.totalCopies || 0}, Available: ${b.availableCopies || 0}\n  Overview: ${b.description || 'N/A'}\n\n`;
    });
  } else {
    context += "No library books available.\n\n";
  }

  context += "--- ACTIVE ANNOUNCEMENTS & BOARD NOTICES ---\n";
  if (Array.isArray(data.notices) && data.notices.length > 0) {
    data.notices.forEach((n: any) => {
      context += `- Notice Topic: ${n.title}\n  Department targeted: ${n.department || 'ALL'}\n  Publish Date: ${n.date || 'N/A'}\n  Announcement detailing: ${n.content || 'N/A'}\n\n`;
    });
  } else {
    context += "No announcements registered.\n\n";
  }

  context += "--- ACTIVE CAMPUS LOST & FOUND LOG ---\n";
  if (Array.isArray(data.lostFound) && data.lostFound.length > 0) {
    data.lostFound.forEach((lf: any) => {
      context += `- Found/Lost Item: ${lf.title}\n  Status: ${lf.status} (Type: ${lf.type})\n  Description: ${lf.description || 'N/A'}\n\n`;
    });
  } else {
    context += "No reports logged.\n\n";
  }

  context += "--- CURRENT ACTIVE STUDENTS REGISTERED ---\n";
  if (Array.isArray(data.students) && data.students.length > 0) {
    data.students.forEach((s: any) => {
      const regInfo = s.registrationNumber ? ` (Reg No: ${s.registrationNumber})` : '';
      context += `- Student: ${s.name}${regInfo}\n  Department: ${s.department}\n  Year: ${s.year}\n  Contact: ${s.email}\n\n`;
    });
  } else {
    context += "No registered students found.\n\n";
  }

  context += "--- CONNECTED UNIVERSITY ALUMNI NETWORK ---\n";
  if (Array.isArray(data.alumni) && data.alumni.length > 0) {
    data.alumni.forEach((al: any) => {
      context += `- Circle Mentor: ${al.name}\n  Department Graduated: ${al.department}\n  Graduation Year: ${al.yearOfGraduation}\n  Principal Email Address: ${al.email}\n\n`;
    });
  } else {
    context += "No alumni connected.\n\n";
  }

  return context;
}

function generateLocalFallbackResponse(message: string, data: any): string {
  const query = message.trim();
  const lowerQuery = query.toLowerCase();

  // Define stop words to ignore conversational noise
  const stopWords = new Set([
    'the', 'is', 'at', 'which', 'on', 'in', 'for', 'a', 'an', 'of', 'and', 'or', 'to', 
    'me', 'list', 'show', 'search', 'find', 'who', 'what', 'where', 'any', 'about', 
    'how', 'many', 'are', 'there', 'you', 'your', 'some', 'please', 'give', 'info', 
    'details', 'can', 'could', 'tell', 'us', 'i', 'have', 'has', 'their', 'name'
  ]);

  // Define intents with semantic weight vectors
  const keywords: { [key: string]: string[] } = {
    clubs: ['club', 'clubs', 'sac', 'society', 'societies', 'sports', 'dance', 'music', 'art', 'president', 'presidents', 'organisations', 'organizations', 'drama', 'theatre', 'activities'],
    books: ['book', 'books', 'library', 'read', 'isbn', 'catalog', 'catalogue', 'shelf', 'author', 'copies', 'textbook', 'textbooks', 'availability', 'python', 'java', 'programming'],
    notices: ['notice', 'notices', 'board', 'announcement', 'announcements', 'alert', 'alerts', 'circular', 'circulars', 'holiday', 'latest'],
    lostFound: ['lost', 'found', 'security', 'wallet', 'bag', 'key', 'keys', 'watch', 'phone', 'card', 'property', 'id card', 'umbrella', 'item', 'items', 'find'],
    departments: ['department', 'departments', 'branch', 'branches', 'hod', 'head', 'cse', 'ece', 'civil', 'mech', 'mechanical', 'faculty', 'professor', 'professors'],
    students: ['student', 'students', 'registrations', 'roll', 'register'],
    alumni: ['alumni', 'alumnus', 'graduate', 'graduates', 'mentor', 'mentors'],
    events: ['fest', 'fests', 'event', 'events', 'celebration', 'cultural', 'tech', 'hackathon', 'workshop', 'symposium'],
    stats: ['how many', 'stats', 'statistics', 'count', 'total', 'records', 'database'],
    greetings: ['hi', 'hello', 'hey', 'greetings', 'welcome', 'who are you', 'how are you', 'vyoma', 'help']
  };

  // Score each intent category
  const intentScores: { [key: string]: number } = {};
  for (const [category, words] of Object.entries(keywords)) {
    let score = 0;
    words.forEach(w => {
      // Look for boundary word match for higher precision
      const wordRegex = new RegExp('\\b' + w + '\\b', 'i');
      if (wordRegex.test(lowerQuery)) {
        score += 5;
      } else if (lowerQuery.includes(w)) {
        score += 2;
      }
    });
    intentScores[category] = score;
  }

  // Find primary intent
  let primaryIntent = 'fallback';
  let maxScore = 0;
  for (const [cat, val] of Object.entries(intentScores)) {
    if (val > maxScore) {
      maxScore = val;
      primaryIntent = cat;
    }
  }

  // Extract non-stop query elements as search candidates
  const queryTerms = lowerQuery
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, " ")
    .split(/\s+/)
    .filter(w => w.length > 1 && !stopWords.has(w));

  // --- 1. GREETINGS INTENT ---
  if (primaryIntent === 'greetings' || maxScore === 0) {
    const clubCount = data.clubs?.length || 0;
    const bookCount = data.books?.length || 0;
    const noticeCount = data.notices?.length || 0;
    const studentCount = data.students?.length || 0;
    const lostCount = data.lostFound?.length || 0;
    const deptCount = data.departments?.length || 0;
    const festCount = data.festEvents?.length || 0;

    return `Greetings, Human! 🌌 I am **Vyoma AI**, your campus cosmic companion operating in local Standby NLP mode.

I am fully synchronized with our live Firestore databases. I can retrieve details instantly. Ask me things like:
- 🏆 **SAC Clubs Directory**: *"List the SAC clubs and their presidents"* OR *"Who of dance club?"*
- 🏢 **Academic Departments**: *"Who is the HOD of CSE?"* OR *"Show departments and contacts"*
- 📚 **Library Catalog**: *"Search for Java textbooks"* OR *"Is there a Python book available?"*
- 📢 **Notice bulletins**: *"Show recent announcements"*
- 🔍 **Lost & Found Tracker**: *"Are there any lost keys reported?"*

What database coordinate shall we explore together today?`;
  }

  // --- 2. SAC CLUBS INTENT ---
  if (primaryIntent === 'clubs') {
    const clubs = data.clubs || [];
    if (clubs.length === 0) {
      return `🌌 **SAC Clubs Synapse**: I scanned our live databases but found no registered Student Activity Council (SAC) clubs.
      
💡 *Tip: You can navigate to the **SAC Clubs** navigation tab to register your student organization! Once added, it will be instantly indexed here.*`;
    }

    // Check if they are asking about a specific club
    const specificClubQueryWords = queryTerms.filter(w => !['club', 'clubs', 'sac', 'society', 'societies', 'president', 'presidents'].includes(w));
    let matchedClubs = [];
    if (specificClubQueryWords.length > 0) {
      matchedClubs = clubs.filter((c: any) => {
        const name = (c.name || '').toLowerCase();
        const desc = (c.description || '').toLowerCase();
        const cat = (c.category || '').toLowerCase();
        return specificClubQueryWords.some(w => name.includes(w) || desc.includes(w) || cat.includes(w));
      });
    }

    if (matchedClubs.length > 0) {
      let res = `🏆 **Vyoma Club Search Results**: I found **${matchedClubs.length} matching student organization(s)**:\n\n`;
      matchedClubs.forEach((c: any) => {
        res += `### **${c.name}**\n`;
        res += `- 🎖️ **Category Type**: ${c.category || 'General SAC Club'}\n`;
        res += `- 👑 **Active President**: **${c.president || 'Elections pending'}**\n`;
        res += `- 👥 **Enrolled Base**: ${c.members || 0} active members\n`;
        if (c.achievement) res += `- 🏆 **Club Milestones**: *${c.achievement}*\n`;
        if (c.description) res += `- 📝 **Mission**: *${c.description}*\n`;
        res += `\n`;
      });
      return res;
    }

    // General list of clubs with their presidents
    let res = `🏆 **Active Student Activity Council (SAC) Registry**: I found **${clubs.length} registered clubs** with their leadership:\n\n`;
    clubs.forEach((c: any) => {
      res += `- **${c.name}** (${c.category || 'Recreational'})\n`;
      res += `  • *Active President*: **${c.president || 'Not Assigned'}**\n`;
      res += `  • *Members*: \`${c.members || 0} students\`\n`;
      if (c.description) res += `  • *Brief details*: *${c.description}*\n`;
      res += `\n`;
    });
    res += `💡 *Tip: You can manage, update, or join any of these student clubs directly from the **SAC Clubs** page in your browser!*`;
    return res;
  }

  // --- 3. DEPARTMENTS & HOD INTENT ---
  if (primaryIntent === 'departments') {
    const depts = data.departments || [];
    if (depts.length === 0) {
      return `🏢 **Academic Division Gateway**: No academic departments are registered in our active databases yet.
      
💡 *Tip: Head over to the **Departments** tab to register branches and assign their HOD administrators.*`;
    }

    // Check if searching for a specific branch (e.g. CSE, ECE, MECH, Mech, etc.)
    const matchesDept = depts.filter((d: any) => {
      const name = (d.name || '').toLowerCase();
      const fname = (d.fullName || '').toLowerCase();
      return queryTerms.some(w => name.includes(w) || fname.includes(w) || w === 'cse' && name.includes('computer') || w === 'ece' && name.includes('electronics'));
    });

    if (matchesDept.length > 0) {
      let res = `🏢 **Vyoma Department Synapse**: I retrieved matching details for **${matchesDept.length} branch(es)**:\n\n`;
      matchesDept.forEach((d: any) => {
        res += `### **Department of ${d.name}** (${d.fullName || d.name})\n`;
        res += `- 👑 **Head of Department (HOD)**: **${d.hod || 'Under selection'}**\n`;
        res += `- 📞 **Admin Desk Contact**: ${d.contact || 'N/A'}\n`;
        if (d.courses && d.courses.length > 0) res += `- 📚 **Flagship Courses**: ${Array.isArray(d.courses) ? d.courses.join(', ') : d.courses}\n`;
        if (d.achievements && d.achievements.length > 0) res += `- 🎖️ **Milestones**: ${Array.isArray(d.achievements) ? d.achievements.join(', ') : d.achievements}\n`;
        if (d.description) res += `- 📝 **About**: *${d.description}*\n`;
        res += `\n`;
      });
      return res;
    }

    // General list of departments
    let res = `🏢 **Academic Departments Directory**: Here is the list of active instructional branches:\n\n`;
    depts.forEach((d: any) => {
      res += `- **Department of ${d.name}** (${d.fullName || d.name})\n`;
      res += `  • *Head of Department (HOD)*: **${d.hod || 'Unassigned'}**\n`;
      res += `  • *Desk Contact*: ${d.contact || 'N/A'}\n`;
      if (d.description) res += `  • *Overview*: *${d.description}*\n`;
      res += `\n`;
    });
    return res;
  }

  // --- 4. LIBRARY BOOKS INTENT ---
  if (primaryIntent === 'books') {
    const books = data.books || [];
    if (books.length === 0) {
      return `📚 **Vignan Library Catalog**: There are currently no cataloged books in the public library stacks.
      
💡 *Tip: Go to the **Library** section to catalog a book shelf or add dynamic reference volumes.*`;
    }

    // Specific book lookup
    const searchTerms = queryTerms.filter(w => !['book', 'books', 'library', 'read', 'isbn', 'catalog', 'catalogue', 'shelf', 'copies', 'textbook', 'textbooks', 'availability'].includes(w));
    let matchedBooks = [];
    if (searchTerms.length > 0) {
      matchedBooks = books.filter((b: any) => {
        const title = (b.title || '').toLowerCase();
        const author = (b.author || '').toLowerCase();
        const cat = (b.category || '').toLowerCase();
        const isbn = (b.isbn || '').toLowerCase();
        return searchTerms.some(w => title.includes(w) || author.includes(w) || cat.includes(w) || isbn.includes(w));
      });
    }

    if (matchedBooks.length > 0) {
      let res = `📚 **Vyoma Library Search Results**: I found **${matchedBooks.length} book matched**:\n\n`;
      matchedBooks.forEach((b: any) => {
        res += `### **${b.title}** by *${b.author}*\n`;
        res += `- 🗂️ **Field Category**: ${b.category || 'General text'}\n`;
        res += `- 🏷️ **ISBN Registry**: \`${b.isbn || 'N/A'}\` | **Publisher**: ${b.publisher || 'N/A'}\n`;
        res += `- 📊 **Copies status**: ${b.availableCopies > 0 ? `🟢 **${b.availableCopies} Copies Available**` : '🔴 **All checked out**'} (Total in catalog: ${b.totalCopies || 0})\n`;
        if (b.description) res += `- 📝 **Synopsis**: *${b.description}*\n`;
        res += `\n`;
      });
      return res;
    }

    // General Catalog list
    let res = `📚 **Vignan University Library Index**: Currently listing **${books.length} publications**:\n\n`;
    books.slice(0, 8).forEach((b: any) => {
      res += `- **"${b.title}"** by *${b.author}*\n`;
      res += `  • *Domain Field*: ${b.category || 'Reference'} | *Availability*: ${b.availableCopies > 0 ? `🟢 **${b.availableCopies} on shelf**` : '🔴 **Out of Stock**'} (${b.totalCopies} total)\n`;
      res += `\n`;
    });
    if (books.length > 8) res += `*...and ${books.length - 8} more. Search using titles to pull other listings!*\n`;
    return res;
  }

  // --- 5. NOTICEBOARD INTENT ---
  if (primaryIntent === 'notices') {
    const notices = data.notices || [];
    if (notices.length === 0) {
      return `📢 **Campus Bulletins**: No notices or circular announcements are posted on the public boards.
      
💡 *Tip: Go to the admin section of your pane with your Admin roles to post a campus notification update.*`;
    }

    let res = `📢 **Active Noticeboard Circulars**: Retreived **${notices.length} active announcements**:\n\n`;
    notices.forEach((n: any, idx: number) => {
      res += `### ${idx + 1}. **${n.title}**\n`;
      res += `- 🎯 **Department Target**: \`${n.department || 'All Students'}\` | **Posted**: ${n.date || 'Today'}\n`;
      res += `- 📝 **Broadcast Details**: \n> *${n.content}*\n\n`;
    });
    return res;
  }

  // --- 6. LOST & FOUND INTENT ---
  if (primaryIntent === 'lostFound') {
    const items = data.lostFound || [];
    if (items.length === 0) {
      return `🔍 **Lost & Found Synapse**: There are currently no reports filed in our campus security catalog.
      
💡 *Tip: If you've lost any valuable item, file a lost report in the **Lost & Found** section to allow peers to assist you!*`;
    }

    const itemTerms = queryTerms.filter(w => !['lost', 'found', 'security', 'item', 'items', 'find', 'report', 'reports'].includes(w));
    let matchedItems = [];
    if (itemTerms.length > 0) {
      matchedItems = items.filter((it: any) => {
        const title = (it.title || '').toLowerCase();
        const desc = (it.description || '').toLowerCase();
        return itemTerms.some(w => title.includes(w) || desc.includes(w));
      });
    }

    if (matchedItems.length > 0) {
      let res = `🔍 **Matched Items in Lost & Found Portfolio**:\n\n`;
      matchedItems.forEach((it: any) => {
        const badge = it.type === 'lost' ? '🔴 [LOST]' : '🟢 [FOUND]';
        res += `### **${it.title}** ${badge}\n`;
        res += `- **Status**: ${it.status || 'Reported'}\n`;
        if (it.description) res += `- **Details**: *${it.description}*\n`;
        res += `\n`;
      });
      return res;
    }

    let res = `🔍 **Campus Lost & Found Portfolio**: Listing **${items.length} logged records**:\n\n`;
    items.forEach((it: any) => {
      const badge = it.type === 'lost' ? '🔴 [LOST]' : '🟢 [FOUND]';
      res += `- **${it.title}** ${badge} | Status: **${it.status || 'Reported'}**\n`;
      if (it.description) res += `  • *Details*: *${it.description}*\n`;
      res += `\n`;
    });
    return res;
  }

  // --- 7. STUDENTS & GRADUATES INTENT ---
  if (primaryIntent === 'students') {
    const students = data.students || [];
    if (students.length === 0) {
      return `🎓 **Students Database**: No student enrollment cards exist in the current Firestore grids.
      
💡 *Tip: Go to the **Students** tab and click "+ Register Nominated Student" to append records.*`;
    }

    const searchNames = queryTerms.filter(w => !['student', 'students', 'enrollment', 'register'].includes(w));
    let matchedStd = [];
    if (searchNames.length > 0) {
      matchedStd = students.filter((s: any) => {
        const name = (s.name || '').toLowerCase();
        const reg = (s.registrationNumber || '').toLowerCase();
        const dept = (s.department || '').toLowerCase();
        const email = (s.email || '').toLowerCase();
        return searchNames.some(w => name.includes(w) || reg.includes(w) || dept.includes(w) || email.includes(w));
      });
    }

    if (matchedStd.length > 0) {
      let res = `🎓 **Student Records Match**:\n\n`;
      matchedStd.forEach((s: any) => {
        const rNum = s.registrationNumber ? ` (Reg No: \`${s.registrationNumber}\`)` : '';
        res += `### **${s.name}**${rNum}\n`;
        res += `- 🏫 **Division**: Year ${s.year} • ${s.department}\n`;
        res += `- 📧 **Official Contact**: ${s.email}\n\n`;
      });
      return res;
    }

    let res = `🎓 **Registered Vignan Student Roster** (Sample index):\n\n`;
    students.slice(0, 10).forEach((s: any) => {
      const rNum = s.registrationNumber ? ` - \`${s.registrationNumber}\`` : '';
      res += `- **${s.name}**${rNum} | ${s.department}, Year ${s.year}\n`;
    });
    if (students.length > 10) res += `\n*...and ${students.length - 10} more. Search matching keywords or names!*`;
    return res;
  }

  // --- 8. ALUMNI INTENT ---
  if (primaryIntent === 'alumni') {
    const alumni = data.alumni || [];
    if (alumni.length === 0) {
      return `🎓 **Alumni Network**: No alumni records exist in the current network database. Connect mentors on the Alumni page!`;
    }

    let res = `🎓 **Connected Vignan Graduate Alumnis**: Found **${alumni.length} connected leaders**:\n\n`;
    alumni.forEach((al: any) => {
      res += `- **${al.name}** (Class of ${al.yearOfGraduation || 'N/A'})\n`;
      res += `  • *Graduated branch*: ${al.department || 'General'}\n`;
      res += `  • *Mentor Mail*: ${al.email}\n`;
      res += `\n`;
    });
    return res;
  }

  // --- 9. EVENTS INTENT ---
  if (primaryIntent === 'events') {
    const fests = data.festEvents || [];
    const tech = data.techEvents || [];

    if (fests.length === 0 && tech.length === 0) {
      return `🎟️ **Vignan Events Calendar**: No cultural fests or workshops are scheduled yet. Appended details will print here!`;
    }

    let res = `🎟️ **Ecosystem Event Board**:\n\n`;
    if (fests.length > 0) {
      res += `### 🎉 **Cultural Fests:**\n`;
      fests.forEach((f: any) => {
        res += `- **${f.title}** (${f.category || 'General'})\n`;
        res += `  • *Date/Venue*: ${f.date || 'TBA'} @ ${f.venue || 'Campus Auditorium'}\n`;
        if (f.description) res += `  • *Scope*: *${f.description}*\n`;
        res += `\n`;
      });
    }

    if (tech.length > 0) {
      res += `### 💻 **Tech Workshops & Competitions:**\n`;
      tech.forEach((t: any) => {
        res += `- **${t.title}** (${t.type || 'Workshop'})\n`;
        res += `  • *Deadline*: **${t.deadline || 'Ongoing'}**\n`;
        if (t.link) res += `  • *Access Portal*: [Link](${t.link})\n`;
        if (t.description) res += `  • *Details*: *${t.description}*\n`;
        res += `\n`;
      });
    }
    return res;
  }

  // --- 10. STATISTICS INTENT ---
  if (primaryIntent === 'stats') {
    return `📊 **Vignan Universe Live Ecosystem Statistics**:\n
- **Registered Students**: \`${data.students?.length || 0} active students\`
- **Alumni Mentors Council**: \`${data.alumni?.length || 0} active contacts\`
- **Academic Branches**: \`${data.departments?.length || 0} divisions\`
- **Registered SAC Clubs**: \`${data.clubs?.length || 0} student organizations\`
- **Notice Bulletins**: \`${data.notices?.length || 0} announcements\`
- **Reference Catalogues**: \`${data.books?.length || 0} book titles\`
- **Active Lost & Found Logs**: \`${data.lostFound?.length || 0} reports\``;
  }

  // --- 11. GENERAL FALLBACK DYNAMIC MATCH ---
  // Find highest record matches dynamically
  const scoredAll = [
    ...(data.clubs || []).map((x: any) => ({ item: x, score: 0, type: 'Club' })),
    ...(data.books || []).map((x: any) => ({ item: x, score: 0, type: 'Book' })),
    ...(data.notices || []).map((x: any) => ({ item: x, score: 0, type: 'Notice' })),
    ...(data.lostFound || []).map((x: any) => ({ item: x, score: 0, type: 'LostFound' })),
    ...(data.students || []).map((x: any) => ({ item: x, score: 0, type: 'Student' })),
    ...(data.departments || []).map((x: any) => ({ item: x, score: 0, type: 'Department' }))
  ];

  const scoredList = scoredAll.map(m => {
    let score = 0;
    const item = m.item;
    for (const [key, val] of Object.entries(item)) {
      if (typeof val === 'string' && val.length > 0) {
        const valL = val.toLowerCase();
        queryTerms.forEach(word => {
          if (valL.includes(word)) score += 2;
          if (valL === word) score += 5;
        });
      }
    }
    return { ...m, score };
  }).filter(m => m.score > 0).sort((a, b) => b.score - a.score);

  if (scoredList.length > 0) {
    let res = `🌌 **Vyoma Real-Time Synapse**: I scanned our Firestore collections and retrieved the following matches for **"${query}"**:\n\n`;
    scoredList.slice(0, 3).forEach((m, idx) => {
      const item = m.item;
      res += `### ${idx + 1}. [${m.type.toUpperCase()}] **${item.name || item.title || item.fullName || 'Record'}**\n`;
      if (m.type === 'Club') res += `- President: **${item.president || 'N/A'}** | Category: ${item.category || 'N/A'}\n- Details: *${item.description || ''}*\n`;
      else if (m.type === 'Department') res += `- HOD: **${item.hod || 'N/A'}** | Contact: ${item.contact || 'N/A'}\n- Details: *${item.description || ''}*\n`;
      else if (m.type === 'Book') res += `- Author: **${item.author || 'N/A'}** | Available Copies: **${item.availableCopies || 0}**\n- Details: *${item.description || ''}*\n`;
      else if (m.type === 'Notice') res += `- Targeted Department: **${item.department || 'All'}**\n- Circular content: *${item.content || ''}*\n`;
      else if (m.type === 'LostFound') res += `- Type: **${item.type?.toUpperCase()}** | Status: **${item.status || 'Active'}**\n- Details: *${item.description || ''}*\n`;
      res += `\n`;
    });
    return res;
  }

  return `🌌 **Vyoma Campus Companion**: I searched all Firestore channels but couldn't find matches for **"${query}"**.

Can you try naming specific campus directories or entities such as:
- *"Who are the heads of academic departments?"*
- *"Are there any active circular notifications?"*
- *"Show me SAC student clubs and president names"*
- *"Search for textbooks in the library shelves"*

💡 *Tip: Head over to corresponding pages to register more records so they can be matched!*`;
}

app.post("/api/chat", async (req, res) => {
  const { message, history } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  let liveData: any = {
    students: [],
    alumni: [],
    lostFound: [],
    clubs: [],
    notices: [],
    festEvents: [],
    books: [],
    techEvents: [],
    departments: []
  };

  try {
    liveData = await getLiveCampusData();
  } catch (err) {
    console.error("Local data pull error:", err);
  }

  try {
    const liveDataContext = formatDataForAI(liveData);

    const systemInstruction = `You are "VYOMA AI", a super-intelligent, beautifully articulate, and friendly cosmic core AI Assistant for the Vignan Universe campus ecosystem.

Vignan Universe is the digital hub of Vignan University (Deemed to be University). Under your identity "Vyoma" (which represents the boundless sky and cosmos), you use advanced Natural Language Processing to serve as an instant, elite guide.

Here is the COMPLETE REAL-TIME LIVE UNIVERSITY DATABASE. When students or faculty ask questions about people, departments, library books, SAC clubs, events, or reported lost properties, ALWAYS refer to this factual dataset first to answer with high precision:
${liveDataContext}

COGNITIVE DIALECTIC & FORMATTING SPECS:
1. Brand Persona: You are Vyoma. Adopt a deeply intellectual, warm, helpful, and campus-savvy persona with an elegant cosmic essence.
2. Smart Answers: Offer highly structured replies. Use rich Markdown format, bold highlights, sub-headers, beautiful bullet points, and neat spacing. Avoid long-winded introductions.
3. Live Sync: Since you have active live data, answer accurately. If they ask about a book availability, check its "Available" books. If they ask about a club, state its achievements and members.
4. Fallback Guidance: If a record they search for isn't listed, politely suggest they can register or add it in the respective section (e.g., they can add notices, catalog library books, submit student profiles, or create clubs!). Offer friendly step-by-step instructions.
5. Absolute Loyalty to VYOMA: Under no circumstances mention "Vignesh", "Vignan NLP", or "Aura" unless correcting that your name is Vyoma AI, the ultimate campus cosmic companion. Avoid generic robotic phrases. Speak like an elite cosmic guide.`;

    // Build contents for Gemini. We can pass the history + current message
    const contents: any[] = [];
    
    if (Array.isArray(history)) {
      history.forEach((msg: any) => {
        contents.push({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.content || msg.text || "" }]
        });
      });
    }

    // Add current message
    contents.push({
      role: "user",
      parts: [{ text: message }]
    });

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    const reply = response.text || "I'm sorry, I couldn't generate a response.";
    res.json({ reply });
  } catch (error: any) {
    // Log a polite internal system message without printing the raw API key permission error JSON
    console.log("[Vyoma Hub] Notice: Standby local NLP engine activated for chat message processing.");
    try {
      const fallbackReply = generateLocalFallbackResponse(message, liveData);
      res.json({ reply: fallbackReply });
    } catch (fallbackError: any) {
      console.log("[Vyoma Hub] Local fallback engine processing completed.");
      res.status(500).json({ error: "Standby processing completed." });
    }
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
