import type { Core } from '@strapi/strapi';
export default async (policyContext: any, config: any, { strapi }: { strapi: Core.Strapi }) => {
  const user = policyContext.state.user;
  if (!user) return false;

  if (user.role?.name === 'Platform Admin' || user.role?.name === 'Content Manager') {
    return true;
  }
  if (user.role?.name !== 'Instructor') return false;

  const quizId = policyContext.params.id;
  if (!quizId) return false;

  const quiz = await strapi.db.query('api::quiz.quiz').findOne({
    where: { id: quizId },
    populate: { course: { populate: ['owner'] } },
  });

  if (!quiz || !quiz.course) return false;

  return quiz.course.owner?.id === user.id;
};