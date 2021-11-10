import { Pane as PaneLib } from 'tweakpane';

let pane = null;

const Pane = {
  mount: () => {
    pane = new PaneLib({
      title: 'Control panel',
    });
  },

  unmount: () => {
    // Flush Pane
    if (pane !== null) {
      pane.dispose();
      pane = null;
    }
  },

  interface: () => pane,
};

export default Pane;
