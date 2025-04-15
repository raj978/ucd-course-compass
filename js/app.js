/**
 * UC Davis Course Catalog Interactive Application
 * Main application file
 * 
 * This script initializes the application and coordinates between modules.
 */

// Global variables
let courseData = {};
let currentTerm = 'winter'; // Default term
let allSubjects = new Set(); // Store unique subjects for dropdown
let currentlyDisplayedCourses = []; // Track currently displayed courses

// Initialize the application when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function () {
    // Load course data for all terms
    DataLoader.loadAllTerms()
        .then(data => {
            courseData = data;

            // Populate subject dropdown with all available subjects
            UI.populateSubjectDropdown(allSubjects);

            // Check URL for term selection
            Navigation.checkUrlForTerm(courseData);

            // If no term was specified in URL, use default
            if (!courseData[currentTerm]) {
                currentTerm = 'winter';
            }

            // Display initial courses
            UI.displayCourses(courseData[currentTerm]);

            // Initialize UI components
            UI.initAlphabeticalNav();
            UI.initBackToTopButton();
        })
        .catch(error => {
            console.error('Error loading course data:', error);
            document.querySelector('.course-list').innerHTML = `
        <div class="error-message">
          <h3>Error Loading Courses</h3>
          <p>There was a problem loading the course data. Please try again later.</p>
        </div>
      `;
        });

    // Setup event listeners
    EventHandlers.setupEventListeners();
});
