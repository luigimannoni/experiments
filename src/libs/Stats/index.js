import * as StatsJS from 'stats.js';

let statsjs = null;

const Stats = {
  mount: () => {
    statsjs = new StatsJS();
    statsjs.showPanel(0);
    document.body.appendChild(statsjs.dom);
    statsjs.dom.style.top = 'auto';
    statsjs.dom.style.left = 'auto';
    statsjs.dom.style.bottom = 0;
    statsjs.dom.style.right = 0;
  },

  unmount: () => {
    // Flush Stats JS
    if (statsjs !== null) {
      statsjs.dom.remove();
      statsjs = null;
    }
  },

  begin: () => {
    statsjs.begin();
  },

  end: () => {
    statsjs.end();
  },
};

export default Stats;
