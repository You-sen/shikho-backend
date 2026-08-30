export default (plugin: any) => {
  const originalMe = plugin.controllers.user.me;

  plugin.controllers.user.me = async (ctx: any) => {
    if (!ctx.state.user) {
      return ctx.unauthorized();
    }

    const user = await strapi.db.query('plugin::users-permissions.user').findOne({
      where: { id: ctx.state.user.id },
      populate: ['role'],
    });

    const { password, resetPasswordToken, confirmationToken, ...safeUser } = user;

    ctx.body = safeUser;
  };

  return plugin;
};