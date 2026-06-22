module.exports = {
  // Configures the widgets and iOS Live Activities compiled by Voltra
  widgets: {
    lessonTracker: {
      name: 'LessonTrackerWidget',
      description: 'Displays active class teaching progress and tasks.',
      supportedFamilies: ['systemSmall', 'systemMedium'],
    },
  },
  liveActivities: {
    activeSession: {
      name: 'ActiveTeachingSession',
      description: 'Real-time countdown and tracking for dynamic classrooms.',
    },
  },
};
