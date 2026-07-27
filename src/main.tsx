import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { StoreProvider } from "./state/store";
import { DilProvider } from "./i18n/DilContext";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <DilProvider>
      <StoreProvider>
        <App />
      </StoreProvider>
    </DilProvider>
  </React.StrictMode>
);
