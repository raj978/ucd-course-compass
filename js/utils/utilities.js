/**
 * Utility Functions
 * 
 * Collection of helper functions used across the application.
 */
const Utils = {
    /**
     * Format time from 24-hour format to AM/PM
     * @param {string} time - Time in 24-hour format
     * @returns {string} Time in AM/PM format
     */
    formatTime: function (time) {
        if (!time || time.length < 3) return 'TBA';

        let hours = parseInt(time.substring(0, time.length - 2));
        const minutes = time.substring(time.length - 2);
        const period = hours >= 12 ? 'PM' : 'AM';

        hours = hours % 12;
        hours = hours ? hours : 12; // Convert 0 to 12

        return `${hours}:${minutes} ${period}`;
    },

    /**
     * Format time for comparison
     * @param {string} time - Time string like "8:00" or "13:00"
     * @returns {string} Formatted time string like "8:00 AM" or "1:00 PM"
     */
    formatTimeForComparison: function (time) {
        // Converts times like "8:00" to "8:00 AM" or "13:00" to "1:00 PM"
        const hours = parseInt(time.split(':')[0]);
        const minutes = time.split(':')[1];

        if (hours < 12) {
            return `${hours}:${minutes} AM`;
        } else if (hours === 12) {
            return `12:${minutes} PM`;
        } else {
            return `${hours - 12}:${minutes} PM`;
        }
    },

    /**
     * Convert a time string to minutes for easier comparison
     * @param {string} timeStr - Time string like "8:00 AM"
     * @returns {number} Minutes since midnight
     */
    timeToMinutes: function (timeStr) {
        if (timeStr === 'TBA') return -1; // Handle TBA times

        const [time, period] = timeStr.split(' ');
        const [hours, minutes] = time.split(':').map(num => parseInt(num));

        let totalMinutes = hours * 60 + minutes;

        // Adjust for PM times (except 12 PM)
        if (period === 'PM' && hours !== 12) {
            totalMinutes += 12 * 60;
        }

        // Adjust for 12 AM
        if (period === 'AM' && hours === 12) {
            totalMinutes -= 12 * 60;
        }

        return totalMinutes;
    },

    /**
     * Simple debounce function to limit function calls
     * @param {Function} func - Function to debounce
     * @param {number} wait - Milliseconds to wait
     * @returns {Function} Debounced function
     */
    debounce: function (func, wait) {
        let timeout;
        return function () {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    },

    /**
     * Get department name for a subject code
     * @param {string} subjectCode - The subject code (e.g., "CSE")
     * @returns {string} The department name
     */
    getDepartmentName: function (subjectCode) {
        // This would be better with actual data, but we'll use a mapping for now
        const departmentMap = {
            'BIS': 'Biological Sciences',
            'CSE': 'Computer Science & Engineering',
            'MAT': 'Mathematics',
            'PHY': 'Physics',
            'CHE': 'Chemical Engineering',
            'EAE': 'Engineering Aerospace',
            'ECN': 'Economics',
            'PSC': 'Political Science',
            'ANT': 'Anthropology',
            'PSY': 'Psychology',
            'SOC': 'Sociology',
            'MUS': 'Music',
            'ART': 'Art',
            'ENG': 'English',
            'HIS': 'History',
            'CHN': 'Chinese',
            'FRE': 'French',
            'SPA': 'Spanish',
            'JPN': 'Japanese',
            'GER': 'German'
        };

        return departmentMap[subjectCode] || subjectCode;
    }
};
