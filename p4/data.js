/**
 * IIPS Connect - Initial Demo Dataset
 * Realistic illustrative data for International Institute of Professional Studies (IIPS), DAVV, Indore.
 */

const INITIAL_DATA = {
  // Current logged in demo context
  currentUser: {
    id: "student_1",
    role: "student", // "student" or "club_admin"
    activeClubId: "club_codelab" // when in club_admin mode
  },

  students: [
    {
      id: "student_1",
      name: "Aarav Sharma",
      course: "MCA (Integrated)",
      department: "Computer Science & IT",
      year: "4th Year",
      enrollment: "DE-21-MCA-042",
      email: "aarav.sharma@iips.edu.in",
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80",
      coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
      headline: "Full Stack Developer & Open Source Contributor | 4th Year MCA",
      bio: "Passionate computer applications student building modern web platforms and distributed tools. Always exploring cloud architectures, developer productivity, and campus tech community leadership.",
      location: "Takshashila Campus, Indore",
      skills: ["React", "JavaScript", "TypeScript", "Node.js", "Python", "Tailwind CSS", "Git & GitHub", "REST APIs", "Docker", "PostgreSQL"],
      links: {
        github: "https://github.com",
        linkedin: "https://linkedin.com",
        portfolio: "https://aaravsharma.dev"
      },
      projects: [
        {
          id: "proj_1",
          title: "IIPS Attendance Tracker PWA",
          description: "Offline-first progressive web app designed for IIPS students to keep track of lecture attendance, semester thresholds, and holiday schedules.",
          techStack: ["React", "IndexedDB", "Tailwind CSS"],
          link: "https://github.com/aarav/iips-tracker",
          stars: 42
        },
        {
          id: "proj_2",
          title: "DAVV Result Portal CLI",
          description: "Fast command-line utility for students to query semester marks and generate consolidated performance analytics directly from college result servers.",
          techStack: ["Node.js", "Cheerio", "Commander.js"],
          link: "https://github.com/aarav/davv-cli",
          stars: 87
        },
        {
          id: "proj_3",
          title: "Indore Green Mobility Dashboard",
          description: "Interactive visualization dashboard highlighting city EV charging stations and iBus transit real-time schedules for students.",
          techStack: ["Next.js", "Leaflet", "Chart.js"],
          link: "https://github.com/aarav/indore-mobility",
          stars: 31
        }
      ],
      achievements: [
        "1st Place - Smart India Hackathon (DAVV Internal Round 2024)",
        "Winner - IIPS CodeSprint Hackathon 2023",
        "Dean's Honor List for Academic Excellence (Semester IV & V)"
      ],
      certificates: [
        {
          title: "AWS Certified Cloud Practitioner",
          issuer: "Amazon Web Services",
          year: "2024"
        },
        {
          title: "Meta Front-End Developer Specialization",
          issuer: "Coursera / Meta",
          year: "2023"
        }
      ],
      clubsJoined: ["club_codelab"]
    },
    {
      id: "student_2",
      name: "Ananya Verma",
      course: "M.Tech (IT Integrated)",
      department: "Information Technology",
      year: "3rd Year",
      enrollment: "DE-22-MTI-019",
      email: "ananya.verma@iips.edu.in",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      coverImage: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1200&q=80",
      headline: "UI/UX Designer & Product Researcher | Design Guild Member",
      bio: "Crafting intuitive digital experiences and user-centric interfaces. Advocate for campus accessibility, Figma component libraries, and clean micro-interactions.",
      location: "Indore, MP",
      skills: ["Figma", "Design Systems", "User Research", "Wireframing", "HTML/CSS", "Design Tokens", "Prototyping"],
      links: {
        github: "https://github.com",
        linkedin: "https://linkedin.com",
        portfolio: "https://ananya.design"
      },
      projects: [
        {
          id: "proj_4",
          title: "IIPS Library App Redesign",
          description: "Complete case study and interactive prototype redesigning the central university library book reservation system.",
          techStack: ["Figma", "User Interviews", "Usability Testing"],
          link: "https://behance.net",
          stars: 64
        }
      ],
      achievements: [
        "Gold Medalist - DAVV Inter-Collegiate Digital Art Meet 2023",
        "Top 10 Finalist - National Designathon 2024"
      ],
      certificates: [
        {
          title: "Google UX Design Professional Certificate",
          issuer: "Google",
          year: "2023"
        }
      ],
      clubsJoined: ["club_design", "club_lens"]
    },
    {
      id: "student_3",
      name: "Rohan Patel",
      course: "MBA (Management Science 5Y)",
      department: "Management Studies",
      year: "4th Year",
      enrollment: "DE-21-MS-088",
      email: "rohan.patel@iips.edu.in",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
      coverImage: "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=80",
      headline: "Growth Marketer & Head of Operations @ E-Cell IIPS",
      bio: "Bridging the gap between technology and business strategy. Leading youth entrepreneurship cohorts, corporate sponsorship drives, and campus venture pitch events.",
      location: "Indore, MP",
      skills: ["Event Management", "Pitch Decks", "Public Speaking", "Financial Modeling", "Sponsorship Outreach", "Strategic Planning"],
      links: {
        linkedin: "https://linkedin.com",
        portfolio: "https://rohanpatel.me"
      },
      projects: [
        {
          id: "proj_5",
          title: "Indore E-Summit 2024 Sponsorship Kit",
          description: "Structured corporate sponsorship program that secured 14 corporate partners for central India's premier student entrepreneurship summit.",
          techStack: ["Canva", "Excel", "CRM"],
          link: "https://ecelliips.org",
          stars: 29
        }
      ],
      achievements: [
        "Best Student Leader Award - IIPS Annual Gathering 2023",
        "Managed 1,200+ delegates during Central India Youth Conclave"
      ],
      certificates: [
        {
          title: "Digital Marketing & Analytics",
          issuer: "IIM Bangalore Online",
          year: "2024"
        }
      ],
      clubsJoined: ["club_ecell"]
    },
    {
      id: "student_4",
      name: "Priya Mehta",
      course: "BCA",
      department: "Computer Applications",
      year: "3rd Year",
      enrollment: "DE-22-BCA-014",
      email: "priya.mehta@iips.edu.in",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
      coverImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80",
      headline: "AI/ML Enthusiast | Python Developer | Open Source Contributor",
      bio: "Passionate about Machine Learning, NLP, and intelligent agents. When not training models, I can be found running coding bootcamps for 1st-year juniors.",
      location: "Indore, MP",
      skills: ["Python", "TensorFlow", "Scikit-Learn", "Pandas", "SQL", "Streamlit", "C++", "Data Structures"],
      links: {
        github: "https://github.com",
        linkedin: "https://linkedin.com"
      },
      projects: [
        {
          id: "proj_6",
          title: "Campus Chatbot for IIPS Syllabus",
          description: "RAG-powered conversational assistant to answer student queries regarding course curricula, exam schemes, and internal marks.",
          techStack: ["Python", "LangChain", "ChromaDB", "Streamlit"],
          link: "https://github.com",
          stars: 52
        }
      ],
      achievements: [
        "1st Place - IIPS Algorithmic Coding Challenge 2024",
        "Google Cloud Arcade Participant"
      ],
      certificates: [
        {
          title: "Deep Learning Specialization",
          issuer: "DeepLearning.AI",
          year: "2024"
        }
      ],
      clubsJoined: ["club_codelab"]
    },
    {
      id: "student_5",
      name: "Kabir Jain",
      course: "MBA (Advertising & Public Relations)",
      department: "Media & Management",
      year: "2nd Year",
      enrollment: "DE-23-APR-007",
      email: "kabir.jain@iips.edu.in",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
      coverImage: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80",
      headline: "Brand Storyteller, Theatre Artist & Scriptwriter",
      bio: "Stage actor with Pratibimb Cultural Club. Passionate about advertising campaigns, scriptwriting, street plays (Nukkad Natak), and PR communications.",
      location: "Indore, MP",
      skills: ["Public Relations", "Brand Strategy", "Theatre & Acting", "Script Writing", "Creative Copywriting", "Content Direction"],
      links: {
        linkedin: "https://linkedin.com",
        portfolio: "https://kabirjain.me"
      },
      projects: [
        {
          id: "proj_7",
          title: "Indore Cleanliness Street Play Campaign",
          description: "Conceived and directed a 7-episode street play series on waste segregation performed across major public hubs in Indore.",
          techStack: ["Theatre", "Scriptwriting", "Directing"],
          link: "https://youtube.com",
          stars: 18
        }
      ],
      achievements: [
        "Best Actor in Male Lead - DAVV Youth Festival 2023",
        "Winner - All MP Inter-Varsity Street Play 2024"
      ],
      certificates: [
        {
          title: "PR & Crisis Communication",
          issuer: "Public Relations Society of India",
          year: "2023"
        }
      ],
      clubsJoined: ["club_pratibimb"]
    },
    {
      id: "student_6",
      name: "Neha Joshi",
      course: "B.Com (Hons)",
      department: "Commerce",
      year: "2nd Year",
      enrollment: "DE-23-BCH-031",
      email: "neha.joshi@iips.edu.in",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
      coverImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
      headline: "Finance Enthusiast | Budgeting Lead @ Spardha Sports Club",
      bio: "Finance and accounting geek with a deep passion for financial modeling, equity markets, and managing sports tournament budgets at IIPS.",
      location: "Indore, MP",
      skills: ["Financial Analysis", "Excel Modeling", "Accounting", "Event Budgeting", "Auditing", "Taxation"],
      links: {
        linkedin: "https://linkedin.com"
      },
      projects: [
        {
          id: "proj_8",
          title: "IIPS Spardha Annual Sports Budgeting Model",
          description: "Dynamic Excel financial sheet tracking vendor contracts, equipment purchase, and referee honorariums with automated variance analysis.",
          techStack: ["Advanced Excel", "VBA", "PowerBI"],
          link: "https://github.com",
          stars: 12
        }
      ],
      achievements: [
        "Top Performer in Financial Accounting (Batch of 2023-2026)",
        "Junior Badminton Runner-Up DAVV 2023"
      ],
      certificates: [
        {
          title: "Financial Markets Certified",
          issuer: "NSE Academy",
          year: "2023"
        }
      ],
      clubsJoined: ["club_spardha"]
    },
    {
      id: "student_7",
      name: "Devendra Rathore",
      course: "MCA (Integrated)",
      department: "Computer Science & IT",
      year: "2nd Year",
      enrollment: "DE-23-MCA-018",
      email: "devendra.rathore@iips.edu.in",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
      coverImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80",
      headline: "Backend Enthusiast | Go & Linux Explorer",
      bio: "Building robust APIs and exploring microservices, Linux internals, and database performance tuning. Passionate coder looking to join active campus projects.",
      location: "Indore, MP",
      skills: ["Go", "Node.js", "Linux", "PostgreSQL", "Docker", "Redis", "C++"],
      links: {
        github: "https://github.com",
        linkedin: "https://linkedin.com"
      },
      projects: [],
      achievements: [
        "Dean's List Semester II"
      ],
      certificates: [],
      clubsJoined: []
    },
    {
      id: "student_8",
      name: "Tanvi Kulkarni",
      course: "M.Tech (IT Integrated)",
      department: "Information Technology",
      year: "2nd Year",
      enrollment: "DE-23-MTI-045",
      email: "tanvi.kulkarni@iips.edu.in",
      avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80",
      coverImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
      headline: "Flutter Developer | Android Enthusiast | Tech Community Volunteer",
      bio: "Creating beautiful, performant mobile apps for Android and iOS using Flutter. Active participant in community hackathons and technical events.",
      location: "Indore, MP",
      skills: ["Flutter", "Dart", "Firebase", "Android Studio", "Java", "REST APIs", "Git"],
      links: {
        github: "https://github.com",
        linkedin: "https://linkedin.com"
      },
      projects: [
        {
          id: "proj_9",
          title: "DAVV Transit Tracker Mobile App",
          description: "Flutter prototype tracking university shuttle buses between Bhanwarkua, Takshashila campus, and IET campus.",
          techStack: ["Flutter", "Dart", "Google Maps SDK"],
          link: "https://github.com",
          stars: 24
        }
      ],
      achievements: [
        "Participant - Indore Women in Tech Code Jam 2024"
      ],
      certificates: [],
      clubsJoined: []
    }
  ],

  clubs: [
    {
      id: "club_codelab",
      name: "IIPS CodeLab",
      slug: "codelab",
      tagline: "The Official Tech & Open Source Guild of IIPS DAVV",
      category: "Technology",
      accentColor: "#3657D6",
      logo: "https://images.unsplash.com/photo-1618401471353-b98aedd04e11?auto=format&fit=crop&w=300&q=80",
      coverImage: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80",
      founded: "2018",
      leadName: "Aarav Sharma (Lead)",
      facultyAdvisor: "Dr. Shaligram Prajapat",
      room: "Lab 3 & Computer Center, IIPS",
      meetingTime: "Every Friday, 4:30 PM",
      description: "IIPS CodeLab is the premier student-run software engineering community at IIPS DAVV. We empower students across MCA, M.Tech, and BCA to collaborate on real-world software, open-source projects, algorithms, and annual campus hackathons.",
      areasOfInterest: ["Web Development", "AI & Machine Learning", "Cloud Infrastructure", "Competitive Programming", "Open Source", "Cybersecurity"],
      memberCount: 42,
      recruitmentOpen: true,
      social: {
        github: "https://github.com/iips-codelab",
        linkedin: "https://linkedin.com/company/iips-codelab",
        discord: "https://discord.gg/codelab"
      },
      members: [
        { studentId: "student_1", role: "President & Tech Lead", joinedDate: "2022-08-10" },
        { studentId: "student_4", role: "Core Member - AI/ML Track", joinedDate: "2023-09-01" },
        { studentId: "student_7", role: "Junior Member", joinedDate: "2024-02-15" }
      ]
    },
    {
      id: "club_ecell",
      name: "E-Cell IIPS",
      slug: "ecell",
      tagline: "Fostering Student Startups, Innovation & Venture Building",
      category: "Entrepreneurship",
      accentColor: "#D97706",
      logo: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=300&q=80",
      coverImage: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=80",
      founded: "2017",
      leadName: "Rohan Patel (Operations Head)",
      facultyAdvisor: "Prof. B.K. Tripathi",
      room: "Seminar Hall 2, IIPS DAVV",
      meetingTime: "Every Wednesday, 5:00 PM",
      description: "The Entrepreneurship Cell of IIPS DAVV nurtures budding student founders, brings angel investors and startup alumni to campus, and hosts Indore's most anticipated collegiate business plan competitions.",
      areasOfInterest: ["Venture Building", "Product Management", "Pitching & Angel Funding", "Market Research", "Case Competitions"],
      memberCount: 35,
      recruitmentOpen: true,
      social: {
        linkedin: "https://linkedin.com/company/ecell-iips",
        instagram: "https://instagram.com/ecell_iips"
      },
      members: [
        { studentId: "student_3", role: "Head of Operations", joinedDate: "2021-09-12" }
      ]
    },
    {
      id: "club_pratibimb",
      name: "Pratibimb Cultural & Drama",
      slug: "pratibimb",
      tagline: "The Pulse of Theatre, Nukkad Natak, Music & Dance at IIPS",
      category: "Cultural",
      accentColor: "#DC2626",
      logo: "https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?auto=format&fit=crop&w=300&q=80",
      coverImage: "https://images.unsplash.com/photo-1514306191717-452ec28c7814?auto=format&fit=crop&w=1200&q=80",
      founded: "2015",
      leadName: "Kabir Jain (Dramatic Director)",
      facultyAdvisor: "Dr. Geeta Sharma",
      room: "IIPS Open Air Theatre & Audiorium",
      meetingTime: "Every Thursday & Saturday, 4:00 PM",
      description: "Pratibimb is the premier cultural powerhouse of IIPS DAVV. Our teams represent the university at state and national youth fests, staging evocative street plays (Nukkad Natak), musical ensembles, and stage productions.",
      areasOfInterest: ["Street Plays (Nukkad Natak)", "Stage Theatre", "Classical & Contemporary Dance", "Vocal Music", "Scriptwriting"],
      memberCount: 58,
      recruitmentOpen: true,
      social: {
        instagram: "https://instagram.com/pratibimb_iips",
        youtube: "https://youtube.com/pratibimbiips"
      },
      members: [
        { studentId: "student_5", role: "Dramatic Director", joinedDate: "2023-01-15" }
      ]
    },
    {
      id: "club_lens",
      name: "Lens IIPS",
      slug: "lens",
      tagline: "Visual Arts, Cinematography & Campus Chroniclers",
      category: "Photography",
      accentColor: "#7C3AED",
      logo: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=300&q=80",
      coverImage: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&w=1200&q=80",
      founded: "2019",
      leadName: "Yashvardhan Rao",
      facultyAdvisor: "Prof. Yamini Karmarkar",
      room: "Media Studio 1, IIPS",
      meetingTime: "Bi-weekly Sunday Photowalks",
      description: "Lens IIPS captures the vibrant energy, milestones, festivals, and everyday human stories across the Takshashila campus. We train students in DSLR cinematography, editing suites, and photojournalism.",
      areasOfInterest: ["DSLR & Mirrorless Photography", "AfterEffects & Premiere Editing", "Documentary Filmmaking", "Campus Photojournalism"],
      memberCount: 28,
      recruitmentOpen: false,
      social: {
        instagram: "https://instagram.com/lensiips",
        behance: "https://behance.net/lensiips"
      },
      members: [
        { studentId: "student_2", role: "Creative Visualist", joinedDate: "2023-03-20" }
      ]
    },
    {
      id: "club_design",
      name: "Atelier Design Guild",
      slug: "atelier-design",
      tagline: "UI/UX, Visual Branding & Digital Product Design",
      category: "Arts and Design",
      accentColor: "#EC4899",
      logo: "https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=300&q=80",
      coverImage: "https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=1200&q=80",
      founded: "2021",
      leadName: "Ananya Verma (Design Lead)",
      facultyAdvisor: "Dr. Kirti Mathur",
      room: "Design Studio, 2nd Floor, IIPS",
      meetingTime: "Every Tuesday, 4:30 PM",
      description: "Atelier is dedicated to the craft of digital product design. We mentor students in UI/UX research, Figma component systems, typography, 3D illustrations, and branding for campus initiatives.",
      areasOfInterest: ["Figma Systems", "UI/UX Research", "Brand Identity", "Motion Graphics", "3D Art with Spline"],
      memberCount: 24,
      recruitmentOpen: true,
      social: {
        dribbble: "https://dribbble.com/atelieriips",
        linkedin: "https://linkedin.com"
      },
      members: [
        { studentId: "student_2", role: "Design Lead", joinedDate: "2022-10-05" }
      ]
    },
    {
      id: "club_spardha",
      name: "Spardha Sports Club",
      slug: "spardha",
      tagline: "Inter-Department Athletic Excellence & E-Sports League",
      category: "Sports",
      accentColor: "#059669",
      logo: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=300&q=80",
      coverImage: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80",
      founded: "2016",
      leadName: "Siddharth Malviya",
      facultyAdvisor: "Dr. Manminder Singh",
      room: "DAVV Sports Complex & Gymnasium",
      meetingTime: "Daily 6:00 AM & 5:00 PM Practices",
      description: "Spardha oversees all collegiate sports leagues at IIPS DAVV—from the premier Box Cricket League (BCL) and Football Shield to Table Tennis, Badminton, Chess, and campus E-Sports cups.",
      areasOfInterest: ["Cricket & BCL", "Football", "Badminton & Table Tennis", "Chess & Strategy", "E-Sports (Valorant & BGMI)"],
      memberCount: 64,
      recruitmentOpen: true,
      social: {
        instagram: "https://instagram.com/spardha_iips"
      },
      members: [
        { studentId: "student_6", role: "Treasurer & Event Coordinator", joinedDate: "2023-08-11" }
      ]
    }
  ],

  // Social Feed Posts
  posts: [
    {
      id: "post_1",
      authorId: "club_codelab",
      authorType: "club",
      authorName: "IIPS CodeLab",
      authorAvatar: "https://images.unsplash.com/photo-1618401471353-b98aedd04e11?auto=format&fit=crop&w=300&q=80",
      authorBadge: "Official Tech Club",
      createdAt: "2026-10-15T11:30:00Z",
      type: "announcement",
      title: "Announcing IIPS HackSprint 2026: 36-Hour Campus Hackathon! 🚀",
      content: "Gear up, builders! IIPS CodeLab is thrilled to unveil the 2026 edition of HackSprint. This year's tracks include AI Agents for Campus Life, Open Civic Data for Indore, and Sustainable Green Tech.\n\nOpen to all students across MCA, M.Tech, MBA, and BCA batches. Cash prizes worth ₹50,000, cloud credits, and incubation mentorship for top 3 teams. Registration link opens this Friday!",
      image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1000&q=80",
      tags: ["Hackathon", "OpenSource", "Coding", "CampusLife"],
      likes: ["student_1", "student_2", "student_4", "student_7"],
      bookmarks: ["student_1"],
      comments: [
        {
          id: "c_1",
          authorId: "student_4",
          authorName: "Priya Mehta",
          authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
          content: "Can 1st-year BCA students form mixed teams with MCA seniors?",
          createdAt: "2026-10-15T12:10:00Z"
        },
        {
          id: "c_2",
          authorId: "club_codelab",
          authorName: "IIPS CodeLab",
          authorAvatar: "https://images.unsplash.com/photo-1618401471353-b98aedd04e11?auto=format&fit=crop&w=300&q=80",
          content: "Yes, absolutely! We actively encourage inter-departmental and cross-year teams.",
          createdAt: "2026-10-15T12:25:00Z"
        }
      ]
    },
    {
      id: "post_2",
      authorId: "student_1",
      authorType: "student",
      authorName: "Aarav Sharma",
      authorAvatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80",
      authorBadge: "MCA 4th Year",
      createdAt: "2026-10-14T17:45:00Z",
      type: "project",
      title: "Built an open-source CLI for DAVV exam results! ⚡",
      content: "Tired of slow university portals during result days, I wrote a lightweight Node.js CLI tool that queries the DAVV result mirrors, parses the marksheet table, and computes semester SGPA instantly from the terminal.\n\nCheck out the GitHub repo and star it if you find it helpful! Pull requests for result graphing are welcome.",
      image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1000&q=80",
      tags: ["NodeJS", "OpenSource", "CLI", "WebScraping"],
      likes: ["student_2", "student_3", "student_4", "student_5", "student_8"],
      bookmarks: ["student_4"],
      comments: [
        {
          id: "c_3",
          authorId: "student_7",
          authorName: "Devendra Rathore",
          authorAvatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
          content: "Just tested it for Semester 3 marks, worked like a charm in 400ms! Clean code on GitHub too.",
          createdAt: "2026-10-14T18:20:00Z"
        }
      ]
    },
    {
      id: "post_3",
      authorId: "club_ecell",
      authorType: "club",
      authorName: "E-Cell IIPS",
      authorAvatar: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=300&q=80",
      authorBadge: "Official Cell",
      createdAt: "2026-10-14T10:15:00Z",
      type: "recruitment",
      title: "Recruitment Alert: Join the Core Team for Indore E-Summit 2026! 💼",
      content: "Want to lead corporate sponsorship, manage marketing campaigns reaching 10,000+ students, and host venture capitalists from Mumbai & Bengaluru?\n\nApplications are officially open for Associate Leads in Operations, Corporate Outreach, and Graphic Design. Head over to the Recruitment tab to apply before October 25th!",
      image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1000&q=80",
      tags: ["Recruitment", "Startups", "ESummit", "Leadership"],
      likes: ["student_1", "student_3", "student_6"],
      bookmarks: [],
      comments: []
    },
    {
      id: "post_4",
      authorId: "student_2",
      authorType: "student",
      authorName: "Ananya Verma",
      authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      authorBadge: "M.Tech IT 3rd Year",
      createdAt: "2026-10-13T16:00:00Z",
      type: "project",
      title: "Case Study: Redesigning the IIPS Central Library System 📚",
      content: "Spent the last three weeks conducting user interviews with 24 fellow students and faculty to understand the pain points of physical book reservations at the Central Library.\n\nHere is a sneak peek into the new modular design system with high-contrast accessibility and intuitive catalog filters.",
      image: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1000&q=80",
      tags: ["UIUX", "Figma", "DesignThinking", "Accessibility"],
      likes: ["student_1", "student_4", "student_5"],
      bookmarks: ["student_1"],
      comments: [
        {
          id: "c_4",
          authorId: "student_1",
          authorName: "Aarav Sharma",
          authorAvatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80",
          content: "The card contrast and search filter tags look super sharp! Let's build a prototype in CodeLab.",
          createdAt: "2026-10-13T16:40:00Z"
        }
      ]
    },
    {
      id: "post_5",
      authorId: "club_pratibimb",
      authorType: "club",
      authorName: "Pratibimb Cultural & Drama",
      authorAvatar: "https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?auto=format&fit=crop&w=300&q=80",
      authorBadge: "Official Cultural Club",
      createdAt: "2026-10-12T14:30:00Z",
      type: "announcement",
      title: "Auditions Tomorrow for 'Rang-e-Takshashila' Annual Street Play! 🎭",
      content: "Do you have the fire to command an audience with your voice, expressions, and rhythm? Pratibimb is organizing open auditions for this year's premiere street play on youth mental health and societal expectations.\n\nNo prior stage experience needed—just raw passion and willingness to rehearse. See you at 4:30 PM at the Open Air Theatre!",
      image: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=1000&q=80",
      tags: ["Theatre", "Auditions", "StreetPlay", "Culture"],
      likes: ["student_3", "student_5", "student_6"],
      bookmarks: [],
      comments: []
    },
    {
      id: "post_6",
      authorId: "student_4",
      authorType: "student",
      authorName: "Priya Mehta",
      authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
      authorBadge: "BCA 3rd Year",
      createdAt: "2026-10-11T19:20:00Z",
      type: "achievement",
      title: "Completed the Deep Learning Specialization by Andrew Ng! 🎓",
      content: "Super thrilled to share that I have wrapped up all 5 courses of the Deep Learning Specialization. Built Convolutional Neural Networks, Sequence Models, and Transformers from scratch in Python.\n\nNext goal: Fine-tuning small open-source LLMs to generate personalized coding practice problems for juniors.",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1000&q=80",
      tags: ["DeepLearning", "Python", "AI", "Milestone"],
      likes: ["student_1", "student_2", "student_7"],
      bookmarks: [],
      comments: []
    },
    {
      id: "post_7",
      authorId: "club_spardha",
      authorType: "club",
      authorName: "Spardha Sports Club",
      authorAvatar: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=300&q=80",
      authorBadge: "Official Sports Club",
      createdAt: "2026-10-10T12:00:00Z",
      type: "announcement",
      title: "Inter-Batch Box Cricket League (BCL) 2026 Fixtures Released! 🏏",
      content: "The most electrifying tournament of the autumn semester is back. 16 teams representing MCA, M.Tech, MBA MS, BCA, and APR will battle it out under the floodlights at DAVV Central Ground.\n\nCheck out the Events tab to register your team or secure your spectator pass. Opening clash: MCA Mavericks vs MBA Titans this Saturday!",
      image: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1000&q=80",
      tags: ["Cricket", "BCL", "Sports", "CampusTournaments"],
      likes: ["student_1", "student_3", "student_6", "student_7"],
      bookmarks: [],
      comments: []
    },
    {
      id: "post_8",
      authorId: "student_3",
      authorType: "student",
      authorName: "Rohan Patel",
      authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
      authorBadge: "MBA MS 4th Year",
      createdAt: "2026-10-09T15:10:00Z",
      type: "achievement",
      title: "Secured Title Sponsorship from Indore Tech Hub for E-Summit! 🤝",
      content: "Proud to share that our outreach wing has officially signed an MOU with Indore's leading IT conglomerate to co-sponsor the startup incubation track at IIPS E-Summit.\n\nHuge shoutout to the sponsorship team for relentless pitch decks over the last month!",
      image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1000&q=80",
      tags: ["Sponsorship", "Business", "Networking", "IndoreStartups"],
      likes: ["student_1", "student_2", "student_6"],
      bookmarks: [],
      comments: []
    }
  ],

  // Recruitment Opportunities
  recruitments: [
    {
      id: "rec_1",
      clubId: "club_codelab",
      title: "Frontend & Full Stack Lead Associate",
      role: "Technical Lead",
      category: "Technology",
      status: "open", // "open" or "closed"
      deadline: "2026-10-30",
      eligibility: "Open to 2nd, 3rd, and 4th Year students (MCA, M.Tech, BCA)",
      positions: 3,
      description: "Join the core development team behind IIPS student portals, hackathon platforms, and open-source tooling. You will lead project sprints, review code contributions from juniors, and run modern web workshops.",
      requiredSkills: ["JavaScript / TypeScript", "React or Vue", "Git & GitHub", "Tailwind CSS", "Team Collaboration"],
      responsibilities: [
        "Architect and maintain digital portals for IIPS campus events",
        "Conduct peer code reviews and mentor junior developers",
        "Organize weekly code jams and technical workshops"
      ],
      createdAt: "2026-10-10"
    },
    {
      id: "rec_2",
      clubId: "club_ecell",
      title: "Corporate Sponsorship & Relations Associate",
      role: "Outreach & Partnerships",
      category: "Entrepreneurship",
      status: "open",
      deadline: "2026-10-25",
      eligibility: "Open to all students (MBA, MCA, B.Com)",
      positions: 4,
      description: "Drive corporate partnerships, negotiate sponsorships with tech firms and angel networks across MP, and coordinate speaker logistics for the annual Indore E-Summit.",
      requiredSkills: ["Pitch Deck Creation", "Communication & Negotiation", "Email Etiquette", "Cold Outreach", "Spreadsheet Modeling"],
      responsibilities: [
        "Reach out to potential industry sponsors and venture funds",
        "Draft tailored sponsorship proposals and follow-up communications",
        "Manage sponsor deliverables on campus event days"
      ],
      createdAt: "2026-10-08"
    },
    {
      id: "rec_3",
      clubId: "club_pratibimb",
      title: "Street Play (Nukkad Natak) Ensemble Actor",
      role: "Performing Arts & Drama",
      category: "Cultural",
      status: "open",
      deadline: "2026-10-22",
      eligibility: "Open to all 1st, 2nd, and 3rd year students",
      positions: 8,
      description: "Represent IIPS DAVV at the prestigious state-level youth fests. Pratibimb is selecting energetic actors, chorus singers, and dholak/percussion players for our upcoming competitive street play production.",
      requiredSkills: ["Voice Projection", "Stage Presence", "Rhythm & Expression", "Dedication to Rehearsals"],
      responsibilities: [
        "Attend regular evening rehearsals (4:30 PM - 6:30 PM)",
        "Perform at campus fests and inter-university youth festivals",
        "Collaborate on script development and improv sessions"
      ],
      createdAt: "2026-10-09"
    },
    {
      id: "rec_4",
      clubId: "club_design",
      title: "UI/UX & Brand Design Associate",
      role: "Visual Designer",
      category: "Arts and Design",
      status: "open",
      deadline: "2026-10-28",
      eligibility: "Open to all years (design portfolio required)",
      positions: 2,
      description: "Work alongside club leads to design cohesive visual identities, social media posters, event swag, and website wireframes for college clubs and university symposiums.",
      requiredSkills: ["Figma", "Visual Hierarchy", "Typography & Color Theory", "Adobe Illustrator / Photoshop"],
      responsibilities: [
        "Create promotional banners and branding for campus events",
        "Design wireframes and clickable prototypes for campus web projects",
        "Maintain the IIPS student design asset kit"
      ],
      createdAt: "2026-10-11"
    },
    {
      id: "rec_5",
      clubId: "club_spardha",
      title: "Tournament Operations & Referee Coordinator",
      role: "Sports Operations",
      category: "Sports",
      status: "open",
      deadline: "2026-11-05",
      eligibility: "Open to 1st, 2nd, and 3rd year sports enthusiasts",
      positions: 5,
      description: "Manage fixtures, pitch preparation, live scoring, and umpire coordination for the upcoming Box Cricket League and Inter-Department Football Cup.",
      requiredSkills: ["Event Logistics", "Sports Rules (Cricket/Football)", "Leadership", "Live Scoring Tools"],
      responsibilities: [
        "Coordinate match schedules and team check-ins",
        "Ensure ground readiness and equipment availability",
        "Maintain official tournament leaderboards"
      ],
      createdAt: "2026-10-12"
    }
  ],

  // Applications
  applications: [
    {
      id: "app_1",
      recruitmentId: "rec_1",
      studentId: "student_4",
      studentName: "Priya Mehta",
      studentAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
      studentCourse: "BCA 3rd Year",
      clubId: "club_codelab",
      clubName: "IIPS CodeLab",
      roleTitle: "Frontend & Full Stack Lead Associate",
      status: "accepted", // "pending", "accepted", "rejected"
      appliedDate: "2026-10-11",
      reviewedDate: "2026-10-13",
      motivation: "I have been actively building Python and full-stack projects. Joining CodeLab's core development team will allow me to build institutional software for IIPS and guide first-year coders.",
      skills: ["Python", "JavaScript", "React", "SQL", "Git"],
      portfolioUrl: "https://github.com",
      resumeFileName: "Priya_Mehta_BCA_Resume.pdf",
      timeline: [
        { title: "Application Submitted", date: "2026-10-11", note: "Student submitted application." },
        { title: "Under Review", date: "2026-10-12", note: "Application screened by Club Admin." },
        { title: "Accepted", date: "2026-10-13", note: "Welcomed into IIPS CodeLab core team!" }
      ]
    },
    {
      id: "app_2",
      recruitmentId: "rec_1",
      studentId: "student_7",
      studentName: "Devendra Rathore",
      studentAvatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
      studentCourse: "MCA 2nd Year",
      clubId: "club_codelab",
      clubName: "IIPS CodeLab",
      roleTitle: "Frontend & Full Stack Lead Associate",
      status: "pending",
      appliedDate: "2026-10-13",
      reviewedDate: null,
      motivation: "I am passionate about backend systems, Docker, and Go. I want to build scalable APIs and microservices for upcoming campus events and learn from MCA seniors.",
      skills: ["Go", "Node.js", "Docker", "PostgreSQL", "Linux"],
      portfolioUrl: "https://github.com",
      resumeFileName: "Devendra_Rathore_MCA_Resume.pdf",
      timeline: [
        { title: "Application Submitted", date: "2026-10-13", note: "Student submitted application." },
        { title: "Under Review", date: "2026-10-14", note: "Pending technical review by club lead." }
      ]
    },
    {
      id: "app_3",
      recruitmentId: "rec_2",
      studentId: "student_6",
      studentName: "Neha Joshi",
      studentAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
      studentCourse: "B.Com 2nd Year",
      clubId: "club_ecell",
      clubName: "E-Cell IIPS",
      roleTitle: "Corporate Sponsorship & Relations Associate",
      status: "pending",
      appliedDate: "2026-10-12",
      reviewedDate: null,
      motivation: "With my accounting and financial analysis background, I can help E-Cell build dynamic financial sponsorship tiers and manage budgeting reports for Indore E-Summit.",
      skills: ["Financial Analysis", "Excel Modeling", "Outreach", "Accounting"],
      portfolioUrl: "https://linkedin.com",
      resumeFileName: "Neha_Joshi_BCom_Resume.pdf",
      timeline: [
        { title: "Application Submitted", date: "2026-10-12", note: "Student submitted application." },
        { title: "Under Review", date: "2026-10-13", note: "Application under assessment." }
      ]
    },
    {
      id: "app_4",
      recruitmentId: "rec_4",
      studentId: "student_8",
      studentName: "Tanvi Kulkarni",
      studentAvatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80",
      studentCourse: "M.Tech IT 2nd Year",
      clubId: "club_design",
      clubName: "Atelier Design Guild",
      roleTitle: "UI/UX & Brand Design Associate",
      status: "rejected",
      appliedDate: "2026-10-08",
      reviewedDate: "2026-10-11",
      motivation: "I love mobile app design and want to hone my Figma prototyping skills by designing campus app concepts.",
      skills: ["Flutter", "Figma Basics", "Canva"],
      portfolioUrl: "https://github.com",
      resumeFileName: "Tanvi_Kulkarni_Resume.pdf",
      timeline: [
        { title: "Application Submitted", date: "2026-10-08", note: "Student submitted application." },
        { title: "Review Completed", date: "2026-10-11", note: "Application not selected for this cohort." }
      ]
    }
  ],

  // Events
  events: [
    {
      id: "event_1",
      clubId: "club_codelab",
      title: "IIPS HackSprint 2026: 36-Hour Hackathon",
      category: "Technology",
      date: "2026-11-07",
      time: "09:00 AM - 09:00 PM (Next Day)",
      venue: "Computer Labs 2 & 3, Takshashila Campus, IIPS",
      banner: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1000&q=80",
      organizerName: "IIPS CodeLab",
      capacity: 120,
      registeredStudentIds: ["student_1", "student_4", "student_7"],
      deadline: "2026-11-04",
      description: "Our signature annual hackathon! Form teams of 2 to 4 students, pitch your prototypes, and build impactful software for smart campus management, civic governance, and educational tooling. Mentorship from IIPS tech alumni.",
      tags: ["Hackathon", "Coding", "Prizes", "Mentorship"]
    },
    {
      id: "event_2",
      clubId: "club_ecell",
      title: "Startup Pitch Deck & Angel Investment Masterclass",
      category: "Entrepreneurship",
      date: "2026-10-24",
      time: "03:30 PM - 06:00 PM",
      venue: "Main Auditorium, IIPS DAVV",
      banner: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1000&q=80",
      organizerName: "E-Cell IIPS",
      capacity: 200,
      registeredStudentIds: ["student_1", "student_3", "student_6"],
      deadline: "2026-10-23",
      description: "A hands-on masterclass led by prominent MP Angel Network investors. Learn how to validate business hypotheses, articulate unit economics, design compelling pitch decks, and raise seed capital.",
      tags: ["Startups", "Investment", "PitchDeck", "Masterclass"]
    },
    {
      id: "event_3",
      clubId: "club_pratibimb",
      title: "Rang-e-Takshashila: Annual Street Play Showcase",
      category: "Cultural",
      date: "2026-10-29",
      time: "05:00 PM - 07:30 PM",
      venue: "Open Air Amphitheatre, Takshashila Campus",
      banner: "https://images.unsplash.com/photo-1514306191717-452ec28c7814?auto=format&fit=crop&w=1000&q=80",
      organizerName: "Pratibimb Cultural Club",
      capacity: 350,
      registeredStudentIds: ["student_2", "student_5"],
      deadline: "2026-10-28",
      description: "An open-air evening of high-octane theatrical performances, live dholak rhythms, and socially poignant nukkad natak narratives presented by Pratibimb actors.",
      tags: ["Theatre", "Culture", "Drama", "LiveShow"]
    },
    {
      id: "event_4",
      clubId: "club_design",
      title: "Design System Sprint: Modern Figma Components",
      category: "Arts and Design",
      date: "2026-11-02",
      time: "02:00 PM - 05:00 PM",
      venue: "Design Studio 204, IIPS",
      banner: "https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=1000&q=80",
      organizerName: "Atelier Design Guild",
      capacity: 45,
      registeredStudentIds: ["student_2", "student_8"],
      deadline: "2026-10-31",
      description: "Hands-on workshop covering auto-layout 5.0, variables, design tokens, component variants, and interactive prototyping in Figma.",
      tags: ["Figma", "Design", "UIUX", "Workshop"]
    },
    {
      id: "event_5",
      clubId: "club_spardha",
      title: "Box Cricket League (BCL) Opening Match Night",
      category: "Sports",
      date: "2026-10-20",
      time: "06:00 PM - 10:00 PM",
      venue: "DAVV Central Sports Ground (Floodlights)",
      banner: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1000&q=80",
      organizerName: "Spardha Sports Club",
      capacity: 300,
      registeredStudentIds: ["student_1", "student_6", "student_7"],
      deadline: "2026-10-19",
      description: "Witness the clash of batches under the floodlights! MCA Mavericks take on MBA Titans in the explosive tournament inaugural fixture.",
      tags: ["Cricket", "BCL", "Sports", "NightMatch"]
    }
  ],

  // Student to Club Messages (Direct messaging strictly between student and club)
  conversations: [
    {
      id: "conv_codelab_student_1",
      clubId: "club_codelab",
      studentId: "student_1",
      clubName: "IIPS CodeLab",
      clubAvatar: "https://images.unsplash.com/photo-1618401471353-b98aedd04e11?auto=format&fit=crop&w=300&q=80",
      studentName: "Aarav Sharma",
      studentAvatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80",
      lastMessage: "Looking forward to mentoring the hackathon teams this weekend!",
      lastMessageTime: "2026-10-15T10:45:00Z",
      unreadCountStudent: 0,
      unreadCountClub: 0,
      messages: [
        {
          id: "m_1",
          sender: "club",
          text: "Hi Aarav! Thanks for preparing the repository template for HackSprint 2026.",
          timestamp: "2026-10-14T14:10:00Z"
        },
        {
          id: "m_2",
          sender: "student",
          text: "Happy to help! I've set up the boilerplate with React, Tailwind, and a sample Express API.",
          timestamp: "2026-10-14T14:22:00Z"
        },
        {
          id: "m_3",
          sender: "club",
          text: "Awesome. The faculty advisor approved Lab 2 and 3 for the 36-hour overnight duration.",
          timestamp: "2026-10-15T09:30:00Z"
        },
        {
          id: "m_4",
          sender: "student",
          text: "Looking forward to mentoring the hackathon teams this weekend!",
          timestamp: "2026-10-15T10:45:00Z"
        }
      ]
    },
    {
      id: "conv_ecell_student_1",
      clubId: "club_ecell",
      studentId: "student_1",
      clubName: "E-Cell IIPS",
      clubAvatar: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=300&q=80",
      studentName: "Aarav Sharma",
      studentAvatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80",
      lastMessage: "Yes, you can register for the masterclass via the Events tab directly.",
      lastMessageTime: "2026-10-13T16:20:00Z",
      unreadCountStudent: 1,
      unreadCountClub: 0,
      messages: [
        {
          id: "m_5",
          sender: "student",
          text: "Hello E-Cell team! Is the upcoming Pitch Deck masterclass open to students who don't have a startup yet?",
          timestamp: "2026-10-13T15:50:00Z"
        },
        {
          id: "m_6",
          sender: "club",
          text: "Yes, you can register for the masterclass via the Events tab directly. It is designed for beginners as well!",
          timestamp: "2026-10-13T16:20:00Z"
        }
      ]
    },
    {
      id: "conv_pratibimb_student_1",
      clubId: "club_pratibimb",
      studentId: "student_1",
      clubName: "Pratibimb Cultural & Drama",
      clubAvatar: "https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?auto=format&fit=crop&w=300&q=80",
      studentName: "Aarav Sharma",
      studentAvatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80",
      lastMessage: "Auditions start at 4:30 PM tomorrow at the amphitheatre.",
      lastMessageTime: "2026-10-12T18:05:00Z",
      unreadCountStudent: 0,
      unreadCountClub: 0,
      messages: [
        {
          id: "m_7",
          sender: "student",
          text: "Hi, do we need to prepare any specific script for the Nukkad Natak auditions?",
          timestamp: "2026-10-12T17:40:00Z"
        },
        {
          id: "m_8",
          sender: "club",
          text: "Auditions start at 4:30 PM tomorrow at the amphitheatre. We will provide prompt lines on the spot!",
          timestamp: "2026-10-12T18:05:00Z"
        }
      ]
    }
  ],

  // Notifications
  notifications: [
    {
      id: "notif_1",
      type: "application",
      title: "Application Accepted! 🎉",
      message: "Congratulations! Your application to IIPS CodeLab as Frontend Lead has been approved.",
      timestamp: "2026-10-13T10:00:00Z",
      read: false,
      link: "#applications",
      icon: "check-circle",
      iconColor: "#10B981"
    },
    {
      id: "notif_2",
      type: "event",
      title: "Registered: IIPS HackSprint 2026",
      message: "Your registration for HackSprint 2026 is confirmed. Check details in Events.",
      timestamp: "2026-10-14T12:00:00Z",
      read: false,
      link: "#events",
      icon: "calendar",
      iconColor: "#3657D6"
    },
    {
      id: "notif_3",
      type: "recruitment",
      title: "New Recruitment: E-Cell IIPS",
      message: "E-Cell has opened applications for Corporate Sponsorship Associate.",
      timestamp: "2026-10-14T09:30:00Z",
      read: true,
      link: "#recruitment",
      icon: "briefcase",
      iconColor: "#D97706"
    },
    {
      id: "notif_4",
      type: "message",
      title: "New Message from E-Cell IIPS",
      message: "Yes, you can register for the masterclass via the Events tab directly.",
      timestamp: "2026-10-13T16:20:00Z",
      read: false,
      link: "#messages",
      icon: "message-square",
      iconColor: "#8B5CF6"
    },
    {
      id: "notif_5",
      type: "post",
      title: "Priya Mehta liked your project post",
      message: "Priya Mehta and 4 others liked your DAVV Result Portal CLI showcase.",
      timestamp: "2026-10-14T18:25:00Z",
      read: true,
      link: "#feed",
      icon: "heart",
      iconColor: "#EC4899"
    }
  ]
};
