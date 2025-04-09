import { createContext, useState ,useContext} from 'react';
import { Unit, Arrow, Game  } from "./type";
import { create } from "zustand";


export interface CanvasContextType {
  elements: Unit[];
  setElements: React.Dispatch<React.SetStateAction<Unit[]>>;
  arrows: Arrow[];
  setArrows: React.Dispatch<React.SetStateAction<Arrow[]>>;
}
export const CanvasContext= createContext<CanvasContextType | null>(null);

export const CanvasProvider = ({ children }: { children: React.ReactNode }) => {
    const [elements, setElements] = useState<Unit[]>([
        { id: 1, x: 0.08, y: 0.55, team: "red", type: "Hero" },
        { id: 2, x: 0.12, y: 0.6, team: "red", type: "Engineer" },
        { id: 3, x: 0.16, y: 0.61, team: "red", type: "Infantry 3" },
        { id: 4, x: 0.12, y: 0.45, team: "red", type: "Infantry 4" },
        { id: 6, x: 0.06, y: 0.12, team: "red", type: "Drone" },
        { id: 7, x: 0.18, y: 0.51, team: "red", type: "Sentry" },
    
        { id: 1, x: 0.92, y: 0.56, team: "blue", type: "Hero" },
        { id: 2, x: 0.85, y: 0.53, team: "blue", type: "Engineer" },
        { id: 3, x: 0.88, y: 0.38, team: "blue", type: "Infantry 3" },
        { id: 4, x: 0.93, y: 0.41, team: "blue", type: "Infantry 4" },
        { id: 6, x: 0.92, y: 0.84, team: "blue", type: "Drone" },
        { id: 7, x: 0.84, y: 0.43, team: "blue", type: "Sentry" },
    ]);
  
    const [arrows, setArrows] = useState<Arrow[]>([]);
  
    return (
      <CanvasContext.Provider value={{ elements, setElements, arrows, setArrows }}>
        {children}
      </CanvasContext.Provider>
    );
  };


// export const useCanvasContext = () => useContext(CanvasContext);
export const useCanvasContext = () => {
  const ctx = useContext(CanvasContext);
  if (!ctx) {
    throw new Error("useCanvasContext must be used within a CanvasProvider");
  }
  return ctx;
};


export const useGameData = create<Game>((set, get) => ({
  frames: [],
  ticks: 0,

  addFrame: (frame) => {
    const current = get();
    const newFrame = JSON.parse(JSON.stringify(frame)); // Deep copy the frame
    set({ frames: [...current.frames, newFrame], ticks: current.frames.length + 1 });
  },

  setCurrentFrame: (frame,setElements) => {
    set({ ticks: frame });
    setElements(get().frames[frame-1].robots);
    console.log(get().frames);
  },

  updateCurrentUnits: (units) => {
    const { frames, ticks } = get();
    const updatedFrames = [...frames];
    updatedFrames[ticks] = {
      robots: units.robots
    };
    set({ frames: updatedFrames });
  },


  loadFrames: (frames) => set({ frames,ticks : 0 }),

  exportGame: () => {
    const { frames } = get();
    const game = {
      data: frames.map((f) => ({ robots: f.robots })),
      ticks: frames.length,
    };
    return JSON.stringify(game, null, 2);
  },

  importGame: (gameJson) => {
    try {
      const game = JSON.parse(gameJson);
      const frames = game.data.map((frame: any) => ({
        robots: frame.robots,
      }));
      set({ frames, ticks : 0 });
    } catch (error) {
      console.error("Failed to import game:", error);
    }
  },
}));

interface ToggleDrawState {
  draw: boolean;
  toggleDraw: () => void;
}
export const useToggleDraw = create<ToggleDrawState>((set) => ({
  draw: false,
  toggleDraw: () => set((state) => ({ draw: !state.draw })),
}));