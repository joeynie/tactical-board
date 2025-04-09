
export interface Unit {
  id: number;
  x: number;
  y: number;
  type: string;
  team: string;
  hp?: number;
}

export interface Arrow {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface Frame {
  robots: Unit[];
}

export interface Game {
  frames: Frame[],
  ticks: number;

  addFrame: (frame:Frame) => void;
  setCurrentFrame: (frame: number, setElements:React.Dispatch<React.SetStateAction<Unit[]>>) => void;
  updateCurrentUnits: (units: Frame) => void;
  loadFrames: (frames: Frame[]) => void;
  exportGame: () => string;
  importGame: (gameJson: string) => void;
}