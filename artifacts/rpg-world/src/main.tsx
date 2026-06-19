import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Tự động chuyển sang game 3D khi người dùng vào port 3000
if (window.location.port === "3000") {
  const url3d = window.location.href.replace(/:3000/, ":3002");
  window.location.replace(url3d);
} else {
  createRoot(document.getElementById("root")!).render(<App />);
}
