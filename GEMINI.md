# CUETConnect - Instructional Context

## Project Overview
CUETConnect is a peer-to-peer campus delivery platform designed for CUET students. It allows users to post delivery requests (food, documents, pharmacy, etc.) and for other students to accept and fulfill them for a reward.

- **Type**: Static Web Application (Frontend-only).
- **Tech Stack**: HTML5, Tailwind CSS (via CDN), Vanilla JavaScript, Lucide Icons.
- **Persistence**: Mock database and session management using browser `localStorage`.
- **Architecture**: 
    - **UI Components**: Modularized navbar (`navbar.js`) and UI helpers (`ui.js`).
    - **Logic Layers**: Separated into Library (`js/lib/`) for data/auth and Pages (`js/pages/`) for view-specific logic.
    - **Data Model**: Requests, Users, and Bookmarks stored as JSON strings in `localStorage`.

## Building and Running
Since this is a static site with no build step, you can run it using any simple web server or by opening the files directly in a browser.

- **Launch**: Open `index.html` in a web browser.
- **Live Development**: Use "Live Server" (VS Code extension) or `npx serve .` to preview changes in real-time.
- **Testing**: Manual testing in the browser. Clear `localStorage` to reset the application state.

## Development Conventions

### JavaScript Style
- **Procedural & Simple**: After recent refactoring, the codebase prefers simple, top-level functions over complex classes or deep object nesting to ensure accessibility for beginners.
- **Global Objects**: Core utilities are exposed via `window.DB`, `window.Auth`, and `window.UI`.
- **Naming**: Use camelCase for functions and variables. Use UPPER_CASE for constants.

### Security & Safety
- **XSS Prevention**: Always use `window.UI.sanitize(text)` when inserting user-generated content into `innerHTML`.
- **Auth Protection**: Use `window.Auth.requireAuth()` at the start of any page-level script that requires a logged-in session.

### UI & UX
- **Icons**: Use Lucide icons. Always call `window.UI.refreshIcons()` after dynamically injecting HTML that contains `<i data-lucide="...">` tags.
- **Notifications**: Use `window.UI.toast(message, type)` for user feedback.
- **Theming**: Tailwind CSS is used for all styling. Support for Dark Mode is managed via the `dark` class on the `<html>` element.

### Data Management
- **Mock DB**: All CRUD operations should go through `js/lib/db.js` to ensure consistency.
- **Session**: User sessions are handled in `js/lib/auth.js`.

## Key Files
- `js/lib/db.js`: The "Engine" - handles `localStorage` interactions.
- `js/lib/auth.js`: Handles login, signup, and session checks.
- `js/components/navbar.js`: Injects the navigation bar across all pages.
- `js/components/ui.js`: Common UI utilities (toast, time formatting, theme toggle).
