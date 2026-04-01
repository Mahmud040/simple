/**
 * feed.js - Feed Page Logic
 * This file handles showing all delivery requests on the feed page.
 */

// Global variables to keep track of filters
let currentCategory = 'All';
let searchQuery = '';

/**
 * Initialize the feed page
 */
function initFeed() {
    // 1. Check if user is logged in
    window.Auth.requireAuth();

    // 2. Draw filters and the initial feed
    renderCategoryFilters();
    renderRequestFeed();

    // 3. Setup search input
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.oninput = function(e) {
            searchQuery = e.target.value.toLowerCase();
            renderRequestFeed();
        };
    }
}

/**
 * Draw the category buttons (All, Food, etc.)
 */
function renderCategoryFilters() {
    const categories = ['All', 'Food', 'Documents', 'Pharmacy', 'Packages', 'Other'];
    const filterContainer = document.getElementById('category-filters');
    if (!filterContainer) return;

    let html = '';
    for (let cat of categories) {
        const isActive = (currentCategory === cat);
        const buttonClass = isActive 
            ? 'bg-emerald-500 text-white shadow-lg' 
            : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700';

        html += `
            <button onclick="setCategory('${cat}')" class="px-5 py-2 rounded-full text-sm font-bold transition-all ${buttonClass}">
                ${cat}
            </button>
        `;
    }
    filterContainer.innerHTML = html;
}

/**
 * Change the active category and refresh the feed
 */
function setCategory(category) {
    currentCategory = category;
    renderCategoryFilters();
    renderRequestFeed();
}

/**
 * Draw all the delivery requests in the feed
 */
function renderRequestFeed() {
    const feedContainer = document.getElementById('request-feed');
    if (!feedContainer) return;

    const user = window.Auth.getUser();
    const allRequests = window.DB.getRequests();
    const userBookmarks = window.DB.getBookmarks(user.id);

    // Filter the requests based on category and search query
    let filtered = allRequests.filter(req => req.status === 'open');

    if (currentCategory !== 'All') {
        filtered = filtered.filter(req => req.category === currentCategory);
    }

    if (searchQuery) {
        filtered = filtered.filter(req => 
            req.title.toLowerCase().includes(searchQuery) || 
            req.description.toLowerCase().includes(searchQuery)
        );
    }

    // If no requests match, show a "Not Found" message
    if (filtered.length === 0) {
        feedContainer.innerHTML = `
            <div class="col-span-full py-20 text-center">
                <h3 class="text-xl font-bold">No requests found</h3>
                <p class="text-zinc-500">Try searching for something else!</p>
            </div>
        `;
        return;
    }

    // Build the HTML for all requests
    let html = '';
    for (let req of filtered) {
        const isBookmarked = userBookmarks.includes(req.id);
        const isMyPost = (req.postedBy === user.id);
        const s = window.UI.sanitize;

        html += `
            <div class="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
                <div class="flex items-start justify-between mb-4">
                    <div class="flex items-center gap-3">
                        <div class="h-10 w-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">
                            ${s(req.postedByName.charAt(0))}
                        </div>
                        <div>
                            <h4 class="font-bold line-clamp-1">${s(req.title)}</h4>
                            <p class="text-xs text-zinc-500">${window.UI.formatTime(req.postedAt)} &bull; By ${s(req.postedByName)}</p>
                        </div>
                    </div>
                    <button onclick="handleBookmark('${req.id}')" class="p-2 ${isBookmarked ? 'text-emerald-500' : 'text-zinc-400'}">
                        <i data-lucide="bookmark" class="h-5 w-5" ${isBookmarked ? 'fill="currentColor"' : ''}></i>
                    </button>
                </div>

                <p class="text-sm text-zinc-600 dark:text-zinc-400 mb-4 line-clamp-2">
                    ${s(req.description)}
                </p>

                <div class="flex items-center gap-4 text-xs font-medium text-zinc-500 mb-6">
                    <span>From: <b>${s(req.pickupLocation)}</b></span>
                    <span>To: <b>${s(req.dropoffLocation)}</b></span>
                </div>

                <div class="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <span class="text-lg font-bold text-emerald-500 font-outfit">৳${s(String(req.reward))}</span>
                    
                    ${isMyPost ? `
                        <span class="text-xs font-bold text-zinc-400 uppercase">Your Post</span>
                    ` : `
                        <div class="flex gap-2">
                            <a href="details.html?id=${req.id}" class="px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-xs font-bold">Details</a>
                            <button onclick="handleAccept('${req.id}')" class="px-4 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold">Accept</button>
                        </div>
                    `}
                </div>
            </div>
        `;
    }
    feedContainer.innerHTML = html;

    // Refresh icons
    window.UI.refreshIcons();
}

/**
 * Handle bookmark button click
 */
function handleBookmark(id) {
    const user = window.Auth.getUser();
    const wasAdded = window.DB.toggleBookmark(user.id, id);
    window.UI.toast(wasAdded ? 'Added to bookmarks' : 'Removed from bookmarks');
    renderRequestFeed();
}

/**
 * Handle accept button click
 */
function handleAccept(id) {
    const user = window.Auth.getUser();
    const result = window.DB.atomicAcceptRequest(id, user.id, user.name);

    if (result.success) {
        window.UI.toast('Request accepted!', 'success');
        setTimeout(() => {
            window.location.href = `details.html?id=${id}`;
        }, 1000);
    } else {
        window.UI.toast(result.message, 'error');
    }
}

// Start the page logic when the document is ready
document.addEventListener('DOMContentLoaded', initFeed);

// Make these functions global so the "onclick" in HTML can find them
window.setCategory = setCategory;
window.handleBookmark = handleBookmark;
window.handleAccept = handleAccept;
