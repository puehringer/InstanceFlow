import React from "react";
import "./SimpleBox.css";

function SimpleBox(props) {
  const {type, color, tooltipText, style, onMouseOver, onClick, onMouseOut, refCallback, opacity} = props;

  return <div
    data-tip={tooltipText}
    data-effect="solid"
    className={`box ${type}`}
    style={{
      ...style,
      "--box-color": color,
      opacity: opacity
    }}
    ref={refCallback}
    onMouseOver={e => onMouseOver && onMouseOver(e)}
    onClick={e => onClick && onClick(e)}
    onMouseOut={e => onMouseOut && onMouseOut(e)}
  />;
}

SimpleBox.defaultProps = {
  opacity: 1.0
};

export default SimpleBox;