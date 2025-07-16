import { useEffect, useRef, useState } from "react";
import { config } from "../../config";

export default function Surface({ state, dispatch }) {
  const [windowSize, setWindowSize] = useState([
    window.innerWidth,
    window.innerHeight,
  ]);
  const [baseSnapshot, setBaseSnapshot] = useState(null);

  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const mousePositionRef = useRef({ x: 0, y: 0 });
  const isDrawingRef = useRef(false);
  const drawingCoordsRef = useRef([]);

  // on first render
  useEffect(() => {
    ctxRef.current = canvasRef.current.getContext("2d", {
      willReadFrequently: true,
    });

    const resizer = () => {
      setWindowSize([window.innerWidth, window.innerHeight]);
    };

    window.addEventListener("resize", resizer);

    return () => {
      window.removeEventListener("resize", resizer);
    };
  }, []);

  //on window resize
  useEffect(() => {
    canvasRef.current.width = window.innerWidth - canvasRef.current.offsetLeft;
    canvasRef.current.height = window.innerHeight - canvasRef.current.offsetTop;
    redrawAll();
  }, [windowSize]);

  // redrawing canvas if necessary
  useEffect(() => {
    redrawAll();
  }, [state.historyIndex, state.backgroundColor, state.currentAction]);

  // handling current action
  useEffect(() => {
    switch (state.currentAction) {
      case "saving":
        dispatch({
          type: "save",
          data: canvasRef.current.toDataURL("image/png", 100),
        });
        break;
      case "cleaning":
        setBaseSnapshot(null);
        dispatch({
          type: "clear",
        });
        break;
    }
  }, [state.currentAction]);

  function redrawAll() {
    drawBaseSnapshot();
    for (
      let i = state.history.length - 1;
      i >= Math.max(0, state.historyIndex);
      i--
    ) {
      const historyRecord = state.history[i];
      drawHistoryRecord(historyRecord);
    }
  }

  function drawHistoryRecord(historyRecord) {
    const ctx = ctxRef.current;

    ctx.save();
    ctx.strokeStyle = historyRecord.isBrush
      ? historyRecord.brushColor
      : state.backgroundColor;
    ctx.lineWidth = historyRecord.brushSize;
    ctx.beginPath();
    for (let i = 0; i < historyRecord.coords.length; i++) {
      const coords = historyRecord.coords[i];
      if (i == 0) {
        ctx.moveTo(coords[0], coords[1]);
      } else {
        ctx.lineTo(coords[0], coords[1]);
        ctx.stroke();
      }
    }
    ctx.closePath();
    ctx.restore();
  }

  function drawBaseSnapshot() {
    if (baseSnapshot) {
      ctxRef.current.putImageData(baseSnapshot, 0, 0);
    } else {
      ctxRef.current.clearRect(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );
    }
  }

  function evaluateCoords(e) {
    if (!e.changedTouches) {
      mousePositionRef.current = {
        x: e.pageX - canvasRef.current.offsetLeft,
        y: e.pageY - canvasRef.current.offsetTop,
      };
    } else {
      mousePositionRef.current = {
        x: e.changedTouches[0].pageX - canvasRef.current.offsetLeft,
        y: e.changedTouches[0].pageY - canvasRef.current.offsetTop,
      };
    }
  }

  function handleMouseDown(e) {
    evaluateCoords(e);

    const ctx = ctxRef.current;
    const coords = [mousePositionRef.current.x, mousePositionRef.current.y];

    ctx.strokeStyle = state.isBrushActive
      ? state.brushColor
      : state.backgroundColor;
    ctx.lineWidth = state.brushSize;
    ctx.beginPath();
    ctx.moveTo(coords[0], coords[1]);

    isDrawingRef.current = true;
    drawingCoordsRef.current.push(coords);
  }

  function handleMouseMove(e) {
    if (isDrawingRef.current === false) return;

    evaluateCoords(e);

    const ctx = ctxRef.current;
    const coords = [mousePositionRef.current.x, mousePositionRef.current.y];

    ctx.lineTo(coords[0], coords[1]);
    ctx.stroke();

    drawingCoordsRef.current.push(coords);
  }

  function handleMouseUp(e) {
    if (isDrawingRef.current === true) {
      evaluateCoords(e);

      const ctx = ctxRef.current;
      const coords = [mousePositionRef.current.x, mousePositionRef.current.y];

      ctx.lineTo(coords[0], coords[1]);
      ctx.stroke();
      ctx.closePath();

      isDrawingRef.current = false;
      drawingCoordsRef.current.push(coords);

      if (state.history.length == config.historyBufferSize) {
        const currentImage = ctx.getImageData(
          0,
          0,
          canvasRef.current.width,
          canvasRef.current.height
        );
        drawBaseSnapshot();
        drawHistoryRecord(state.history[state.history.length - 1]);
        setBaseSnapshot(
          ctx.getImageData(
            0,
            0,
            canvasRef.current.width,
            canvasRef.current.height
          )
        );
        ctx.putImageData(currentImage, 0, 0);
      }
      dispatch({ type: "addHistory", data: drawingCoordsRef.current });
      drawingCoordsRef.current = [];
    }
  }

  return (
    <canvas
      className="surface"
      ref={canvasRef}
      style={{ backgroundColor: state.backgroundColor }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleMouseDown}
      onMouseMove={handleMouseMove}
      onTouchMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchEnd={handleMouseUp}
    ></canvas>
  );
}
