import Surface from "./components/Surface/Surface";
import { useSurfaceState } from "./hooks/useSurfaceState";
import Toolbar from "./components/Toolbar/Toolbar";
import ToolbarItem from "./components/Toolbar/ToolbarItem";
import { config } from "./config";

function App() {
  const [surfaceState, dispatch] = useSurfaceState();

  // useEffect(() => {
  //   window.addEventListener("beforeunload", (ev) => {
  //     ev.preventDefault();
  //   });
  // }, []);

  return (
    <div className="drawer">
      <Toolbar>
        <ToolbarItem
          type="logo"
          icon="react.png"
          modifierClasses={["toolbar__item_logo"]}
        />
        <ToolbarItem
          type="click"
          onAction={() => dispatch({ type: "requestSaving" })}
          icon="fa-save"
          hint="сохранить холст"
        />
        <ToolbarItem
          type="click"
          onAction={() => dispatch({ type: "undo" })}
          keyCode="KeyZ"
          ctrlKey={true}
          icon="fa-rotate-left"
          hint="отменить (Ctrl+Z)"
        />
        <ToolbarItem
          type="click"
          onAction={() => dispatch({ type: "redo" })}
          keyCode="KeyY"
          ctrlKey={true}
          icon="fa-rotate-right"
          hint="повторить (Ctrl+Y)"
        />
        <ToolbarItem
          type="click"
          onAction={() => dispatch({ type: "draw" })}
          icon="fa-paintbrush"
          isActive={surfaceState.isBrushActive}
          hint="кисть"
        />
        <ToolbarItem
          type="colorPicker"
          onAction={(data) => dispatch({ type: "brushColor", data })}
          icon="fa-palette"
          typeOptions={{ defaultValue: config.defaultBrushColor }}
          hint="цвет кисти"
        />
        <ToolbarItem
          type="click"
          onAction={() => dispatch({ type: "erase" })}
          icon="fa-eraser"
          isActive={!surfaceState.isBrushActive}
          hint="ластик"
        />
        <ToolbarItem
          type="range"
          onAction={(data) => dispatch({ type: "brushSize", data })}
          typeOptions={{ min: "1", max: "100", defaultValue: "1" }}
          modifierClasses={["toolbar__item_nohover"]}
          hint="размер кисти"
        />
        <ToolbarItem
          type="colorPicker"
          onAction={(data) => dispatch({ type: "backgroundColor", data })}
          icon="fa-fill"
          modifierClasses={["toolbar__item_bottom"]}
          typeOptions={{ defaultValue: config.defaultBackgroundColor }}
          hint="цвет фона"
        />
        <ToolbarItem
          type="click"
          onAction={() => {
            confirm("Вы уверены, что хотите очистить холст?") &&
              dispatch({ type: "requestClearCanvas" });
          }}
          icon="fa-trash"
          hint="стереть всё"
        />
      </Toolbar>
      <Surface state={surfaceState} dispatch={dispatch} />
    </div>
  );
}

export default App;
