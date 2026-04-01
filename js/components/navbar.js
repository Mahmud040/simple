/**
 * navbar.js - Navigation Bar Logic
 * This file creates the menu at the top of every page.
 */

function renderNavbar() {
    const navContainer = document.getElementById('navbar');
    if (!navContainer) return;

    // Get current user to see if they are logged in
    const user = window.Auth.getUser();

    // Style the navbar container
    navContainer.className = "sticky top-0 z-50 w-full border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-[#09090b]";

    // Build the HTML for the navbar
    navContainer.innerHTML = `
      <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <!-- Logo -->
        <a href="index.html" class="flex items-center gap-2">
          <div class="bg-emerald-500 text-white p-1.5 rounded-lg">
            <i data-lucide="zap" class="h-5 w-5"></i>
          </div>
          <span class="text-xl font-bold dark:text-white">CUETConnect</span>
        </a>

        <!-- Desktop Links -->
        <nav class="hidden md:flex items-center gap-6 text-sm font-medium">
          <a href="feed.html" class="hover:text-emerald-500 dark:text-zinc-300">Feed</a>
          <a href="leaderboard.html" class="hover:text-emerald-500 dark:text-zinc-300">Leaderboard</a>
          ${user ? `<a href="my-requests.html" class="hover:text-emerald-500 dark:text-zinc-300">My Requests</a>` : ''}
        </nav>

        <!-- Right Side Buttons -->
        <div class="flex items-center gap-3">
          <button id="theme-toggle" class="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:text-zinc-400">
            <i data-lucide="sun" class="h-5 w-5 dark:hidden"></i>
            <i data-lucide="moon" class="h-5 w-5 hidden dark:block"></i>
          </button>

          ${user ? `
            <div class="flex items-center gap-3">
              <a href="create.html" class="bg-emerald-500 text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-emerald-600">
                Post Request
              </a>
              <a href="profile.html" class="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-400">
                <i data-lucide="user" class="h-5 w-5"></i>
              </a>
              <button id="logout-btn" class="p-2 text-zinc-400 hover:text-red-500">
                <i data-lucide="log-out" class="h-5 w-5"></i>
              </button>
            </div>
          ` : `
            <div class="flex items-center gap-2">
              <a href="login.html" class="text-sm font-medium px-3 py-2">Login</a>
              <a href="signup.html" class="bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 px-4 py-2 rounded-full text-sm font-bold">Sign Up</a>
            </div>
          `}
        </div>
      </div>
    `;

    // Setup Theme Toggle click
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
        themeBtn.onclick = () => {
            window.UI.toggleTheme();
            renderNavbar(); // Refresh navbar to update theme icon
        };
    }

    // Setup Logout click
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.onclick = () => {
            if (confirm('Are you sure you want to logout?')) {
                window.Auth.logout();
            }
        };
    }

    // Refresh icons after inserting HTML
    window.UI.refreshIcons();
}

// Run the function when the page is ready
document.addEventListener('DOMContentLoaded', renderNavbar);

// Make it global
window.Navbar = { render: renderNavbar };
