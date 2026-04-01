/**
 * leaderboard.js - Leaderboard Page
 * This file handles ranking users based on how many deliveries they completed.
 */

// Some fake data to make the leaderboard look full if it's a new app
const MOCK_LEADERS = [
    { id: 'm1', name: 'Sajid Islam', completedCount: 42, earned: 1250, rating: 4.9 },
    { id: 'm2', name: 'Anika Rahman', completedCount: 38, earned: 1100, rating: 4.8 },
    { id: 'm3', name: 'Tanvir Ahmed', completedCount: 35, earned: 950, rating: 4.7 },
    { id: 'm4', name: 'Farhan Kabir', completedCount: 28, earned: 820, rating: 4.9 }
];

/**
 * Initialize the page
 */
function initLeaderboard() {
    window.Auth.requireAuth();
    renderLeaderboard();
}

/**
 * Calculate ranks and draw them on the screen
 */
function renderLeaderboard() {
    const podiumContainer = document.getElementById('podium-container');
    const listContainer = document.getElementById('leaderboard-list');
    if (!podiumContainer || !listContainer) return;

    // 1. Get real data from database
    const allUsers = window.DB.getUsers();
    const allRequests = window.DB.getRequests();

    // 2. Map through users and calculate their stats
    let leaderboardData = allUsers.map(user => {
        // Count completed deliveries for this user
        const completed = allRequests.filter(req => req.acceptedBy === user.id && req.status === 'completed');
        
        // Sum up the rewards
        let totalEarned = 0;
        for (let req of completed) {
            totalEarned += Number(req.reward);
        }

        return {
            id: user.id,
            name: user.name,
            completedCount: completed.length,
            earned: totalEarned,
            rating: 4.9 // Default rating
        };
    });

    // 3. Add mock leaders if the list is too short
    if (leaderboardData.length < 5) {
        leaderboardData = leaderboardData.concat(MOCK_LEADERS);
    }

    // 4. Sort by most completed deliveries first
    leaderboardData.sort((a, b) => b.completedCount - a.completedCount);

    // 5. Draw Top 3 (The Podium)
    const top3 = leaderboardData.slice(0, 3);
    renderPodium(top3, podiumContainer);

    // 6. Draw the rest of the list
    const rest = leaderboardData.slice(3);
    renderList(rest, listContainer);

    // 7. Show the current user's personal rank
    renderUserRank(leaderboardData);

    window.UI.refreshIcons();
}

/**
 * Draw the top 3 visual podium
 */
function renderPodium(top3, container) {
    const s = window.UI.sanitize;
    // We want to show: 2nd, 1st, 3rd (visually looks better)
    const order = [1, 0, 2]; 
    
    let html = '';
    for (let idx of order) {
        const user = top3[idx];
        if (!user) continue;

        const isFirst = (idx === 0);
        const heightClass = isFirst ? 'h-48' : (idx === 1 ? 'h-36' : 'h-28');
        const colorClass = isFirst ? 'bg-emerald-500 text-white' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500';

        html += `
            <div class="flex flex-col items-center flex-1">
                <div class="mb-4 relative">
                    <div class="h-16 w-16 rounded-full ${colorClass} flex items-center justify-center text-xl font-bold">
                        ${s(user.name.charAt(0))}
                    </div>
                    ${isFirst ? '<div class="absolute -top-4 left-1/2 -translate-x-1/2 text-2xl">👑</div>' : ''}
                </div>
                <div class="text-center mb-4">
                    <h3 class="font-bold text-sm truncate max-w-[100px]">${s(user.name)}</h3>
                    <p class="text-[10px] text-zinc-400 font-bold uppercase">${user.completedCount} Deliveries</p>
                </div>
                <div class="${heightClass} w-full rounded-t-3xl ${isFirst ? 'bg-emerald-500' : 'bg-zinc-200 dark:bg-zinc-800'} flex items-end justify-center pb-4">
                    <span class="text-3xl font-black opacity-30">${idx + 1}</span>
                </div>
            </div>
        `;
    }
    container.innerHTML = html;
}

/**
 * Draw the remaining users in a simple list
 */
function renderList(users, container) {
    const s = window.UI.sanitize;
    let html = '';
    
    users.forEach((user, index) => {
        html += `
            <div class="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 mb-2">
                <div class="flex items-center gap-4">
                    <span class="w-6 text-sm font-bold text-zinc-400">#${index + 4}</span>
                    <div class="h-10 w-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-zinc-500">
                        ${s(user.name.charAt(0))}
                    </div>
                    <div>
                        <h4 class="font-bold text-sm">${s(user.name)}</h4>
                        <div class="flex items-center gap-2 text-[10px] text-zinc-400 font-bold uppercase">
                            <span>${user.completedCount} Deliveries</span>
                            <span>•</span>
                            <span>৳${user.earned} Earned</span>
                        </div>
                    </div>
                </div>
                <div class="flex items-center gap-1.5">
                    <i data-lucide="star" class="h-3.5 w-3.5 fill-amber-400 text-amber-400"></i>
                    <span class="text-sm font-bold">${user.rating}</span>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

/**
 * Find the current user in the data and show their rank
 */
function renderUserRank(data) {
    const user = window.Auth.getUser();
    if (!user) return;

    const myRankIndex = data.findIndex(d => d.id === user.id);
    const initialEl = document.getElementById('user-rank-initial');
    const titleEl = document.getElementById('user-rank-title');
    const subtitleEl = document.getElementById('user-rank-subtitle');

    if (myRankIndex !== -1) {
        if (initialEl) initialEl.textContent = user.name.charAt(0);
        if (titleEl) titleEl.textContent = 'You are #' + (myRankIndex + 1);
        if (subtitleEl) subtitleEl.textContent = data[myRankIndex].completedCount + ' deliveries completed';
    } else {
        if (initialEl) initialEl.textContent = user.name.charAt(0);
        if (titleEl) titleEl.textContent = 'Not ranked yet';
        if (subtitleEl) subtitleEl.textContent = 'Complete deliveries to climb the board!';
    }
}

// Start when page loads
document.addEventListener('DOMContentLoaded', initLeaderboard);
