import type { Context } from 'koa';

export default {
  async getStats(ctx: Context) {
    if (!ctx.state.user) return ctx.unauthorized('You must be logged in');
    console.log('DEBUG ctx.state.user.id:', ctx.state.user.id);
    const authUser = await strapi.db.query('plugin::users-permissions.user').findOne({
      where: { id: ctx.state.user.id },
      populate: ['role'],
    });

    console.log('DEBUG authUser:', JSON.stringify(authUser, null, 2));
    console.log('DEBUG role name:', authUser?.role?.name);

    if (!authUser || authUser.role?.name !== 'Platform Admin') {
      return ctx.forbidden('Admin access only');
    }

    const totalUsers = await strapi.db.query('plugin::users-permissions.user').count();
    const totalCourses = await strapi.db.query('api::course.course').count();
    const totalEnrollments = await strapi.db.query('api::enrollment.enrollment').count();

    const roles = ['Authenticated', 'Instructor', 'Content Manager', 'Platform Admin'];
    const usersPerRole: Record<string, number> = {};

    for (const roleName of roles) {
      const role = await strapi.db.query('plugin::users-permissions.role').findOne({
        where: { name: roleName },
      });
      if (role) {
        usersPerRole[roleName] = await strapi.db.query('plugin::users-permissions.user').count({
          where: { role: role.id },
        });
      }
    }

    return {
      data: { totalUsers, totalCourses, totalEnrollments, usersPerRole },
    };
  },

  async getRoles(ctx: Context) {
    if (!ctx.state.user) return ctx.unauthorized('You must be logged in');

    const authUser = await strapi.db.query('plugin::users-permissions.user').findOne({
      where: { id: ctx.state.user.id },
      populate: ['role'],
    });

    if (!authUser || authUser.role?.name !== 'Platform Admin') {
      return ctx.forbidden('Admin access only');
    }

    const roles = await strapi.db.query('plugin::users-permissions.role').findMany({
      select: ['id', 'name'],
    });

    return { data: roles };
  },
};