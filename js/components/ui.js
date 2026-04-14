
const UI = {
    /**
     * Prevent XSS by escaping special characters in a string
     */
    sanitize(text) {
        const temp = document.createElement('div');
        temp.textContent = text;
        return temp.innerHTML;
    },

    /**
     * Show a pretty date (e.g., "5m ago" or "Just now")
     */
    formatTime(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);

        if (seconds < 60) return 'Just now';

        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return minutes + 'm ago';

        const hours = Math.floor(minutes / 60);
        if (hours < 24) return hours + 'h ago';

        return date.toLocaleDateString();
    },

    /**
     * Tell Lucide to find all icons on the page and draw them
     */
    refreshIcons() {
        if (window.lucide) {
            window.lucide.createIcons();
        }
    },

    /**
     * Show a notification at the bottom of the screen
     */
    toast(message, type = 'success') {
        // Find or create the container for toasts
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.style.position = 'fixed';
            container.style.bottom = '20px';
            container.style.right = '20px';
            container.style.zIndex = '9999';
            container.style.display = 'flex';
            container.style.flexDirection = 'column';
            container.style.gap = '10px';
            document.body.appendChild(container);
        }

        // Create the toast element
        const toast = document.createElement('div');

        // Pick a color based on the type
        let bgColor = '#10b981'; // green for success
        if (type === 'error') bgColor = '#ef4444'; // red
        if (type === 'info') bgColor = '#3f3f46'; // dark grey

        toast.style.backgroundColor = bgColor;
        toast.style.color = 'white';
        toast.style.padding = '12px 24px';
        toast.style.borderRadius = '12px';
        toast.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
        toast.style.fontSize = '14px';
        toast.style.fontWeight = '500';
        toast.style.display = 'flex';
        toast.style.alignItems = 'center';
        toast.style.gap = '8px';
        toast.style.transition = 'opacity 0.5s ease';

        // Add message text
        toast.textContent = message;

        // Add to screen
        container.appendChild(toast);

        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    },

    /**
     * Add a loading spinner to a button
     */
    showLoading(buttonId, loadingText = 'Wait...') {
        const btn = document.getElementById(buttonId);
        if (!btn) return;

        // Save the old content so we can put it back later
        btn.oldContent = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<span>' + loadingText + '</span>';
    },

    /**
     * Remove the loading spinner from a button
     */
    hideLoading(buttonId) {
        const btn = document.getElementById(buttonId);
        if (!btn || !btn.oldContent) return;

        btn.disabled = false;
        btn.innerHTML = btn.oldContent;
    },

    /**
     * Setup the initial theme (Dark or Light)
     */
    initTheme() {
        const savedTheme = localStorage.getItem('BringIt_theme');
        if (savedTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    },

    /**
     * Switch between Dark and Light mode
     */
    toggleTheme() {
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('BringIt_theme', isDark ? 'dark' : 'light');
        this.toast((isDark ? 'Dark' : 'Light') + ' mode enabled', 'info');
    }
};

// Start the theme when this script loads
UI.initTheme();

// Make it global
window.UI = UI;

