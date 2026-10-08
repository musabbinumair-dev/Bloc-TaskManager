# Task Manager Pro

A modern, responsive web application for managing your daily tasks and improving productivity.

![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-FFD700?style=for-the-badge&logo=vite&logoColor=black)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## Features

- **Add Tasks**: Quickly add new tasks with titles and descriptions.
- **Delete Tasks**: Remove tasks that are no longer needed.
- **Mark as Complete**: Toggle the completion status of tasks.
- **Filter Tasks**: View all, active, or completed tasks.
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices.
- **Dark Mode**: Toggle between light and dark themes.

## Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS 4
- **Language**: TypeScript
- **Icons**: Lucide React
- **Animation**: Framer Motion
- **Local Storage**: Custom hooks for persistent storage

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```bash
   cd task-manager-app
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

## Usage

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open [http://localhost:5173](http://localhost:5173) in your browser to view the application.

## Project Structure

```
task-manager-app/
├── src/
│   ├── components/        # React components
│   │   ├── TaskForm.tsx
│   │   ├── TaskItem.tsx
│   │   └── TaskList.tsx
│   ├── hooks/           # Custom React hooks
│   │   ├── useLocalStorage.ts
│   │   └── useTheme.ts
│   ├── styles/          # Global styles
│   │   └── index.css
│   ├── App.tsx          # Main application component
│   ├── main.tsx         # Entry point
│   └── vite-env.d.ts    # Type declarations
├── index.html           # HTML template
├── package.json         # Project dependencies
├── vite.config.ts       # Vite configuration
└── tsconfig.json        # TypeScript configuration
```

## Deployment

To build the project for production:

```bash
npm run build
```

The build output will be generated in the `dist/` directory.

## License

This project is licensed under the MIT License.