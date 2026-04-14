
// Key for the current session
const SESSION_KEY = 'BringIt_session';

/**
 * Get the currently logged in user
 */
function getCurrentUser() {
    const sessionData = localStorage.getItem(SESSION_KEY);
    if (sessionData) {
        return JSON.parse(sessionData);
    }
    return null;
}

/**
 * Log in a user with email and password
 */
function loginUser(email, password) {
    const user = window.DB.findUser(email);

    if (user) {
        if (user.password === password) {
            // Save user to session (localStorage)
            localStorage.setItem(SESSION_KEY, JSON.stringify(user));
            return { success: true, user: user };
        } else {
            return { success: false, message: 'Invalid password. Please try again.' };
        }
    }

    return { success: false, message: 'User not found. Please sign up first.' };
}

/**
 * Register a new user
 */
function signupUser(name, email, studentId, password) {
    // Check if email already exists
    if (window.DB.findUser(email)) {
        return { success: false, message: 'This email is already registered.' };
    }

    // Check if student ID already exists
    if (window.DB.findUserByStudentId(studentId)) {
        return { success: false, message: 'This Student ID is already registered.' };
    }

    // Save new user to "Database"
    const newUser = window.DB.saveUser({
        name: name,
        email: email,
        studentId: studentId,
        password: password
    });

    // Log them in immediately
    localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
    return { success: true, user: newUser };
}

/**
 * Log out the current user
 */
function logoutUser() {
    localStorage.removeItem(SESSION_KEY);
    // Redirect to home page
    window.location.href = 'index.html';
}

/**
 * Safety check: Redirect to login page if user is NOT logged in
 */
function checkAuth() {
    if (!getCurrentUser()) {
        window.location.href = 'login.html';
    }
}

/**
 * Safety check: Redirect to profile completion if student ID is missing
 */
function checkProfileComplete() {
    const user = getCurrentUser();
    if (user && !user.studentId) {
        window.location.href = 'complete-profile.html';
    }
}

// Make these functions available globally
window.Auth = {
    getUser: getCurrentUser,
    login: loginUser,
    signup: signupUser,
    logout: logoutUser,
    requireAuth: checkAuth,
    requireProfile: checkProfileComplete
};
