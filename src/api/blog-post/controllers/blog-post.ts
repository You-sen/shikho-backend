/**
 * blog-post controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::blog-post.blog-post', ({ strapi }) => ({

  async find(ctx) {
    const user = ctx.state.user;
    const isStaff = user && ['Platform Admin', 'Content Manager'].includes(user.role?.name);

    if (!isStaff) {
      // Force filter to published-only for public/student
      ctx.query = {
        ...ctx.query,
        filters: {
          ...(ctx.query.filters as object || {}),
          blogStatus: 'published',
        },
      };
    }

    const { data, meta } = await super.find(ctx);
    return { data, meta };
  },

  async findOne(ctx) {
    const user = ctx.state.user;
    const isStaff = user && ['Platform Admin', 'Content Manager'].includes(user.role?.name);

    const { data } = await super.findOne(ctx);

    if (!data) return ctx.notFound();

    if (!isStaff && data.blogStatus !== 'published') {
      return ctx.notFound(); // hide drafts from non-staff entirely, don't reveal existence
    }

    return { data };
  },

}));
