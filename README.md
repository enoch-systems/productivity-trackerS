# Productivity Tracker

A modern, full-stack task management application built with React and Vite. Productivity Tracker helps you stay organized with a clean, intuitive interface for managing your daily tasks.

![Productivity Tracker](https://img.shields.io/badge/React-19.2.5-blue)
![Vite](https://img.shields.io/badge/Vite-8.0.10-purple)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.2.4-38bdf8)

## Features

- **User Authentication**: Secure registration and login system with JWT-based authentication
- **Task Management**: Create, read, update, and delete tasks with ease
- **Task Completion**: Mark tasks as done with visual feedback
- **Real-time Updates**: Automatic refresh of task list after any modification
- **Modern UI**: Clean, responsive design built with TailwindCSS
- **Keyboard Support**: Press Enter to quickly add new tasks
- **User Sessions**: Persistent authentication with logout functionality

## Tech Stack

### Frontend
- **React 19.2.5** - UI library
- **Vite 8.0.10** - Build tool and dev server
- **TailwindCSS 4.2.4** - Utility-first CSS framework
- **React DOM 19.2.5** - React DOM renderer

### Development Tools
- **ESLint 10.2.1** - Code linting
- **@vitejs/plugin-react 6.0.1** - React plugin for Vite

### Backend API
- Deployed on Railway at `https://productivity-webapp-production.up.railway.app`
- RESTful API with JWT authentication
- CORS-enabled for cross-origin requests

## Installation

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd todo-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

### Getting Started

1. **Register an Account**: Click "No account? Register" to create a new user account
2. **Login**: Enter your username and password to access your tasks
3. **Add Tasks**: Type a task in the input field and click "Add" or press Enter
4. **Complete Tasks**: Click the "Done" button to mark tasks as completed
5. **Delete Tasks**: Click the "Delete" button to remove tasks permanently
6. **Logout**: Click "Logout" to end your session

### API Endpoints

The application communicates with the backend API using the following endpoints:

- `POST /register` - Register a new user
- `POST /login` - Authenticate user and receive JWT token
- `GET /todos` - Retrieve all user tasks (requires authentication)
- `POST /todos` - Create a new task (requires authentication)
- `PUT /todos/:id` - Mark a task as done (requires authentication)
- `DELETE /todos/:id` - Delete a task (requires authentication)

All authenticated requests include the JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Available Scripts

- `npm run dev` - Start the development server with hot module replacement
- `npm run build` - Build the application for production
- `npm run lint` - Run ESLint to check code quality
- `npm run preview` - Preview the production build locally

## Project Structure

```
todo-frontend/
├── public/          # Static assets
├── src/
│   ├── App.jsx      # Main application component
│   ├── main.jsx     # Application entry point
│   └── index.css    # Global styles
├── index.html       # HTML template
├── package.json     # Project dependencies
├── vite.config.js   # Vite configuration
└── README.md        # This file
```

## Development

### Code Style

The project uses ESLint with React-specific rules to maintain code quality:
- `eslint-plugin-react-hooks` - Enforces React Hooks rules
- `eslint-plugin-react-refresh` - Optimizes React refresh behavior

### Building for Production

To create an optimized production build:

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues, questions, or suggestions, please open an issue on the repository.

---


