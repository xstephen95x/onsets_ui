import { injectGlobal } from "styled-components";

export const Colors = {
  bg: "#f4f9fd",
  bgRed: "#99535E",
  bgYel: "#CCB531",
  fgRed: "#CC344A",
  lightRed: "#CC344A",
  fgYel: "#FFFA94",
  lightYel: "rgba(255, 167, 38, .8)",
  font: "#434e5a",
  hlRed: "#f05545",
  hlYel: "#ffd95b",
  txtYel: "#f7ee7f",
  primary: "#ff3b30",
  brightRed: "rgba(196, 7, 7, 0.7)",
  banner: "blue",
  alert: "#f7ee7f",
  metal: "#b5c2b7",
  modal: "rgba(126, 1, 1, 0.68)",
  modalTxt: "black",
  cube: "#fff3e6",
  scratchPad: "rgba(255, 255, 255, 0.8)",
  cubeSelected: "#679ef7"
};

injectGlobal`
  html,
  body {
    height: 100%;
    width: 100%;
  }

  body.fontLoaded {
    font-family: 'Catamaran', sans-serif;
    background-color: #f2f2f2;
  }

`;
