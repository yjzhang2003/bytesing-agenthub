import { createRoot } from "react-dom/client";
import { AgentHubWorkbench } from "@agenthub/ui";
import { createDemoWorkspaceFlow } from "./app-state.js";

createDemoWorkspaceFlow();

const root = document.querySelector("#root");

if (root) {
  createRoot(root).render(<AgentHubWorkbench />);
}
