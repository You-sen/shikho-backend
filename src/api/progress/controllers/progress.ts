/**
 * progress controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::progress.progress', ({ strapi }) => ({

  async markComplete(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in');

    const { lessonId } = ctx.request.body;
    if (!lessonId) return ctx.badRequest('lessonId is required');

    // Get the lesson to find its course (needed for the denormalized course field)
    const lesson = await strapi.db.query('api::lesson.lesson').findOne({
      where: { id: lessonId },
      populate: ['course'],
    });

    if (!lesson) return ctx.notFound('Lesson not found');

    // Confirm student is actually enrolled in this course
    const enrollment = await strapi.db.query('api::enrollment.enrollment').findOne({
      where: { student: user.id, course: lesson.course.id },
    });

    if (!enrollment) return ctx.forbidden('You are not enrolled in this course');

    // Check if a progress record already exists (avoid duplicates)
    const existing = await strapi.db.query('api::progress.progress').findOne({
      where: { student: user.id, lesson: lessonId },
    });

    let progress;
    if (existing) {
      progress = await strapi.db.query('api::progress.progress').update({
        where: { id: existing.id },
        data: { completed: true, completedAt: new Date() },
      });
    } else {
      progress = await strapi.db.query('api::progress.progress').create({
        data: {
          student: user.id,
          lesson: lessonId,
          course: lesson.course.id,
          completed: true,
          completedAt: new Date(),
        },
      });
    }

    return { data: progress };
  },

  async getCourseProgress(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in');

    const { courseId } = ctx.params;

    // Total lessons in the course
    const totalLessons = await strapi.db.query('api::lesson.lesson').count({
      where: { course: courseId },
    });

    if (totalLessons === 0) {
      return { data: { completed: 0, total: 0, percentage: 0 } };
    }

    // Completed lessons for this student in this course
    const completedCount = await strapi.db.query('api::progress.progress').count({
      where: { student: user.id, course: courseId, completed: true },
    });

    const percentage = Math.round((completedCount / totalLessons) * 100);

    return {
      data: {
        completed: completedCount,
        total: totalLessons,
        percentage,
      },
    };
  },

}));
