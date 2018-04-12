/**
 * This is the entry file for the application, only setup and boilerplate
 * code.
 */

import React from "react";
import ReactDOM from "react-dom";
import FontFaceObserver from "fontfaceobserver";
import registerServiceWorker from './registerServiceWorker';

import "sanitize.css/sanitize.css";

// Import root app
import App from "./containers/App";


const mainFontObserver = new FontFaceObserver("Vollkorn", {});
mainFontObserver.load().then(
  () => {
    document.body.classList.add("fontLoaded");
  },
  () => {
    document.body.classList.remove("fontLoaded");
  }
);

ReactDOM.render(<App />, document.getElementById("root"));
// registerServiceWorker();
