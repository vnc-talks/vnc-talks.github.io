# Welcome to VNS Blog

This is a lean, static blog built for markdown-first writing. Drop new `.md` files into the `posts/` folder, register them in `posts/index.json`, and the site will surface them automatically.

## How to publish

1. Add a markdown file in `posts/` using the slug as the filename (for example, `my-first-note.md`).
2. Append an entry to `posts/index.json` with `slug`, `title`, `summary`, `date`, and `tags`.
3. Open `index.html` in the browser (or host the folder anywhere static) and your post appears on the home grid.

## Writing tips

- Keep titles concise and summaries shorter than a tweet.
- Use headings to break up sections; they render cleanly in the article view.
- Inline code uses backticks, and fenced blocks (```) are supported for snippets.
- Links open in a new tab so readers stay on your post.

## Why this setup

> A quiet space makes it easier to focus on the words.

The design sticks to calm typography, soft shadows, and generous spacing. There is no build step, database, or runtime dependency—everything runs in vanilla HTML, CSS, and JavaScript so you can focus on writing.

Happy publishing!

