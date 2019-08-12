import React, { Component } from 'react';
import Matter from 'matter-js';
import MatterAttractors from 'matter-attractors-f';
import GUI from '../../../../libs/GUI';
import Screen from '../../../../libs/Screen';

export default class MatterRepulsor extends Component {
  constructor(...args) {
    super(...args);
    this.engine = null;
    this.renderer = null;
  }

  componentDidMount() {
    Matter.use(MatterAttractors);

    const {
      Engine,
      Render,
      Composite,
      Composites,
      Constraint,
      MouseConstraint,
      Mouse,
      World,
      Bodies,
      Body,
    } = Matter;

    const worldsize = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    const bounds = {
      min: { x: 0, y: 0 },
      max: { x: worldsize.width, y: worldsize.height },
    };

    const settings = {
      backgroundGradientDegrees: 25,
      backgroundGradientStart: '#2ba7fe',
      backgroundGradientEnd: '#0a0059',
      dots: '#ffffff',
      randomForceMultiplier: 0,
      dotSize: 8,
      dotScale: 1,
      stiffness: 0.0015,
      force: 1,
      damping: 0.015,
    };


    this.engine = Engine.create({
      positionIterations: 20,
      velocityIterations: 20,
      constraintIterations: 1,
    });
    this.engine.world.gravity.y = 0;

    this.renderer = Render.create({
      element: document.body,
      engine: this.engine,
      options: {
        width: worldsize.width,
        height: worldsize.height,
        hasBounds: true,
        wireframes: false,
        background: 'transparent',
        pixelRatio: 'auto',
      },
      bounds,
    });

    const compBodyOpts = {
      render: {
        fillStyle: settings.dots,
        strokeStyle: 'white',
        lineWidth: 0,
      },
    };

    const stack = {
      gap: 30,
    };

    const wallOpts = {
      render: compBodyOpts.render,
      isStatic: true,
    };

    // add all of the bodies to the world
    const boundaries = 900;
    const walls = [
      Bodies.rectangle(
        worldsize.width / 2,
        0 - boundaries / 2,
        worldsize.width * 2,
        boundaries,
        wallOpts,
      ),
      Bodies.rectangle(
        worldsize.width / 2,
        worldsize.height + boundaries / 2,
        worldsize.width * 2,
        boundaries,
        wallOpts,
      ),
      Bodies.rectangle(
        worldsize.width + boundaries / 2,
        worldsize.height / 2,
        boundaries,
        worldsize.height * 2,
        wallOpts,
      ),
      Bodies.rectangle(
        0 - boundaries / 2,
        worldsize.height / 2,
        boundaries,
        worldsize.height * 2,
        wallOpts,
      ),
    ];


    const plugin = {
      attractors: [
        (bodyA, bodyB) => {
          const distance = {
            x: (bodyA.position.x - bodyB.position.x),
            y: (bodyA.position.y - bodyB.position.y),
          };

          const dir = {
            x: distance.x >= 0 ? 1 : -1,
            y: distance.y >= 0 ? 1 : -1,
          };

          const threshold = 250;

          const power = 1e-5;

          const pos = {
            x: Math.abs(Math.min(Math.abs(distance.x), threshold)),
            y: Math.abs(Math.min(Math.abs(distance.y), threshold)),
          };

          const angular = {
            x: 1 - Math.sin((Math.PI / 2) * (100 / threshold * pos.x) / 100),
            y: 1 - Math.sin((Math.PI / 2) * (100 / threshold * pos.y) / 100),
          };
          const finalAngular = angular.x * angular.y;

          const coeff = {
            x: (threshold - distance.x) / 200,
            y: (threshold - distance.y) / 200,
          };

          return {
            x: pos.x * dir.x * finalAngular * (settings.force * power * coeff.x) * -1,
            y: pos.y * dir.y * finalAngular * (settings.force * power * coeff.y) * -1,
          };
        },
      ],
    };

    const logo = Bodies.circle(
      worldsize.width / 2 + Math.random() * 2,
      worldsize.height / 2 + Math.random() * 2,
      60,
      {
        render: {
          fillStyle: '#ffffff',
          visible: true,
        },
        plugin,
      },
    );

    const dotCompSize = settings.dotSize * 2 + stack.gap;
    const gridBalls = {
      x: Math.floor((worldsize.width) / dotCompSize),
      y: Math.floor((worldsize.height) / dotCompSize),
    };

    const gridPadding = {
      x: (worldsize.width - (dotCompSize * gridBalls.x - stack.gap)) / 2,
      y: (worldsize.height - (dotCompSize * gridBalls.y - stack.gap)) / 2,
    };

    const grid = Composites.stack(
      gridPadding.x,
      gridPadding.y,
      gridBalls.x,
      gridBalls.y,
      stack.gap,
      stack.gap,
      (x, y) => Bodies.circle(x, y, settings.dotSize, compBodyOpts),
    );

    const bodyMap = {};

    grid.bodies.forEach((body, i) => {
      bodyMap[grid.bodies[i].id] = i;

      Composite.add(grid, Constraint.create({
        bodyB: grid.bodies[i],
        pointA: { x: grid.bodies[i].position.x, y: grid.bodies[i].position.y },
        pointB: { x: 0, y: 0 },
        stiffness: settings.stiffness,
        damping: settings.damping,
        render: {
          visible: false,
        },
      }));
    });

    // add mouse control
    const mouse = Mouse.create(this.renderer.canvas);
    const mouseConstraint = MouseConstraint.create(this.engine, {
      mouse,
      constraint: {
        stiffness: 0.2,
        render: {
          visible: false,
        },
      },
    });

    World.add(this.engine.world, [
      grid,
      ...walls,
      logo,
      mouseConstraint,
    ]);

    Engine.run(this.engine);
    Render.run(this.renderer);

    function setRandomForce() {
      const time = performance.now();
      const position = {
        x: logo.position.x,
        y: logo.position.y,
      };
      const force = {
        x: Math.cos(time / 500) * Math.cos(time / 1500) * settings.randomForceMultiplier,
        y: Math.sin(time / 1000) * Math.sin(time / 1500) * settings.randomForceMultiplier,
      };

      requestAnimationFrame(setRandomForce);

      Body.applyForce(logo, position, force);
    }
    setTimeout(setRandomForce, 3000);

    const updateFuncs = {
      dotsColor: () => {
        grid.bodies.forEach((body, i) => {
          grid.bodies[i].render.fillStyle = settings.dots;
        });
        if (settings.logo === 'solid') {
          logo.render.fillStyle = settings.dots;
        }
      },
      bgColor: () => {
        document.body.style = `height: 100vh; background: linear-gradient(${settings.backgroundGradientDegrees}deg, ${settings.backgroundGradientStart} 0%, ${settings.backgroundGradientEnd} 100%)`;
      },
      dotsConstraints: () => {
        grid.constraints.forEach((body, i) => {
          grid.constraints[i].stiffness = settings.stiffness;
          grid.constraints[i].damping = settings.damping;
        });
      },
      dotScaleUp: () => {
        grid.bodies.forEach((body, i) => {
          Body.scale(grid.bodies[i], 1.1, 1.1);
        });
      },
      dotScaleDown: () => {
        grid.bodies.forEach((body, i) => {
          Body.scale(grid.bodies[i], 0.9, 0.9);
        });
      },
      switchFullscreen: () => {
        Screen.ToggleFullscreen();
      },
    };

    // Editor setup

    GUI.mount();
    const gui = GUI.interface();

    const guiFolder = {
      grid: gui.addFolder('Grid settings'),
      render: gui.addFolder('Render settings'),
      colors: gui.addFolder('Colors'),
    };
    guiFolder.grid.add(updateFuncs, 'dotScaleUp').name('Scale up dots');
    guiFolder.grid.add(updateFuncs, 'dotScaleDown').name('Scale down dots');

    guiFolder.grid.add(settings, 'force', 0, 10).step(0.01).onChange(updateFuncs.dotsConstraints).name('Force field');
    guiFolder.grid.add(settings, 'stiffness', 0, 0.015).step(0.0001).onChange(updateFuncs.dotsConstraints).name('Stiffness');
    guiFolder.grid.add(settings, 'damping', 0, 1).step(0.0001).onChange(updateFuncs.dotsConstraints).name('Damping');
    guiFolder.grid.open();

    guiFolder.render.add(this.engine.timing, 'timeScale', 1e-3, 1.2).step(1e-3).listen().name('Render speed');
    guiFolder.render.add(this.engine.world.gravity, 'scale', 0, 0.001).step(0.0001).name('Gravity force');
    guiFolder.render.add(this.engine.world.gravity, 'x', -1, 1).step(0.01).name('Gravity horiz');
    guiFolder.render.add(this.engine.world.gravity, 'y', -1, 1).step(0.01).name('Gravity vert');
    guiFolder.render.add(settings, 'randomForceMultiplier', 0, 1).step(0.01).name('Random force');
    guiFolder.render.open();

    guiFolder.colors.addColor(settings, 'backgroundGradientStart').onChange(updateFuncs.bgColor).name('BG Gradient Start');
    guiFolder.colors.addColor(settings, 'backgroundGradientEnd').onChange(updateFuncs.bgColor).name('BG Gradient End');
    guiFolder.colors.add(settings, 'backgroundGradientDegrees', 0, 360).step(1).onChange(updateFuncs.bgColor).name('Gradient Deg');
    guiFolder.colors.addColor(settings, 'dots').onChange(updateFuncs.dotsColor).name('Dot color');
    guiFolder.colors.open();

    gui.add(updateFuncs, 'switchFullscreen').name('Fullscreen toggle');


    updateFuncs.bgColor();
  }

  componentWillUnmount() {
    GUI.unmount();
    Matter.Render.stop(this.renderer);
    Matter.World.clear(this.engine.world);
    Matter.Engine.clear(this.engine);

    // Free mem
    this.renderer.canvas.remove();
    this.renderer.canvas = null;
    this.renderer.context = null;
    this.renderer.textures = {};

    document.body.style = '';
  }

  render() {
    return (
      <>
      </>
    );
  }
}
