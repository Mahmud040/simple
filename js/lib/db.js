/**
 * db.js - Simple Database using localStorage
 * This file handles all the data for our application (Users and Requests).
 * It uses 'localStorage' which means the data stays in your browser even if you refresh.
 */

// Keys used to store data in localStorage
const USERS_KEY = 'cuetconnect_users';
const REQUESTS_KEY = 'cuetconnect_requests';
const BOOKMARKS_KEY = 'cuetconnect_bookmarks';

// Initial "Seed" Data - These will show up the first time you open the app
const INITIAL_DATA = [
    {
        id: 'req_1',
        title: 'Lunch from Central Cafeteria',
        description: 'Need someone to pick up a Chicken Biryani and a Coke. I am at the Library, 2nd floor.',
        category: 'Food',
        reward: 40,
        status: 'open',
        postedBy: 'user_2',
        postedByName: 'Anika Rahman',
        postedAt: new Date(Date.now() - 3600000).toISOString(),
        pickupLocation: 'Central Cafeteria',
        dropoffLocation: 'Central Library'
    },
    {
        id: 'req_2',
        title: 'Lab Report Printing',
        description: 'Need 12 pages of CSE-201 lab report printed and delivered to West Hall Room 402.',
        category: 'Documents',
        reward: 30,
        status: 'open',
        postedBy: 'user_3',
        postedByName: 'Tanvir Ahmed',
        postedAt: new Date(Date.now() - 7200000).toISOString(),
        pickupLocation: 'Press Complex',
        dropoffLocation: 'West Hall'
    },
    {
        id: 'req_3',
        title: 'Medicine from Gate 1',
        description: 'Urgent: Need Napa Extend and some saline. Please deliver to North Hall.',
        category: 'Pharmacy',
        reward: 50,
        status: 'open',
        postedBy: 'user_4',
        postedByName: 'Sajid Islam',
        postedAt: new Date(Date.now() - 10800000).toISOString(),
        pickupLocation: 'Gate 1 Pharmacy',
        dropoffLocation: 'North Hall'
    }
];

/**
 * Initialize the database. 
 * If no data exists, it sets up empty arrays or initial data.
 */
function initDatabase() {
    if (!localStorage.getItem(REQUESTS_KEY)) {
        localStorage.setItem(REQUESTS_KEY, JSON.stringify(INITIAL_DATA));
    }
    if (!localStorage.getItem(USERS_KEY)) {
        localStorage.setItem(USERS_KEY, JSON.stringify([]));
    }
    if (!localStorage.getItem(BOOKMARKS_KEY)) {
        localStorage.setItem(BOOKMARKS_KEY, JSON.stringify([]));
    }
}

/**
 * Get all delivery requests from storage
 */
function getAllRequests() {
    const data = localStorage.getItem(REQUESTS_KEY);
    return data ? JSON.parse(data) : [];
}

/**
 * Generate a unique ID (e.g., req_123456789)
 */
function generateId(prefix) {
    return prefix + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Save a new delivery request
 */
function saveNewRequest(requestData) {
    const requests = getAllRequests();

    // Create the full request object
    const newRequest = {
        id: generateId('req'),
        title: requestData.title,
        description: requestData.description,
        category: requestData.category,
        reward: requestData.reward,
        pickupLocation: requestData.pickupLocation,
        dropoffLocation: requestData.dropoffLocation,
        postedBy: requestData.postedBy,
        postedByName: requestData.postedByName,
        postedAt: new Date().toISOString(),
        status: 'open'
    };

    // Add to the beginning of the list
    requests.unshift(newRequest);
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
    return newRequest;
}

/**
 * Update a request (e.g., mark as accepted or completed)
 */
function updateRequestStatus(requestId, updates) {
    const requests = getAllRequests();
    const index = requests.findIndex(r => r.id === requestId);

    if (index !== -1) {
        // Merge the updates into the existing request
        requests[index] = Object.assign(requests[index], updates);
        localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
        return requests[index];
    }
    return null;
}

/**
 * Accept a request (Atomic operation to avoid double-acceptance)
 */
function acceptRequest(requestId, userId, userName) {
    const requests = getAllRequests();
    const index = requests.findIndex(r => r.id === requestId);

    if (index === -1) return { success: false, message: 'Request not found' };

    const request = requests[index];

    if (request.postedBy === userId) {
        return { success: false, message: 'You cannot accept your own request!' };
    }

    if (request.status !== 'open') {
        return { success: false, message: 'This request is no longer available.' };
    }

    // Update the request
    requests[index].status = 'accepted';
    requests[index].acceptedBy = userId;
    requests[index].acceptedByName = userName;
    requests[index].acceptedAt = new Date().toISOString();

    localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
    return { success: true, message: 'Request accepted!', request: requests[index] };
}

/**
 * Delete a request
 */
function deleteRequest(requestId) {
    const requests = getAllRequests();
    const filteredRequests = requests.filter(r => r.id !== requestId);
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(filteredRequests));
}

/**
 * Sync names across all requests if a user changes their name
 */
function syncUserNames(userId, newName) {
    const requests = getAllRequests();
    let updated = false;

    for (let req of requests) {
        if (req.postedBy === userId) {
            req.postedByName = newName;
            updated = true;
        }
        if (req.acceptedBy === userId) {
            req.acceptedByName = newName;
            updated = true;
        }
    }

    if (updated) {
        localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
    }
}

/**
 * User Management Functions
 */
function getAllUsers() {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
}

function findUserByEmail(email) {
    return getAllUsers().find(u => u.email === email);
}

function findUserByStudentId(studentId) {
    return getAllUsers().find(u => u.studentId === studentId);
}

function saveUser(userData) {
    const users = getAllUsers();
    const newUser = Object.assign({}, userData, { id: generateId('user') });
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return newUser;
}

/**
 * Bookmark Management Functions
 */
function getBookmarksForUser(userId) {
    const allBookmarks = JSON.parse(localStorage.getItem(BOOKMARKS_KEY)) || [];
    const userBookmarks = allBookmarks.filter(b => b.userId === userId);
    return userBookmarks.map(b => b.requestId);
}

function toggleBookmark(userId, requestId) {
    let allBookmarks = JSON.parse(localStorage.getItem(BOOKMARKS_KEY)) || [];
    const index = allBookmarks.findIndex(b => b.userId === userId && b.requestId === requestId);

    if (index === -1) {
        allBookmarks.push({ userId, requestId });
        localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(allBookmarks));
        return true; // Added
    } else {
        allBookmarks.splice(index, 1);
        localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(allBookmarks));
        return false; // Removed
    }
}

// Automatically start the database when the script loads
initDatabase();

// Make these functions available globally for other scripts
window.DB = {
    getRequests: getAllRequests,
    getUsers: getAllUsers,
    saveRequest: saveNewRequest,
    updateRequest: updateRequestStatus,
    atomicAcceptRequest: acceptRequest,
    deleteRequest,
    syncUserNames,
    findUser: findUserByEmail,
    findUserByStudentId,
    saveUser,
    getBookmarks: getBookmarksForUser,
    toggleBookmark
};
