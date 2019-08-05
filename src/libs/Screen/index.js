const ToggleFullscreen = () => {
  const doc = document;
  const elm = doc.documentElement;
  if (elm.requestFullscreen) {
    if (!doc.fullscreenElement) {
      elm.requestFullscreen();
    } else {
      doc.exitFullscreen();
    }
  } else if (elm.mozRequestFullScreen) {
    if (!doc.mozFullScreen) {
      elm.mozRequestFullScreen();
    } else {
      doc.mozCancelFullScreen();
    }
  } else if (elm.msRequestFullscreen) {
    if (!doc.msFullscreenElement) {
      elm.msRequestFullscreen();
    } else {
      doc.msExitFullscreen();
    }
  } else if (elm.webkitRequestFullscreen) {
    if (!doc.webkitIsFullscreen) {
      elm.webkitRequestFullscreen();
    } else {
      doc.webkitCancelFullscreen();
    }
  }
};

export default {
  ToggleFullscreen,
};
