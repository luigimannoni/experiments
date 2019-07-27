const routes = [
  {
    path: '/',
    exact: true,
    component: 'Home',
  },
  {
    path: '/three/:name',
    component: 'Three',
  },
  {
    path: '/babylon/:name',
    component: 'Babylon',
  },
  {
    path: '/matter/:name',
    component: 'Matter',
  },
  {
    path: '/generic/:name',
    component: 'Generic',
  },    
];

export default routes;