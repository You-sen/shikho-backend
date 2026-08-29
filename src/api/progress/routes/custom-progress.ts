export default {
  routes: [
    {
      method: 'POST',
      path: '/progress/complete',
      handler: 'progress.markComplete',
      config: {
        policies: [],
      },
    },
    {
      method: 'GET',
      path: '/progress/course/:courseId',
      handler: 'progress.getCourseProgress',
      config: {
        policies: [],
      },
    },
  ],
};