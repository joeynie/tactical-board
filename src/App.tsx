import React from "react";
import CanvasStage from "./components/CanvasStage";
import Toolbar from "./components/Toolbar";
import TimelineEditor from "./components/TimelineEditor";
import { CanvasProvider } from "./types/CanvasContext";

function App() {
  return (
    <CanvasProvider>
    <div className="flex flex-col items-center gap-4 p-4">
      <h1 className="text-2xl font-bold">Tactical Board</h1>
      <Toolbar />
      <CanvasStage />
      <TimelineEditor />
    </div>
    </CanvasProvider>
  );
}

export default App;