# Styling Foundation

This folder contains global foundation styles for the Next.js app.

Files:

- tokens.css: design tokens and Tailwind theme mapping
- base.css: baseline document styles
- utilities.css: intentionally global utility classes

Guidelines:

1. Keep these files framework-wide and token-driven.
2. Do not add route-specific or feature-specific selectors here.
3. Prefer Tailwind utility classes for most styling.
4. Use colocated CSS Modules for complex component internals.
