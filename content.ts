// All text on the site lives here. Items marked TODO need your real values.

export const profile = {
  name: ['İsmail Yiğit', 'Şendur'],
  role: 'Software Engineer',
  intro:
    'I study Software Engineering at İzmir University of Economics. Over two internships I shipped AI-backed products, from a healthcare chatbot to a Slack agent. As AI writes more of the code, I want to stay on the side that shapes the architecture and directs the AI, not the side it replaces.',
  email: 'yigitsendur1@gmail.com',
  github: 'https://github.com/YigitSendur',
  linkedin: 'https://www.linkedin.com/in/ismail-yigit-%C5%9Fendur-b385591b1/',
  cv: '/cv.pdf',
};

// newest first
export const experience = [
  {
    role: 'AI Applied Full Stack Developer (Intern)',
    company: 'Efsora Labs',
    period: 'Jul – Sep 2026',
    points: [
      'Built chatbot infrastructure for a healthcare provider end to end with FastAPI, React and TypeScript.',
      'Built an internal Slack agent that answers questions about channel conversations.',
      'Worked with AWS (EC2, S3, IAM), ran open-source LLMs on local hardware and measured memory, resource use and latency.',
      'Ran mobile test cycles for a portable ultrasound device project.',
    ],
  },
  {
    role: 'Software Engineering Intern',
    company: 'Efsora Labs',
    period: 'Jan – Feb 2026',
    points: [
      'Built a real-time multiplayer Tic-Tac-Toe on WebSockets, containerized with Docker and deployed on Render.',
      'Compared functional programming and OOP in practice; modelled data in PostgreSQL.',
      'Prepared and presented a 20-page talk on SOLID principles and design patterns to the team.',
    ],
  },
  {
    role: 'WIN – UC Berkeley AMENA Certificate Program',
    company: 'World Innovations Network',
    period: 'Winter 2024–2025, 4 months',
    points: [
      'Global entrepreneurship and applied-AI program with Silicon Valley mentors.',
      'Developed a product idea in a team with mentor feedback; the project has since become a company.',
    ],
  },
];

export type Project = {
  id: string;
  navLabel: string;
  title: string;
  summary: string;
  details: string[];
  stack: string;
  links: { label: string; href: string }[];
  note?: string;
  image?: string; // e.g. '/chatbot-blur.jpg' in public/
};

export const projects: Project[] = [
  {
    id: 'healthcare-chatbot',
    navLabel: 'Chatbot',
    title: 'Healthcare chatbot',
    summary: 'Chatbot infrastructure for a healthcare provider, built during my Efsora internship.',
    details: [
      'Worked across the stack: FastAPI services on the backend, a React and TypeScript chat interface on the front.',
      'The widget runs in Turkish, English, Russian and Arabic, including right-to-left layout for Arabic.',
      'Patients choose between continuing as a guest or signing in with the last four digits of their ID and phone number.',
      'Quick actions for doctors, appointments, address and departments sit above the input for the most common questions.',
    ],
    stack: 'React, TypeScript, FastAPI, Python',
    links: [],
    note: 'Client project. The code is confidential and the client’s name is blurred in the screenshots.',
    image: '/chatbot-blur.webp',
  },
  {
    id: 'slack-agent',
    navLabel: 'Slack Agent',
    title: 'Slack Agent',
    summary:
      'Reads a Slack channel, including thread replies, and answers questions about the conversation so nobody has to scroll back through days of messages.',
    details: [
      'Scans channels in parallel with a thread pool; sequential scanning became the bottleneck as the channel count grew.',
      'Caches all users once at startup instead of one Slack request per message author.',
      'Resolves raw user IDs in mentions before the transcript reaches the model.',
      'Gemini returns a fixed-schema JSON, so the React UI can render cards without guessing which fields exist.',
    ],
    stack: 'React (Vite), Axios, FastAPI, Slack SDK, Gemini API',
    links: [{ label: 'Source on GitHub', href: 'https://github.com/YigitSendur/Slack-Agent' }],
  },
  {
    id: 'tic-tac-toe',
    navLabel: 'Tic-Tac-Toe',
    title: 'Real-time Tic-Tac-Toe',
    summary: 'Two players, two browsers, one board, synced over WebSockets.',
    details: [
      'Game state is handled with functional programming patterns, including an Option monad.',
      'Runs in a Docker container and is deployed on Render.',
    ],
    stack: 'Node.js, Express, Socket.io, vanilla JavaScript, Docker',
    links: [
      { label: 'Play it live', href: 'https://tictactoe-s2nh.onrender.com/' },
      { label: 'Source on GitHub', href: 'https://github.com/YigitSendur/TicTacToe' },
    ],
    note: 'Hosted on a free tier: the first load can take up to a minute while the server wakes up.',
  },
];

export const extras = {
  talk: {
    name: 'SOLID principles and design patterns',
    text: 'A 20-page talk I prepared and gave at Efsora Labs.',
    href: 'TODO', // TODO: put the PDF in public/ and set '/solid-design-patterns.pdf'
  },
  skills: [
    ['Frontend', 'React, Next.js, TypeScript, Tailwind CSS, Framer Motion, Three.js, WebGL shaders'],
    ['UI architecture', 'Reusable component architecture, design tokens (primitive and semantic layers), responsive and accessible layouts'],
    ['Backend', 'FastAPI, Python, Node.js, Express, Socket.io, Java'],
    ['Infrastructure', 'Docker, AWS (EC2, S3, IAM), Render, Vercel, Git'],
    ['AI', 'Gemini API, prompt design for structured output, local LLMs'],
  ],
};

/**
 * The order of chapters is the order of sections on the page and of the
 * particle shapes in lib/particles/shapes.ts. `shape` is derived from the
 * position, so adding a project only means adding a shape in the same slot.
 */
const chapterList = [
  { id: 'top', label: 'Intro' },
  { id: 'experience', label: 'Experience' },
  ...projects.map((p) => ({ id: p.id, label: p.navLabel })),
  { id: 'also', label: 'Also' },
];

export const chapters = chapterList.map((c, shape) => ({ ...c, shape }));
export const shapeOf = (id: string) => chapters.find((c) => c.id === id)!.shape;
