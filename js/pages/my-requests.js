/**
 * my-requests.js - My Requests Page
 * This file handles showing three types of requests:
 * 1. Requests you POSTED
 * 2. Requests you ACCEPTED (Your tasks)
 * 3. Requests you BOOKMARKED
 */

// Global variable to track which tab is active
let activeTab = 'posted';

/**
 * Initialize the page
 */
function initMyRequests() {
    window.Auth.requireAuth();
    renderPage();
}

/**
 * Switch between tabs (posted, accepted, bookmarks)
 */
function setTab(tabName) {
    activeTab = tabName;
    renderPage();
}

/**
 * Draw the content based on the active tab
 */
function renderPage() {
    const user = window.Auth.getUser();
    const allRequests = window.DB.getRequests();
    const userBookmarks = window.DB.getBookmarks(user.id);
    const container = document.getElementById('requests-container');

    // 1. Update the Tab Button colors
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        if (btn.dataset.tab === activeTab) {
            btn.classList.add('border-emerald-500', 'text-emerald-500');
        } else {
            btn.classList.remove('border-emerald-500', 'text-emerald-500');
        }
    });

    // 2. Filter the requests based on the active tab
    let listToShow = [];
    if (activeTab === 'posted') {
        listToShow = allRequests.filter(req => req.postedBy === user.id);
    } else if (activeTab === 'accepted') {
        listToShow = allRequests.filter(req => req.acceptedBy === user.id);
    } else if (activeTab === 'bookmarks') {
        listToShow = allRequests.filter(req => userBookmarks.includes(req.id));
    }

    // 3. If list is empty, show a nice message
    if (listToShow.length === 0) {
        container.innerHTML = `
            <div class="py-20 text-center">
                <h3 class="text-xl font-bold">No requests found here</h3>
                <p class="text-zinc-500">Items you ${activeTab} will appear here.</p>
            </div>
        `;
        window.UI.refreshIcons();
        return;
    }

    // 4. Build the HTML for the list
    let html = '';
    const s = window.UI.sanitize;

    for (let req of listToShow) {
        // Different colors for different statuses
        let statusColor = 'bg-emerald-100 text-emerald-600'; // for open
        if (req.status === 'completed') statusColor = 'bg-blue-100 text-blue-600';
        if (req.status === 'accepted') statusColor = 'bg-amber-100 text-amber-600';

        html += `
            <div class="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 mb-4">
                <div class="flex items-start justify-between mb-4">
                    <div class="flex items-center gap-3">
                        <div class="h-10 w-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">
                            ${s(req.postedByName.charAt(0))}
                        </div>
                        <div>
                            <h4 class="font-bold line-clamp-1">${s(req.title)}</h4>
                            <p class="text-xs text-zinc-500">${s(req.category)} • By ${s(req.postedByName)}</p>
                        </div>
                    </div>
                    <span class="px-3 py-1 rounded-full text-[10px] font-bold uppercase ${statusColor}">
                        ${s(req.status)}
                    </span>
                </div>

                <div class="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
                    <p>From: <b>${s(req.pickupLocation)}</b></p>
                    <p>To: <b>${s(req.dropoffLocation)}</b></p>
                </div>

                <div class="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <div class="text-lg font-bold text-emerald-500">৳${s(String(req.reward))}</div>

                    <div class="flex gap-2">
                        <!-- Show DELETE button if it's my post and still open -->
                        ${activeTab === 'posted' && req.status === 'open' ? `
                            <button onclick="handleDelete('${req.id}')" class="px-4 py-2 rounded-lg bg-red-50 text-red-500 text-xs font-bold">Delete</button>
                        ` : ''}

                        <!-- Show COMPLETE button if I accepted it and it's not done -->
                        ${activeTab === 'accepted' && req.status === 'accepted' ? `
                            <button onclick="handleComplete('${req.id}')" class="px-4 py-2 rounded-lg bg-emerald-500 text-white text-xs font-bold">Mark Done</button>
                        ` : ''}

                        <a href="details.html?id=${req.id}" class="px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-xs font-bold">Details</a>
                    </div>
                </div>
            </div>
        `;
    }
    container.innerHTML = html;

    window.UI.refreshIcons();
}

/**
 * Mark a task as completed
 */
function handleComplete(id) {
    const user = window.Auth.getUser();

    // Update the status in the database
    window.DB.updateRequest(id, { status: 'completed' });

    window.UI.toast('Task completed! Great job.', 'success');
    renderPage(); // Refresh the list
}

/**
 * Delete a request (only if it's open)
 */
function handleDelete(id) {
    if (confirm('Are you sure you want to delete this?')) {
        window.DB.deleteRequest(id);
        window.UI.toast('Request deleted.', 'info');
        renderPage(); // Refresh the list
    }
}

// Start when page loads
document.addEventListener('DOMContentLoaded', initMyRequests);

// Global access for HTML buttons
window.setTab = setTab;
window.handleComplete = handleComplete;
window.handleDelete = handleDelete;
window.MyRequests = {
    setTab,
    handleComplete,
    handleDelete
};
