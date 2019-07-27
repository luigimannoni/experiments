const routes = [
  {
    path: '/',
    exact: true,
    component: 'Home',
  },
  {
    path: '/:type/:name',
    component: 'Experiment',
  },
];

export default routes;