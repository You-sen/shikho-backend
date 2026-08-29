import type { Core } from '@strapi/strapi';
export default async (policyContext: any, config: any, { strapi }: { strapi: Core.Strapi }) => {
  const user = policyContext.state.user;
  if (!user) return false;

  if (user.role?.name === 'Platform Admin' || user.role?.name === 'Content Manager') {
    return true;
  }
  if (user.role?.name !== 'Instructor') return false;

  const lessonId = policyContext.params.id;
  if (!lessonId) return false;

  const lesson = await strapi.db.query('api::lesson.lesson').findOne({
    where: { id: lessonId },
    populate: { course: { populate: ['owner'] } },
  });

  if (!lesson || !lesson.course) return false;

  return lesson.course.owner?.id === user.id;
};