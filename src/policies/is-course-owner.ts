import type { Core } from '@strapi/strapi';
export default async (policyContext: any, config: any, { strapi }: { strapi: Core.Strapi }) => {
  const user = policyContext.state.user;

  if (!user) return false; // not logged in

  // Platform Admin and Content Manager bypass ownership checks entirely
  if (user.role?.name === 'Platform Admin' || user.role?.name === 'Content Manager') {
    return true;
  }

  // Only Instructors need the ownership check
  if (user.role?.name !== 'Instructor') return false;

  const courseId = policyContext.params.id;
  if (!courseId) return false; // no course id in request, deny by default

  const course = await strapi.db.query('api::course.course').findOne({
    where: { id: courseId },
    populate: ['owner'],
  });

  if (!course) return false;

  return course.owner?.id === user.id;
};