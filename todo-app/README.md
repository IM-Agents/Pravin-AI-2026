# Todo App

A clean, modern todo application built with React, TypeScript, and Vite.

## Features

- Create new todo items with title and optional description
- View all todos organized by status (pending/completed)
- Edit existing todos
- Mark todos as complete/incomplete
- Delete todos
- Data persists in localStorage
- Responsive design with dark mode support

## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Vitest** - Testing framework
- **React Testing Library** - Component testing

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm 9+

### Installation

```bash
cd todo-app
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The production build will be in the `dist` folder.

### Running Tests

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run
```

### Linting

```bash
npm run lint
```

## Project Structure

```
todo-app/
├── src/
│   ├── components/       # React components
│   │   ├── TodoForm.tsx  # Form for adding new todos
│   │   ├── TodoItem.tsx  # Individual todo item
│   │   └── TodoList.tsx  # List of todos
│   ├── hooks/
│   │   └── useTodos.ts   # Custom hook for todo state management
│   ├── services/
│   │   └── todoService.ts # LocalStorage persistence layer
│   ├── types/
│   │   └── todo.ts       # TypeScript type definitions
│   ├── test/
│   │   └── setup.ts      # Test configuration
│   ├── App.tsx           # Main application component
│   ├── App.css           # App styles
│   ├── index.css         # Global styles
│   └── main.tsx          # Application entry point
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Usage

1. **Add a Todo**: Enter a title (required) and optionally a description, then click "Add Todo"
2. **Complete a Todo**: Click the checkbox next to a todo to mark it as complete
3. **Edit a Todo**: Click the "Edit" button, modify the title/description, and click "Save"
4. **Delete a Todo**: Click the "Delete" button to remove a todo

## License

MIT
