import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("StokMate root element is missing.");
}

createRoot(root).render(
  <StrictMode>
    <main>
      <h1>StokMate</h1>
      <p>Web application foundation</p>
    </main>
  </StrictMode>,
);
