import '@testing-library/jest-dom'

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }) => <img src={src} alt={alt} {...props} />
}))

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/'
  }),
  useSearchParams: () => ({
    get: jest.fn(() => null),
    getAll: jest.fn(() => []),
    has: jest.fn(() => false),
    toString: jest.fn(() => '')
  }),
  usePathname: () => '/'
}))

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
    form: ({ children, ...props }) => <form {...props}>{children}</form>,
    textarea: ({ children, ...props }) => <textarea {...props}>{children}</textarea>
  },
  AnimatePresence: ({ children }) => <>{children}</>
}))

// Mock lucide-react
jest.mock('lucide-react', () => ({
  TrendingUp: () => <span>TrendingUp</span>,
  Users: () => <span>Users</span>,
  Heart: () => <span>Heart</span>,
  Target: () => <span>Target</span>,
  Calendar: () => <span>Calendar</span>,
  Award: () => <span>Award</span>,
  BarChart3: () => <span>BarChart3</span>,
  MessageCircle: () => <span>MessageCircle</span>,
  ThumbsUp: () => <span>ThumbsUp</span>,
  Reply: () => <span>Reply</span>,
  Send: () => <span>Send</span>,
  Filter: () => <span>Filter</span>,
  SortAsc: () => <span>SortAsc</span>,
  ArrowRight: () => <span>ArrowRight</span>,
  CheckCircle: () => <span>CheckCircle</span>
}))

// Mock global console pour éviter les logs en mode test
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn()
}
