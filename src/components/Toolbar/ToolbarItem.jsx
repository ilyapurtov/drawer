import { useState, useEffect } from "react";

export default function ToolbarItem({
  type,
  icon,
  onAction,
  isActive,
  setIsActive,
  keyCode = null,
  ctrlKey = false,
  hint = null,
  typeOptions = {},
  modifierClasses = [],
}) {
  const [hintVisible, setHintVisible] = useState(false);

  let itemClasses = "toolbar__item " + modifierClasses.join(" ");
  if (isActive === true) {
    itemClasses += " " + "active";
  }

  useEffect(() => {
    if (keyCode != null) {
      const onKeyPress = (e) => {
        if (e.code == keyCode && e.ctrlKey == ctrlKey) {
          onAction();
        }
      };
      document.addEventListener("keypress", onKeyPress);
      return () => {
        document.removeEventListener("keypress", onKeyPress);
      };
    }
  }, [onAction]);

  let itemJsx;
  switch (type) {
    case "logo":
      itemJsx = (
        <div
          className={itemClasses}
          onMouseEnter={() => setHintVisible(true)}
          onMouseLeave={() => setHintVisible(false)}
        >
          <img src={icon} alt="React" width="24" />
          {hint != null && hintVisible && (
            <div className="toolbar__hint">{hint}</div>
          )}
        </div>
      );
      break;
    case "colorPicker":
      itemJsx = (
        <button
          className={itemClasses}
          onMouseEnter={() => setHintVisible(true)}
          onMouseLeave={() => setHintVisible(false)}
          onClick={(e) => {
            if (e.currentTarget.classList.contains("toolbar__item")) {
              e.currentTarget.querySelector(".toolbar__color-picker").click();
            }
          }}
        >
          <i className={"fa-solid " + icon}></i>
          <input
            type="color"
            className="toolbar__color-picker"
            defaultValue={typeOptions.defaultValue}
            onChange={(e) => {
              onAction(e.target.value);
            }}
          />
          {hint != null && hintVisible && (
            <div className="toolbar__hint">{hint}</div>
          )}
        </button>
      );
      break;
    case "range":
      itemJsx = (
        <button
          className={itemClasses}
          onMouseEnter={() => setHintVisible(true)}
          onMouseLeave={() => setHintVisible(false)}
        >
          <input
            type="range"
            min={typeOptions.min}
            max={typeOptions.max}
            defaultValue={typeOptions.defaultValue}
            onChange={(e) => onAction(e.target.value)}
          />
          {hint != null && hintVisible && (
            <div className="toolbar__hint">{hint}</div>
          )}
        </button>
      );
      break;
    default:
      itemJsx = (
        <button
          className={itemClasses}
          onMouseEnter={() => setHintVisible(true)}
          onMouseLeave={() => setHintVisible(false)}
          onClick={onAction}
        >
          <i className={"fa-solid " + icon}></i>
          {hint != null && hintVisible && (
            <div className="toolbar__hint">{hint}</div>
          )}
        </button>
      );
      break;
  }

  return itemJsx;
}
