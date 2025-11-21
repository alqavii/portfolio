# VS Code-Themed Interactive Portfolio

A unique, developer-centric portfolio website that recreates the Visual Studio Code interface, complete with file explorer, editor tabs, and a mock terminal. Built with Next.js, TypeScript, Tailwind CSS, and styled with the Catppuccin Mocha theme.

## Features

- 🎨 **VS Code Interface**: Faithful recreation of the VS Code UI
- 📁 **File Explorer**: Navigate through projects and files
- 📝 **Markdown Editor**: Beautiful markdown rendering with syntax highlighting
- 🔗 **GitHub Integration**: Automatically fetches README files from GitHub repositories
- 🎯 **Catppuccin Mocha Theme**: Beautiful, warm dark color palette
- 📱 **Responsive Design**: Smooth interactions and resizable panels
- ⚡ **Fast & Modern**: Built with Next.js 14 and React 18

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) installed on your system

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd portfolio
```

2. Install dependencies:
```bash
bun install
```

3. Customize your content:
   - Edit `data/alqavi.md` with your personal information
   - Update `data/projects.json` with your projects

4. Run the development server:
```bash
bun run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
portfolio/
├── app/
│   ├── api/
│   │   └── alqavi/
│   │       └── route.ts          # API route for alqavi.md
│   ├── globals.css               # Global styles with Catppuccin theme
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Main page component
├── components/
│   ├── ActivityBar.tsx           # Left activity bar
│   ├── Sidebar.tsx               # File explorer sidebar
│   ├── Editor.tsx                # Main editor with tabs
│   ├── Terminal.tsx              # Mock terminal component
│   └── ResizablePanel.tsx        # Resizable panel component
├── data/
│   ├── alqavi.md                 # Your personal introduction
│   └── projects.json             # Project data
├── lib/
│   └── utils.ts                  # Utility functions
└── package.json
```

## Customization

### Adding Projects

Edit `data/projects.json` to add your projects:

```json
[
  {
    "id": "my-project",
    "name": "my-project",
    "displayName": "My Awesome Project",
    "githubUrl": "https://github.com/username/my-project",
    "demoUrl": "https://my-project.vercel.app",
    "description": "A brief description of the project"
  }
]
```

When a project is clicked, the portfolio will automatically fetch the README.md from the GitHub repository.

### Personal Information

Edit `data/alqavi.md` to customize your personal introduction. This file supports full Markdown syntax.

### Theme Colors

The Catppuccin Mocha theme colors are defined in `tailwind.config.ts`. You can customize them there if needed.

## Building for Production

```bash
bun run build
bun run start
```

## Technologies Used

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **React Markdown** - Markdown rendering
- **Lucide React** - Icon library
- **Catppuccin Mocha** - Color theme

## License

MIT

