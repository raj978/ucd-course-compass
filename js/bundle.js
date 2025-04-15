// Import all modules into a single bundle file
// This helps maintain the original scripts.js functionality while using the new modular structure

// Load utility functions first since they're used by other modules
document.write('<script src="js/utils/utilities.js"></script>');

// Load core modules
document.write('<script src="js/data/dataLoader.js"></script>');
document.write('<script src="js/filters/courseFilters.js"></script>');
document.write('<script src="js/ui/uiComponents.js"></script>');
document.write('<script src="js/core/navigation.js"></script>');
document.write('<script src="js/core/eventHandlers.js"></script>');

// Load the main application file last
document.write('<script src="js/app.js"></script>');
