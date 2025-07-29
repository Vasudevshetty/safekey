# SafeKey Website

Modern, developer-friendly documentation website for SafeKey CLI tool.

## Features

- 🎨 Clean, modern design with dark/light theme
- 📱 Fully responsive layout
- 🔍 Advanced search functionality
- 📖 Comprehensive documentation
- ⚡ Fast static site generation
- 🎯 SEO optimized
- 🚀 Deployed to safekey.vasudevshetty.tech

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety and better DX
- **Tailwind CSS** - Utility-first CSS framework
- **Remark/Rehype** - Markdown processing
- **Zustand** - State management
- **Vercel** - Deployment platform

## Development

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

```bash
cd website
npm install
```

### Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm run start
```

### Export Static

```bash
npm run export
```

## Project Structure

```
website/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with theme
│   ├── page.tsx           # Homepage
│   └── docs/              # Documentation pages
├── components/            # React components
│   ├── Header.tsx         # Navigation header
│   ├── Footer.tsx         # Site footer
│   ├── Hero.tsx           # Homepage hero section
│   ├── Features.tsx       # Features showcase
│   └── ...
├── lib/                   # Utilities and helpers
│   ├── docs.ts           # Documentation processing
│   └── docsStore.ts      # State management
├── styles/               # Global styles
│   └── globals.css       # Tailwind and custom CSS
└── public/               # Static assets
```

## Content Management

Documentation content is sourced from the main `../docs/` directory and automatically processed into static pages. The site supports:

- Markdown with frontmatter
- GitHub Flavored Markdown
- Syntax highlighting
- Search functionality
- Category-based organization

## Deployment

The website is automatically deployed to Vercel when changes are pushed to the main branch. The production URL is [safekey.vasudevshetty.tech](https://safekey.vasudevshetty.tech).

### Environment Variables

```bash
# Optional: Analytics
NEXT_PUBLIC_GA_ID=your-analytics-id
```

## Contributing

1. Make changes to components or content
2. Test locally with `npm run dev`
3. Build and verify with `npm run build`
4. Submit a pull request

For content changes, edit the markdown files in the `../docs/` directory.

## SEO & Performance

- Optimized meta tags and Open Graph
- Semantic HTML structure
- Fast loading with Next.js optimization
- Mobile-first responsive design
- Accessible color contrast and navigation
- Structured data for search engines

## License

MIT License - see the main project README for details.
