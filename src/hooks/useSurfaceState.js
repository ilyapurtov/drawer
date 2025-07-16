import { useReducer, useState } from "react";
import { config } from "../config";

export function useSurfaceState() {
  const [surfaceState, dispatch] = useReducer(surfaceStateReducer, {
    currentAction: "drawing",
    brushSize: config.defaultBrushSize,
    isBrushActive: true,
    brushColor: config.defaultBrushColor,
    backgroundColor: config.defaultBackgroundColor,
    history: [],
    historyIndex: 0,
  });

  return [surfaceState, dispatch];
}

function surfaceStateReducer(prevState, action) {
  switch (action.type) {
    case "draw":
      return { ...prevState, isBrushActive: true };
    case "erase":
      return { ...prevState, isBrushActive: false };

    case "brushColor":
    case "backgroundColor":
    case "brushSize":
      return { ...prevState, [action.type]: action.data };

    case "requestSaving":
      return { ...prevState, currentAction: "saving" };
    case "requestClearCanvas":
      return { ...prevState, currentAction: "cleaning" };
    case "save":
      const link = document.createElement("a");
      link.href = action.data;
      link.download = "your-picture.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return { ...prevState, currentAction: "drawing" };
    case "clear":
      return {
        ...prevState,
        historyIndex: 0,
        history: [],
        currentAction: "drawing",
      };

    default:
      return {
        ...prevState,
        ...handleHistory(prevState, action),
      };
  }
}

function handleHistory(prevState, action) {
  let history = prevState.history.slice();
  let historyIndex = prevState.historyIndex;

  switch (action.type) {
    case "undo":
      if (historyIndex <= history.length - 1) {
        historyIndex++;
      }
      break;
    case "redo":
      if (historyIndex > 0) {
        historyIndex--;
      }
      break;
    case "addHistory": {
      const newHistoryRecord = {
        brushSize: prevState.brushSize,
        brushColor: prevState.brushColor,
        isBrush: prevState.isBrushActive,
        coords: action.data,
      };

      // resetting history index if necessary
      if (historyIndex > 0) {
        history = history.filter((_, index) => index >= historyIndex);
        historyIndex = 0;
      }

      if (history.length == config.historyBufferSize) {
        history = [
          newHistoryRecord,
          ...history.filter(
            (_, index) => index != config.historyBufferSize - 1
          ),
        ];
      } else {
        history = [newHistoryRecord, ...history];
      }
      break;
    }
  }

  return { history, historyIndex };
}
