# Quick Start Guide

## Installation

1. **Install dependencies:**
   ```bash
   bun install
   ```

2. **Customize your content:**
   - Edit `data/alqavi.md` with your personal information
   - Update `data/projects.json` with your projects (see example below)

3. **Run the development server:**
   ```bash
   bun run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Adding Your First Project

Edit `data/projects.json`:

```json
[
  {
    "id": "my-awesome-project",
    "name": "my-awesome-project",
    "displayName": "My Awesome Project",
    "githubUrl": "https://github.com/yourusername/my-awesome-project",
    "demoUrl": "https://my-awesome-project.vercel.app",
    "description": "A brief description of what this project does"
  }
]
```

**Important**: The portfolio will automatically fetch the `README.md` file from your GitHub repository. Make sure:
- Your repository has a `README.md` file
- The repository is public (or you handle authentication)
- The branch is either `main` or `master`

## Customizing Your Bio

Edit `data/alqavi.md` with your information. You can use full Markdown syntax:

```markdown
# Your Name

## About Me

Your bio here...

## Skills

- Skill 1
- Skill 2
- Skill 3

## Contact

- Email: your.email@example.com
- GitHub: [@yourusername](https://github.com/yourusername)
```

## Building for Production

```bash
bun run build
bun run start
```

## Troubleshooting

### README not loading from GitHub?
- Check that the repository URL is correct
- Ensure the repository is public
- Verify that `README.md` exists in the root of the repository
- Check browser console for CORS errors (GitHub raw URLs should work fine)

### Styling looks off?
- Make sure Tailwind CSS is properly configured
- Check that `tailwind.config.ts` has the Catppuccin Mocha colors
- Verify `app/globals.css` is imported in `app/layout.tsx`

### Port already in use?
- Change the port: `bun run dev -- -p 3001`
- Or kill the process using port 3000

