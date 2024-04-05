import { ColorModeScript } from "@chakra-ui/react";
import React from "react";
import ReactDOMClient from "react-dom/client";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import * as serviceWorker from "./serviceWorker";


const container = document.getElementById("root");
const root = ReactDOMClient.createRoot(container);

window.onerror = function (message, source, lineno, colno, error) {
  console.log("Captured error:", message);
  return true; // Bu, varsayılan hata işleyicinin devreye girmesini önler
};


root.render(
  <>
    <ColorModeScript />
    <App />
  </>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorker.register();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').then(registration => {
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }, err => {
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}

