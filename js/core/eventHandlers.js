/**
 * Event Handlers Module
 * 
 * Sets up and manages event listeners for user interactions.
 */
const EventHandlers = {
    /**
     * Set up all event listeners for the application
     */
    setupEventListeners: function () {
        this.setupTermSwitcher();
        this.setupAdvancedOptions();
        this.setupClearButton();
        this.setupSearchForm();
    },

    /**
     * Set up term switcher buttons
     */
    setupTermSwitcher: function () {
        const termBtns = document.querySelectorAll('.term-btn');

        termBtns.forEach(btn => {
            btn.addEventListener('click', function () {
                const term = this.getAttribute('data-term');
                Navigation.switchTerm(term, courseData);
            });
        });
    },

    /**
     * Set up advanced options toggle
     */
    setupAdvancedOptions: function () {
        const toggleAdvancedBtn = document.getElementById('toggle-advanced');
        const advancedOptions = document.getElementById('advanced-options');

        if (!toggleAdvancedBtn || !advancedOptions) return;

        // Set initial state
        const isHidden = advancedOptions.style.display === 'none' || advancedOptions.style.display === '';
        toggleAdvancedBtn.textContent = isHidden ? 'Show Advanced Options' : 'Hide Advanced Options';

        toggleAdvancedBtn.addEventListener('click', function () {
            const isHidden = advancedOptions.style.display === 'none' || advancedOptions.style.display === '';
            advancedOptions.style.display = isHidden ? 'block' : 'none';
            toggleAdvancedBtn.textContent = isHidden ? 'Hide Advanced Options' : 'Show Advanced Options';

            // Animate the transition
            if (isHidden) {
                advancedOptions.style.maxHeight = '0';
                setTimeout(() => {
                    advancedOptions.style.maxHeight = advancedOptions.scrollHeight + 'px';
                }, 10);
            } else {
                advancedOptions.style.maxHeight = advancedOptions.scrollHeight + 'px';
                setTimeout(() => {
                    advancedOptions.style.maxHeight = '0';
                }, 10);
            }
        });
    },

    /**
     * Set up clear button
     */
    setupClearButton: function () {
        const clearBtn = document.getElementById('clear-btn');
        const form = document.getElementById('course-search-form');

        if (!clearBtn || !form) return;

        clearBtn.addEventListener('click', function () {
            form.reset();
            // After clearing, show all courses for current term
            UI.displayCourses(courseData[currentTerm]);
        });
    },

    /**
     * Set up search form submission
     */
    setupSearchForm: function () {
        const form = document.getElementById('course-search-form');

        if (!form) return;

        form.addEventListener('submit', function (e) {
            e.preventDefault();

            const formData = new FormData(form);
            const searchParams = {};

            for (const [key, value] of formData.entries()) {
                if (value === '' || value === null) continue; // Skip empty values

                if (searchParams[key]) {
                    if (!Array.isArray(searchParams[key])) {
                        searchParams[key] = [searchParams[key]];
                    }
                    searchParams[key].push(value);
                } else {
                    searchParams[key] = value;
                }
            }

            console.log('Search parameters:', searchParams);

            // Filter courses based on search criteria
            const filteredCourses = Filters.filterCourses(courseData[currentTerm], searchParams);
            UI.displayCourses(filteredCourses);
        });
    }
};
