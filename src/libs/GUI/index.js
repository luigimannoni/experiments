import * as dat from 'dat.gui';

let gui = null;

const GUI = {
  mount: () => {
    gui = new dat.GUI({
      width: 340,
      resizable: false,
    });
    gui.useLocalStorage = true;
  },

  unmount: () => {
    // Flush GUI
    if (gui !== null) {
      gui.destroy();
      gui = null;
    }
  },

  interface: () => gui,
};

export default GUI;
