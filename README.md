# portfolio

Personal site styled like VS Code. Built with Next.js, TypeScript and Tailwind.

```bash
bun install
bun run dev
```

## Content

- `data/alqavi.md`, `data/contact.md`: the files in the explorer root
- `data/readmes/<project-id>.md`: project READMEs
- `data/projects.json`: project list, GitHub links and demo URLs
- `app/demos/`: the embedded qtc and ssvi demos

New markdown files also need an entry in `app/api/content/route.ts`.
