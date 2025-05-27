import { CanvasProvider } from "../types/CanvasContext";
import CanvasStage from "../components/CanvasStage";
import Toolbar from "../components/Toolbar";
import TimelineEditor from "../components/TimelineEditor";

export default function TacticalBoard () { 
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