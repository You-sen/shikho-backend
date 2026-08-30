export default {
  routes: [
    { method: 'GET', path: '/admin-stats', handler: 'admin-stats.getStats', config: { policies: [] } },
    { method: 'GET', path: '/admin-stats/roles', handler: 'admin-stats.getRoles', config: { policies: [] } },
  ],
};