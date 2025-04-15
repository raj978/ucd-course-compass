/**
 * Data Loading and Processing
 * 
 * Handles loading course data from JSON files and processing it into a more usable format.
 */
const DataLoader = {
    /**
     * Load data for all terms
     * @returns {Promise} Promise resolving to object with processed data for all terms
     */
    loadAllTerms: function () {
        return Promise.all([
            fetch('data/ucd_classes_fall_2025.json').then(response => response.json()),
            fetch('data/ucd_classes_winter_2025.json').then(response => response.json()),
            fetch('data/ucd_classes_spring_2025.json').then(response => response.json())
        ])
            .then(([fallData, winterData, springData]) => {
                return {
                    'fall': this.processCourseData(fallData),
                    'winter': this.processCourseData(winterData),
                    'spring': this.processCourseData(springData)
                };
            });
    },

    /**
     * Process course data from JSON into a more usable format
     * @param {Array} data - Raw JSON data from server
     * @returns {Array} Processed course data
     */
    processCourseData: function (data) {
        const processedData = [];
        const subjectMap = new Map(); // Maps subjects to departments

        data.forEach(courseList => {
            courseList.forEach(course => {
                try {
                    // Skip incomplete course data
                    if (!course.course || !course.course.subjectCode) return;

                    // Extract basic course information
                    const courseEntry = {
                        code: course.course.subjectCode,
                        number: course.course.courseNum || '',
                        title: course.course.title || 'No Title Available',
                        units: course.course.unitsLow || (course.course.creditHours ? parseInt(course.course.creditHours) : 'Var'),
                        description: course.icmsData?.newDescription || 'No description available',
                        prerequisites: course.icmsData?.prereq || 'None',
                        geCodes: course.icmsData?.ge3 || '',
                        sections: this.processSections(course),
                        department: course.course.subjectDesc || 'Unknown Department',
                        crn: course.course.crn || '',
                        finalExam: course.finalExam?.examDate || 'No exam information',
                        instructors: this.processInstructors(course.instructor)
                    };

                    // Add to our set of all subjects
                    allSubjects.add(courseEntry.code);

                    // Map subject to department
                    if (courseEntry.department && courseEntry.code) {
                        subjectMap.set(courseEntry.code, courseEntry.department);
                    }

                    processedData.push(courseEntry);
                } catch (error) {
                    console.error('Error processing course:', error, course);
                }
            });
        });

        // Sort courses alphabetically by subject code, then numerically by course number
        processedData.sort((a, b) => {
            if (a.code !== b.code) {
                return a.code.localeCompare(b.code);
            }
            return parseFloat(a.number) - parseFloat(b.number);
        });

        return processedData;
    },

    /**
     * Process instructor data
     * @param {Array} instructorData - Raw instructor data
     * @returns {Array} Processed instructor data
     */
    processInstructors: function (instructorData) {
        if (!instructorData || !Array.isArray(instructorData) || instructorData.length === 0) {
            return [{
                name: 'Staff',
                email: ''
            }];
        }

        return instructorData.map(instructor => {
            return {
                name: instructor.fullName || instructor.instructorName || 'Staff',
                email: instructor.instructorEmail || ''
            };
        });
    },

    /**
     * Process section data
     * @param {Object} course - Course object with section/meeting data
     * @returns {Array} Processed section data
     */
    processSections: function (course) {
        const sections = [];

        // Check if course has meeting data
        if (!course.meeting || !Array.isArray(course.meeting) || course.meeting.length === 0) {
            return sections;
        }

        try {
            // Create a section for each meeting time
            course.meeting.forEach((meeting, index) => {
                // Skip if missing essential data
                if (!meeting.type || !meeting.daysString) return;

                const section = {
                    crn: course.course?.crn || '',
                    type: meeting.type,
                    meetingCode: meeting.meetCode || '',
                    description: meeting.description || 'Section',
                    days: meeting.daysString,
                    startTime: Utils.formatTime(meeting.startTime),
                    endTime: Utils.formatTime(meeting.endTime),
                    building: meeting.building || 'TBA',
                    room: meeting.room || 'TBA',
                    instructor: course.instructor && course.instructor.length > 0 ?
                        (course.instructor[0].fullName || course.instructor[0].instructorName || 'Staff') :
                        'Staff',
                    status: course.enrollmentStatus || 'Unknown',
                    enrollment: {
                        current: course.currentEnrollment || 0,
                        max: course.maxEnrollment || 0,
                        waitlist: course.waitlistCount || 0
                    },
                    dates: {
                        start: meeting.startDate ? new Date(meeting.startDate).toLocaleDateString() : 'TBA',
                        end: meeting.endDate ? new Date(meeting.endDate).toLocaleDateString() : 'TBA'
                    }
                };

                sections.push(section);
            });
        } catch (error) {
            console.error('Error processing course sections:', error, course);
        }

        return sections;
    }
};
