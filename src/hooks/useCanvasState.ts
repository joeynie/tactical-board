import { useState } from "react";
import { Unit, Arrow } from "../types/type";
import { useCanvasContext } from "../types/CanvasContext";

export const useCanvasState = () => {
  const { elements, setElements, arrows, setArrows } = useCanvasContext();
  const moveElement = (idx: number, x: number, y: number) => {
    const newElements = [...elements];
    newElements[idx].x = x;
    newElements[idx].y = y;
    setElements(newElements);
  };

  // const [arrows, setArrows] = useState<any[]>([]);
  const addArrow = (a : Arrow) => {
    setArrows([...arrows, { ...a }]);
  };
  const clearArrows = () => {
    setArrows([]);
  };

  // const exportTactic = () => {
  //   const output = { elements };
  //   const blob = new Blob([JSON.stringify(output, null, 2)], { type: "application/json" });
  //   const url = URL.createObjectURL(blob);
  //   const link = document.createElement("a");
  //   link.href = url;
  //   link.download = "tactic.json";
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);
  // };

  // const importTactic = (e: any) => {
  //   const file = e.target.files[0];
  //   if (!file) return;
  //   const reader = new FileReader();
  //   reader.onload = (evt) => {
  //     const json = JSON.parse(evt.target?.result as string);
  //     if (json.elements) setElements(json.elements);
  //   };
  //   reader.readAsText(file);
  // };

  return { elements, arrows, moveElement, addArrow, clearArrows };
};