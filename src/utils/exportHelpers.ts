export const exportCanvasAsImage = (stageRef: any, name: string = "tactic") => {
    const uri = stageRef.current.toDataURL();
    const link = document.createElement("a");
    link.download = `${name}.png`;
    link.href = uri;
    link.click();
  };