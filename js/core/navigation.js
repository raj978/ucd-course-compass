/**
 * Navigation Module
 * 
 * Handles navigation-related functionality like term switching and URL hash handling.
 */
const Navigation = {
    /**
     * Check URL hash for term selection
     * @param {Object} courseData - Object containing course data for all terms
     */
    checkUrlForTerm: function (courseData) {
        const hash = window.location.hash;
        if (hash && hash.startsWith('#term-')) {
            const term = hash.replace('#term-', '');
            if (courseData && courseData[term]) {
                // Set the term
                currentTerm = term;

                // Update UI to show the correct term as active
                const termBtns = document.querySelectorAll('.term-btn');
                termBtns.forEach(btn => {
                    btn.classList.remove('active');
                    if (btn.getAttribute('data-term') === term) {
                        btn.classList.add('active');
                    }
                });

                // Display courses for this term
                UI.displayCourses(courseData[term]);
            }
        }
    },

    /**
     * Switch to a different term
     * @param {string} term - The term to switch to (e.g., "fall", "winter", "spring")
     * @param {Object} courseData - Object containing course data for all terms
     */
    switchTerm: function (term, courseData) {
        if (term === currentTerm) return;

        // Update active button
        const termBtns = document.querySelectorAll('.term-btn');
        termBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-term') === term) {
                btn.classList.add('active');
            }
        });

        // Update current term and display courses
        currentTerm = term;
        UI.displayCourses(courseData[term]);

        // Update URL hash to remember selected term
        window.location.hash = `term-${term}`;
    }
};
