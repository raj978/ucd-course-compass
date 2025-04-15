/**
 * UI Components and Display
 * 
 * Handles rendering and UI updates for the application.
 */
const UI = {
    /**
     * Populate subject dropdown with available subjects
     * @param {Set} subjects - Set of subject codes
     */
    populateSubjectDropdown: function (subjects) {
        const subjectSelect = document.getElementById('subject');
        if (!subjectSelect) return;

        // Clear existing options except the first one
        while (subjectSelect.options.length > 1) {
            subjectSelect.remove(1);
        }

        // Add subjects in alphabetical order
        Array.from(subjects)
            .sort()
            .forEach(subject => {
                const option = document.createElement('option');
                option.value = subject;
                option.textContent = `${subject} (${Utils.getDepartmentName(subject)})`;
                subjectSelect.appendChild(option);
            });
    },

    /**
     * Display courses in the UI
     * @param {Array} courses - Array of course objects to display
     */
    displayCourses: function (courses) {
        currentlyDisplayedCourses = courses;

        const courseListElement = document.querySelector('.course-list');
        courseListElement.innerHTML = '';

        // If no courses to display
        if (!courses || courses.length === 0) {
            courseListElement.innerHTML = `
        <div class="no-results">
          <h3>No Courses Found</h3>
          <p>Try adjusting your search criteria.</p>
        </div>
      `;
            return;
        }

        // Group courses by first letter of subject code
        const coursesByLetter = this.groupCoursesByLetter(courses);

        // Create sections for each letter
        for (const [letter, letterCourses] of Object.entries(coursesByLetter)) {
            const letterSection = this.createLetterSection(letter, letterCourses);
            courseListElement.appendChild(letterSection);
        }

        // Add click event listeners to expand/collapse buttons
        this.addExpandCollapseListeners();
    },

    /**
     * Group courses by the first letter of their subject code
     * @param {Array} courses - Array of course objects
     * @returns {Object} Object with letters as keys and arrays of courses as values
     */
    groupCoursesByLetter: function (courses) {
        const groupedCourses = {};

        courses.forEach(course => {
            const firstLetter = course.code.charAt(0);

            if (!groupedCourses[firstLetter]) {
                groupedCourses[firstLetter] = [];
            }

            groupedCourses[firstLetter].push(course);
        });

        return groupedCourses;
    },

    /**
     * Create a section for courses starting with a specific letter
     * @param {string} letter - The letter
     * @param {Array} courses - Array of courses starting with that letter
     * @returns {HTMLElement} The letter section element
     */
    createLetterSection: function (letter, courses) {
        // Group courses by department
        const coursesByDepartment = {};

        courses.forEach(course => {
            if (!coursesByDepartment[course.department]) {
                coursesByDepartment[course.department] = [];
            }

            coursesByDepartment[course.department].push(course);
        });

        // Create letter section element
        const letterSection = document.createElement('div');
        letterSection.id = `section-${letter}`;
        letterSection.className = 'letter-section';

        // Add letter heading
        const letterHeading = document.createElement('h2');
        letterHeading.className = 'letter-heading';
        letterHeading.textContent = letter;
        letterSection.appendChild(letterHeading);

        // Create department sections
        for (const [department, departmentCourses] of Object.entries(coursesByDepartment)) {
            const departmentSection = this.createDepartmentSection(department, departmentCourses);
            letterSection.appendChild(departmentSection);
        }

        return letterSection;
    },

    /**
     * Create a section for courses in a specific department
     * @param {string} department - The department name
     * @param {Array} courses - Array of courses in that department
     * @returns {HTMLElement} The department section element
     */
    createDepartmentSection: function (department, courses) {
        // Create department section element
        const departmentSection = document.createElement('div');
        departmentSection.className = 'department-section';

        // Add department heading
        const departmentHeading = document.createElement('h3');
        departmentHeading.className = 'department-heading';
        departmentHeading.textContent = department;
        departmentSection.appendChild(departmentHeading);

        // Add course cards
        courses.forEach(course => {
            const courseCard = this.createCourseCard(course);
            departmentSection.appendChild(courseCard);
        });

        return departmentSection;
    },

    /**
     * Create a card for a specific course
     * @param {Object} course - The course object
     * @returns {HTMLElement} The course card element
     */
    createCourseCard: function (course) {
        // Generate a unique ID for this course
        const courseId = `${course.code}${course.number}`.replace(/\\s+/g, '');
        const detailsId = `${courseId}-details`;

        // Determine GE/core literacy codes for display
        const geCodesDisplay = course.geCodes ? course.geCodes : '';

        // Create course card element
        const courseCard = document.createElement('div');
        courseCard.className = 'course-card';

        // Create course header
        courseCard.innerHTML = `
      <div class="course-header">
        <div class="course-title-container">
          <h4 class="course-code">${course.code} ${course.number}</h4>
          <span class="course-title-separator">-</span>
          <h4 class="course-title">${course.title}</h4>
        </div>
        <div class="course-meta">
          <span>${course.units} Units${geCodesDisplay ? ' | ' + geCodesDisplay : ''}</span>
        </div>
        <button class="expand-btn" data-target="${detailsId}">
          <span class="expand-icon">+</span>
        </button>
      </div>

      <div id="${detailsId}" class="course-details">
        <div class="course-description">
          <h5>Description</h5>
          <p>${course.description}</p>
        </div>

        <div class="course-prerequisites">
          <h5>Prerequisites</h5>
          <p>${course.prerequisites}</p>
        </div>

        <div class="course-sections">
          <h5>Sections</h5>
          ${this.createSectionsHTML(course.sections)}
        </div>
      </div>
    `;

        return courseCard;
    },

    /**
     * Create HTML for course sections
     * @param {Array} sections - Array of section objects
     * @returns {string} HTML string for the sections
     */
    createSectionsHTML: function (sections) {
        if (!sections || sections.length === 0) {
            return `<p>No sections available for this term.</p>`;
        }

        return sections.map(section => {
            const enrollmentInfo = this.getEnrollmentInfo(section);
            const statusClass = this.getStatusClass(section);

            return `
        <div class="section-card">
          <div class="section-header">
            <div>
              <div class="section-title">${section.type} - CRN: ${section.crn}</div>
              <div class="section-instructor">Instructor: ${section.instructor}</div>
            </div>
            <span class="status-badge ${statusClass}">${section.status || 'Unknown'}</span>
          </div>

          <div class="section-details">
            <div class="section-detail">
              <span class="detail-icon">📅</span>
              <span>${section.days}</span>
            </div>
            <div class="section-detail">
              <span class="detail-icon">🕒</span>
              <span>${section.startTime} - ${section.endTime}</span>
            </div>
            <div class="section-detail">
              <span class="detail-icon">📍</span>
              <span>${section.building} ${section.room}</span>
            </div>
            <div class="section-detail">
              <span class="detail-icon">👥</span>
              <span>${enrollmentInfo}</span>
            </div>
          </div>
        </div>
      `;
        }).join('');
    },

    /**
     * Get formatted enrollment information for a section
     * @param {Object} section - The section object
     * @returns {string} Formatted enrollment information
     */
    getEnrollmentInfo: function (section) {
        const current = section.enrollment.current;
        const max = section.enrollment.max;
        const waitlist = section.enrollment.waitlist;

        let enrollmentText = `${current}/${max}`;

        if (waitlist > 0) {
            enrollmentText += ` (Waitlist: ${waitlist})`;
        }

        return enrollmentText;
    },

    /**
     * Get status class for a section based on enrollment
     * @param {Object} section - The section object
     * @returns {string} CSS class for the status badge
     */
    getStatusClass: function (section) {
        const current = section.enrollment.current;
        const max = section.enrollment.max;

        return current < max ? 'status-open' : 'status-closed';
    },

    /**
     * Add event listeners to expand/collapse buttons
     */
    addExpandCollapseListeners: function () {
        const expandBtns = document.querySelectorAll('.expand-btn');

        expandBtns.forEach(btn => {
            // Remove any existing event listeners to prevent duplicates
            btn.removeEventListener('click', this.handleExpandClick);
            // Add click event listener
            btn.addEventListener('click', this.handleExpandClick);
        });
    },

    /**
     * Handle click on expand/collapse button
     * @param {Event} event - The click event
     */
    handleExpandClick: function () {
        const targetId = this.getAttribute('data-target');
        const targetElement = document.getElementById(targetId);

        // Check if the element is expanded by checking computed style
        const isExpanded = window.getComputedStyle(targetElement).display !== 'none';

        // Toggle the display
        targetElement.style.display = isExpanded ? 'none' : 'block';

        // Update the icon
        this.querySelector('.expand-icon').textContent = isExpanded ? '+' : '-';
    },

    /**
     * Initialize alphabetical navigation
     */
    initAlphabeticalNav: function () {
        const alphaNavItems = document.querySelectorAll('.alpha-nav-item');

        // Function to update active letter based on scroll position
        function updateActiveLetterOnScroll() {
            if (!currentlyDisplayedCourses.length) return;

            // Get all letter sections currently in the DOM
            const letterSections = document.querySelectorAll('.letter-section');
            if (!letterSections.length) return;

            // Find which section is most visible in the viewport
            let mostVisibleSection = null;
            let maxVisibleHeight = 0;

            letterSections.forEach(section => {
                const rect = section.getBoundingClientRect();

                // Calculate how much of the section is visible in the viewport
                const visibleTop = Math.max(0, rect.top);
                const visibleBottom = Math.min(window.innerHeight, rect.bottom);
                const visibleHeight = Math.max(0, visibleBottom - visibleTop);

                if (visibleHeight > maxVisibleHeight) {
                    maxVisibleHeight = visibleHeight;
                    mostVisibleSection = section;
                }
            });

            if (mostVisibleSection) {
                // Extract the letter from the section id (format: "section-X")
                const activeLetter = mostVisibleSection.id.split('-')[1];

                // Update active class in the alphabet navigation
                alphaNavItems.forEach(item => {
                    const itemLetter = item.getAttribute('href').replace('#section-', '');
                    if (itemLetter === activeLetter) {
                        item.classList.add('active');
                    } else {
                        item.classList.remove('active');
                    }
                });
            }
        }

        // Add click event listener to alphabet items
        alphaNavItems.forEach(item => {
            item.addEventListener('click', function (e) {
                e.preventDefault();

                // Remove active class from all items
                alphaNavItems.forEach(navItem => {
                    navItem.classList.remove('active');
                });

                // Add active class to clicked item
                this.classList.add('active');

                // Scroll to the section
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);

                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });

        // Set initial active letter
        setTimeout(updateActiveLetterOnScroll, 100);

        // Add scroll event listener to update active letter while scrolling
        window.addEventListener('scroll', Utils.debounce(updateActiveLetterOnScroll, 100));

        // Make the first letter with content active initially
        if (currentlyDisplayedCourses.length > 0) {
            const firstLetter = currentlyDisplayedCourses[0].code.charAt(0);
            const firstLetterNavItem = document.querySelector(`.alpha-nav-item[href="#section-${firstLetter}"]`);
            if (firstLetterNavItem) {
                alphaNavItems.forEach(item => item.classList.remove('active'));
                firstLetterNavItem.classList.add('active');
            }
        }
    },

    /**
     * Initialize back to top button
     */
    initBackToTopButton: function () {
        const backToTopButton = document.querySelector('.back-to-top');
        const searchPanel = document.querySelector('.search-panel');

        if (!backToTopButton || !searchPanel) return;

        // Show button when user scrolls below the search panel
        window.addEventListener('scroll', function () {
            const searchPanelBottom = searchPanel.getBoundingClientRect().bottom;

            // Show button when search panel is scrolled out of view
            if (searchPanelBottom < 0) {
                backToTopButton.classList.add('visible');
            } else {
                backToTopButton.classList.remove('visible');
            }
        });

        // Scroll to search panel when button is clicked
        backToTopButton.addEventListener('click', function () {
            searchPanel.scrollIntoView({ behavior: 'smooth' });
        });
    }
};
