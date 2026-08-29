/**
 * lesson router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::lesson.lesson', {
  config: {
    update: { policies: ['global::is-lesson-course-owner'] },
    delete: { policies: ['global::is-lesson-course-owner'] },
  },
});