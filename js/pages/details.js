/**
 * 
 * details.js - Request Details Page
 * This file handles showing all the information for ONE specific delivery request.
 */

// Global variable to hold the request data
let currentRequest = null;

/**
 * Initialize the page
 */
function initDetailsPage() {
    // 1. Must be logged in
    window.Auth.requireAuth();

    // 2. Get the ID from the URL (e.g., details.html?id=req_123)
    const urlParams = new URLSearchParams(window.location.search);
    const requestId = urlParams.get('id');

    if (!requestId) {
        // If no ID is found, go back to feed
        window.location.href = 'feed.html';
        return;
    }

    // 3. Find and show the request data
    showRequestDetails(requestId);
}

/**
 * Find the request in the database and put its info on the screen
 */
function showRequestDetails(id) {
    const allRequests = window.DB.getRequests();
    currentRequest = allRequests.find(req => req.id === id);

    // If request doesn't exist, show error message
    if (!currentRequest) {
        document.getElementById('details-container').innerHTML = `
            <div class="py-20 text-center">
                <h2 class="text-2xl font-bold text-zinc-400">Request not found</h2>
                <a href="feed.html" class="text-emerald-500 font-bold mt-4 inline-block">Go back to feed</a>
            </div>
        `;
        return;
    }

    const user = window.Auth.getUser();
    const isOwner = (currentRequest.postedBy === user.id);
    const s = window.UI.sanitize;

    // Put data into the HTML elements
    document.getElementById('title').textContent = s(currentRequest.title);
    document.getElementById('category').textContent = s(currentRequest.category);
    document.getElementById('posted-by').textContent = 'By ' + s(currentRequest.postedByName);
    document.getElementById('description').textContent = s(currentRequest.description);
    document.getElementById('reward').textContent = '৳' + s(String(currentRequest.reward));
    document.getElementById('pickup').textContent = s(currentRequest.pickupLocation);
    document.getElementById('dropoff').textContent = s(currentRequest.dropoffLocation);

    const date = new Date(currentRequest.postedAt);
    document.getElementById('posted-at').textContent = date.toLocaleString();

    // Set user initial icon
    document.getElementById('user-initial').textContent = currentRequest.postedByName.charAt(0);

    // Update the bookmark button icon
    const userBookmarks = window.DB.getBookmarks(user.id);
    const isBookmarked = userBookmarks.includes(currentRequest.id);
    const bookmarkIcon = document.getElementById('bookmark-icon');
    if (isBookmarked) {
        bookmarkIcon.classList.add('fill-emerald-500', 'text-emerald-500');
    } else {
        bookmarkIcon.classList.remove('fill-emerald-500', 'text-emerald-500');
    }

    // Decide which buttons to show (Accept vs status message)
    const actionContainer = document.getElementById('action-container');
    if (isOwner) {
        actionContainer.innerHTML = `
            <div class="w-full p-4 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-center text-zinc-500 font-bold text-sm">
                YOU POSTED THIS REQUEST
            </div>
        `;
    } else if (currentRequest.status !== 'open') {
        actionContainer.innerHTML = `
            <div class="w-full p-4 bg-amber-100 text-amber-600 rounded-xl text-center font-bold text-sm">
                THIS REQUEST IS ALREADY ${currentRequest.status.toUpperCase()}
            </div>
        `;
    } else {
        actionContainer.innerHTML = `
            <button onclick="handleAccept()" class="w-full py-4 bg-emerald-500 text-white rounded-xl font-bold text-lg hover:bg-emerald-600">
                Accept Delivery Task
            </button>
        `;
    }

    // Redraw Lucide icons
    window.UI.refreshIcons();
}

/**
 * Handle bookmark button click
 */
function handleBookmarkToggle() {
    const user = window.Auth.getUser();
    const wasAdded = window.DB.toggleBookmark(user.id, currentRequest.id);
    window.UI.toast(wasAdded ? 'Saved to bookmarks' : 'Removed from bookmarks');

    // Refresh the details to update the icon
    showRequestDetails(currentRequest.id);
}

/**
 * Handle accept button click
 */
function handleAccept() {
    const user = window.Auth.getUser();

    // Use the atomicAccept function to safely accept
    const result = window.DB.atomicAcceptRequest(currentRequest.id, user.id, user.name);

    if (result.success) {
        window.UI.toast('Request accepted! Check your tasks.', 'success');
        // Refresh to show that it's now accepted
        showRequestDetails(currentRequest.id);
    } else {
        window.UI.toast(result.message, 'error');
    }
}

// Start when page loads
document.addEventListener('DOMContentLoaded', initDetailsPage);

// Global access for HTML buttons
window.handleBookmarkToggle = handleBookmarkToggle;
window.handleAccept = handleAccept;
window.Details = {
    toggleBookmark: handleBookmarkToggle,
    accept: handleAccept
};
