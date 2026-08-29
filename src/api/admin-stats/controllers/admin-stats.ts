export default {
  async getStats(ctx: any) {
    const user = ctx.state.user;
    if (!user || user.role?.name !== 'Platform Admin') {
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
      data: {
        totalUsers,
        totalCourses,
        totalEnrollments,
        usersPerRole,
      },
    };
  },
};