import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import DungeonGame from "./DungeonGame";
import registerServiceWorker from "./registerServiceWorker";

ReactDOM.render(<DungeonGame />, document.getElementById("root"));
registerServiceWorker();
