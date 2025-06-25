# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands
- `npm run dev`: Start development server
- `npm run build`: Build the project for production
- `npm run preview`: Preview the built application

## Project Architecture

### Technology Stack
- **Frontend**: React 18 with Vite
- **UI Library**: Radix UI components + Tailwind CSS
- **Routing**: React Router DOM v6
- **Database**: Supabase (PostgreSQL)
- **Animation**: Framer Motion
- **Styling**: Tailwind CSS with custom configuration

### Application Structure
This is PAMS (Project and Asset Management System) - a comprehensive business management platform with multiple specialized dashboards:

**Core Layout**: Single-page application with sidebar navigation, header, and animated page transitions using Framer Motion

**Page Organization**:
- **Dashboard**: Main landing page (`/`)
- **Project Management**: Setup, listing, details with comprehensive project lifecycle management
- **HR & Personnel**: Staff registration, attendance, shift management, safety compliance
- **Inventory**: Equipment dispatch, materials inventory, procurement logging
- **Stakeholder Management**: Contractors, suppliers, legal agreements
- **Forms Hub**: Extensive collection of business forms (purchase requests, expense claims, site inspections, etc.)
- **Specialized Dashboards**: Site Manager, Contractor, Finance, Admin, AI Tools

### Key Architectural Patterns

**Component Organization**:
- `/components/ui/`: Reusable UI components based on Radix UI
- `/components/[domain]/`: Domain-specific components (hr, inventory, communication, etc.)
- `/pages/`: Top-level page components
- `/hooks/`: Custom React hooks (e.g., `useLocalStorage`)
- `/lib/`: Utilities and external service clients

**Data Management**:
- Supabase client configured in `/src/lib/supabaseClient.js`
- Local storage management through custom hooks
- Real-time features supported through Supabase subscriptions

**Visual Editor Integration**:
- Custom Vite plugins for inline editing capabilities
- Babel-based AST manipulation for development tools
- Edit mode functionality for content management

### Import Path Configuration
- Uses `@/` alias pointing to `/src` directory
- All imports use absolute paths from src root
- File extensions (.jsx) are explicit in imports

### Database Integration
- Supabase connection configured with public URL and anon key
- Client-side database operations throughout application
- Real-time subscriptions for live data updates

### Form Management
- Extensive forms system with reusable form components
- Generic form page system for rapid form deployment
- File upload capabilities integrated throughout

### State Management
- Local component state with React hooks
- Custom hooks for persistent state (localStorage)
- Supabase for server state management

### Styling Approach
- Tailwind CSS with custom color scheme
- Consistent design system using Radix UI primitives
- Responsive design patterns throughout
- Custom utility classes and component variants

## Development Notes

### Component Patterns
- Functional components with hooks
- Props destructuring is common
- Component composition over inheritance
- Consistent use of Radix UI patterns

### File Naming
- Use `.jsx` extension for React components
- PascalCase for component files
- camelCase for utility files
- Directory-based organization by feature

### Error Handling
- Custom error boundary setup in Vite config
- Runtime error reporting to parent window
- Console error monitoring and reporting

### Development Environment
- Hot module replacement with Vite
- Custom development plugins for visual editing
- CORS enabled for development
- Error overlay customization