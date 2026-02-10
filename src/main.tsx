import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { HelmetProvider } from "react-helmet-async";

const shouldIgnorePromiseError = (reason: unknown) => {
  const msg = typeof reason === "string" ? reason : (reason as any)?.message;
  if (!msg) return false;
  return (
    msg.includes(
      "A listener indicated an asynchronous response by returning true, but the message channel closed before a response was received",
    ) || msg.includes("message channel closed before a response was received")
  );
};

window.addEventListener("unhandledrejection", (event) => {
  if (shouldIgnorePromiseError(event.reason)) {
    event.preventDefault();
  }
});

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
