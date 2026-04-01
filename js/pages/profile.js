/**
 * profile.js - Profile Page
 * This file handles showing the user's stats and letting them change their name.
 */

/**
 * Initialize the page
 */
function initProfilePage() {
    window.Auth.requireAuth();
    showUserProfile();
}

/**
 * Calculate user's statistics and show them on the page
 */
function showUserProfile() {
    const user = window.Auth.getUser();
    const allRequests = window.DB.getRequests();

    // 1. Calculate Stats
    // Count deliveries this user COMPLETED as a courier
    const completedTasks = allRequests.filter(req => req.acceptedBy === user.id && req.status === 'completed');

    // Sum up the earned money
    let totalEarned = 0;
    for (let req of completedTasks) {
        totalEarned += Number(req.reward);
    }

    // Count ACTIVE posts (requests the user posted that are still open)
    const activePosts = allRequests.filter(req => req.postedBy === user.id && req.status === 'open');

    // 2. Put stats on the screen
    document.getElementById('stat-completed').textContent = completedTasks.length;
    document.getElementById('stat-earned').textContent = '৳' + totalEarned;
    document.getElementById('stat-active').textContent = activePosts.length;
    document.getElementById('stat-rating').textContent = '4.9'; // Mock rating

    // 3. Put user info on the screen
    document.getElementById('profile-name-display').textContent = user.name;
    document.getElementById('profile-email-display').textContent = user.email;
    document.getElementById('profile-initial').textContent = user.name.charAt(0);

    // 4. Fill the form fields so user can edit them
    document.getElementById('name').value = user.name;
    document.getElementById('email').value = user.email;
    document.getElementById('studentId').value = user.studentId || '';
}

/**
 * Save the changes when the user clicks "Save Changes"
 */
function saveProfileChanges() {
    const newName = document.getElementById('name').value;
    const newStudentId = document.getElementById('studentId').value;

    if (!newName || !newStudentId) {
        window.UI.toast('Please fill in your name and Student ID', 'error');
        return;
    }

    window.UI.showLoading('save-btn', 'Saving...');

    const currentUser = window.Auth.getUser();

    // Check if the new Student ID is already taken by someone else
    const otherUser = window.DB.findUserByStudentId(newStudentId);
    if (otherUser && otherUser.id !== currentUser.id) {
        window.UI.hideLoading('save-btn');
        window.UI.toast('This Student ID is already used by another account', 'error');
        return;
    }

    // Update the user object
    const updatedUser = Object.assign({}, currentUser, {
        name: newName,
        studentId: newStudentId
    });

    // 1. Update the session (who is currently logged in)
    localStorage.setItem('cuetconnect_session', JSON.stringify(updatedUser));

    // 2. Update the user in the "users" list (the mock database)
    const allUsers = window.DB.getUsers();
    const userIndex = allUsers.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        allUsers[userIndex] = updatedUser;
        localStorage.setItem('cuetconnect_users', JSON.stringify(allUsers));
    }

    // 3. Sync the new name across all their requests
    window.DB.syncUserNames(currentUser.id, newName);

    // 4. Success message and refresh
    setTimeout(() => {
        window.UI.hideLoading('save-btn');
        window.UI.toast('Profile updated successfully!');

        // Refresh the page data
        showUserProfile();

        // Refresh the navbar (to show the new name)
        window.Navbar.render();
    }, 800);
}

// Start when page loads
document.addEventListener('DOMContentLoaded', initProfilePage);

// Global access for HTML button
window.saveProfileChanges = saveProfileChanges;
window.Profile = {
    saveChanges: saveProfileChanges
};
