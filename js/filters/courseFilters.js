/**
 * Course Filtering Module
 * 
 * Handles filtering courses based on search criteria.
 */
const Filters = {
    /**
     * Filter courses based on search criteria
     * @param {Array} courses - Array of course objects to filter
     * @param {Object} criteria - Object containing filter criteria
     * @returns {Array} Filtered array of course objects
     */
    filterCourses: function (courses, criteria) {
        return courses.filter(course => {
            // Keyword search (checks code, number, title, and description)
            if (criteria.keyword && !this.matchesKeyword(course, criteria.keyword)) {
                return false;
            }

            // Subject filter
            if (criteria.subject && course.code !== criteria.subject) {
                return false;
            }

            // Course level filter
            if (criteria.courseLevel && !this.matchesCourseLevel(course, criteria.courseLevel)) {
                return false;
            }

            // Units filter
            if (criteria.units && course.units != criteria.units) {
                return false;
            }

            // Meeting days filter
            if (criteria.meetingDays && !this.matchesMeetingDays(course, criteria.meetingDays)) {
                return false;
            }

            // Time range filter
            if ((criteria.startTime || criteria.endTime) &&
                !this.matchesTimeRange(course, criteria.startTime, criteria.endTime)) {
                return false;
            }

            // Meeting type filter
            if (criteria.meetingType && !this.matchesMeetingType(course, criteria.meetingType)) {
                return false;
            }

            // Enrollment status filter
            if (criteria.includeType && !this.matchesEnrollmentStatus(course, criteria.includeType)) {
                return false;
            }

            // GE options filter
            if (criteria.geOptions && !this.matchesGEOptions(course, criteria.geOptions)) {
                return false;
            }

            // Core literacies filter
            if (criteria.coreLiteracies && !this.matchesCoreLiteracies(course, criteria.coreLiteracies)) {
                return false;
            }

            return true;
        });
    },

    /**
     * Check if a course matches a keyword
     * @param {Object} course - Course object to check
     * @param {string} keyword - Keyword to match
     * @returns {boolean} True if course matches keyword
     */
    matchesKeyword: function (course, keyword) {
        keyword = keyword.toLowerCase();

        return (
            course.code.toLowerCase().includes(keyword) ||
            course.number.toLowerCase().includes(keyword) ||
            course.title.toLowerCase().includes(keyword) ||
            course.description.toLowerCase().includes(keyword) ||
            // Check if keyword matches a CRN
            course.sections.some(section => section.crn === keyword)
        );
    },

    /**
     * Check if a course matches a course level
     * @param {Object} course - Course object to check
     * @param {string} level - Course level ("lower", "upper", or "graduate")
     * @returns {boolean} True if course matches level
     */
    matchesCourseLevel: function (course, level) {
        const courseNum = parseInt(course.number);

        switch (level) {
            case 'lower':
                return courseNum >= 1 && courseNum <= 99;
            case 'upper':
                return courseNum >= 100 && courseNum <= 199;
            case 'graduate':
                return courseNum >= 200;
            default:
                return true;
        }
    },

    /**
     * Check if a course has sections on specific days
     * @param {Object} course - Course object to check
     * @param {string|Array} meetingDays - Meeting days to match
     * @returns {boolean} True if course has sections on specified days
     */
    matchesMeetingDays: function (course, meetingDays) {
        // If meetingDays is a string, convert to array
        if (!Array.isArray(meetingDays)) {
            meetingDays = [meetingDays];
        }

        return course.sections.some(section => {
            return meetingDays.some(day => {
                const dayMap = {
                    'mon': 'M',
                    'tues': 'T',
                    'wed': 'W',
                    'thurs': 'R',
                    'fri': 'F',
                    'sat': 'S'
                };

                return section.days.includes(dayMap[day]);
            });
        });
    },

    /**
     * Check if a course has sections within a time range
     * @param {Object} course - Course object to check
     * @param {string} startTime - Start time filter
     * @param {string} endTime - End time filter
     * @returns {boolean} True if course has sections within time range
     */
    matchesTimeRange: function (course, startTime, endTime) {
        // If no time constraints provided, all courses match
        if (!startTime && !endTime) return true;

        return course.sections.some(section => {
            // Convert times to comparable format (minutes since midnight)
            const sectionStartTime = Utils.timeToMinutes(section.startTime);
            const sectionEndTime = Utils.timeToMinutes(section.endTime);

            const filterStartTime = startTime ? Utils.timeToMinutes(Utils.formatTimeForComparison(startTime)) : 0;
            const filterEndTime = endTime ? Utils.timeToMinutes(Utils.formatTimeForComparison(endTime)) : 24 * 60;

            // Check if section time overlaps with filter time range
            return (sectionStartTime >= filterStartTime && sectionStartTime < filterEndTime) ||
                (sectionEndTime > filterStartTime && sectionEndTime <= filterEndTime) ||
                (sectionStartTime <= filterStartTime && sectionEndTime >= filterEndTime);
        });
    },

    /**
     * Check if a course has sections of a specific type
     * @param {Object} course - Course object to check
     * @param {string} type - Section type to match (e.g., "LEC", "DIS")
     * @returns {boolean} True if course has sections of the specified type
     */
    matchesMeetingType: function (course, type) {
        return course.sections.some(section => section.type === type);
    },

    /**
     * Check if a course matches enrollment status criteria
     * @param {Object} course - Course object to check
     * @param {string} status - Enrollment status to match ("open", "closed", or "waitlist")
     * @returns {boolean} True if course matches enrollment status
     */
    matchesEnrollmentStatus: function (course, status) {
        return course.sections.some(section => {
            const current = section.enrollment.current;
            const max = section.enrollment.max;
            const waitlist = section.enrollment.waitlist;

            switch (status) {
                case 'open':
                    return current < max;
                case 'closed':
                    return current >= max;
                case 'waitlist':
                    return waitlist > 0;
                default:
                    return true;
            }
        });
    },

    /**
     * Check if a course matches GE options
     * @param {Object} course - Course object to check
     * @param {string|Array} options - GE options to match
     * @returns {boolean} True if course matches GE options
     */
    matchesGEOptions: function (course, options) {
        // If options is a string, convert to array
        if (!Array.isArray(options)) {
            options = [options];
        }

        return options.some(option => course.geCodes.includes(option.toUpperCase()));
    },

    /**
     * Check if a course matches core literacies
     * @param {Object} course - Course object to check
     * @param {string|Array} literacies - Core literacies to match
     * @returns {boolean} True if course matches core literacies
     */
    matchesCoreLiteracies: function (course, literacies) {
        // If literacies is a string, convert to array
        if (!Array.isArray(literacies)) {
            literacies = [literacies];
        }

        return literacies.some(literacy => course.geCodes.includes(literacy.toUpperCase()));
    }
};
