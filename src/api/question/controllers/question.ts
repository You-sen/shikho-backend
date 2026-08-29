/**
 * question controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::question.question', ({ strapi }) => ({

  async find(ctx) {
    const { data, meta } = await super.find(ctx);

    const user = ctx.state.user;
    const isStaff = user && ['Platform Admin', 'Content Manager', 'Instructor'].includes(user.role?.name);

    if (!isStaff && Array.isArray(data)) {
      data.forEach((item: any) => {
        if (item.correctOptionIndex !== undefined) {
          delete item.correctOptionIndex;
        }
      });
    }

    return { data, meta };
  },

}));
