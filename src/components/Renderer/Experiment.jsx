import React from "react";
import { useParams } from "react-router-dom";

import Three from "../Three";
import Javascript from "../Javascript";
import Babylon from "../Babylon";
import Css from "../CSS";

export default function Experiment() {
  const pascalCase = (s) =>
    s
      .replace(
        /(\w)(\w*)/g,
        (_g0, g1, g2) => g1.toUpperCase() + g2.toLowerCase()
      )
      .replace(/-/g, "");

  const render404 = () => (
    <div className="flex flex-center">
      <h1 className="giant glitch">404</h1>
    </div>
  );

  const ComponentMap = {
    Three,
    Javascript,
    Babylon,
    Css,
  };

  const params = useParams();

  const { type, name } = params;
  const MainComponent = ComponentMap[pascalCase(type)] || null;
  const TrueComponent = MainComponent ? MainComponent[pascalCase(name)] : null;

  if (!MainComponent || !TrueComponent) {
    return render404();
  }

  return <TrueComponent />;
}
