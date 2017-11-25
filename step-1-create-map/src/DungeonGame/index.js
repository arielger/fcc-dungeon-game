import React, { Component } from "react";
import { random } from "lodash";
import DungeonGenerator from "random-dungeon-generator";
import "./index.css";

const DUNGEON_OPTIONS = {
  width: 40,
  height: 40,
  minRoomSize: 20,
  maxRoomSize: 40
};

const TILES = ["empty", "wall", "food", "enemy"];

const randomProbability = probability =>
  probability * 10000 >= random(0, 10000);

const mapOverMapCells = (dungeon, fn) =>
  dungeon.map(row => row.map(cell => fn(cell)));

const normalizeDungeon = dungeonMap =>
  mapOverMapCells(dungeonMap, cell => {
    if (cell === 0 || cell === 1) return cell;
    return 0;
  });

const addElementsToMap = dungeonMap =>
  mapOverMapCells(dungeonMap, cell => {
    if (cell === 1) return cell;

    if (randomProbability(0.01)) return 2;
    if (randomProbability(0.01)) return 3;
    return cell;
  });

class App extends Component {
  constructor() {
    super();

    const dungeon = addElementsToMap(
      normalizeDungeon(DungeonGenerator(DUNGEON_OPTIONS))
    );

    this.state = {
      dungeon
    };
  }
  render() {
    return (
      <div className="dungeon">
        {this.state.dungeon.map(row => (
          <div className="dungeon-row">
            {row.map(cell => <div className={`dungeon-cell ${TILES[cell]}`} />)}
          </div>
        ))}
      </div>
    );
  }
}

export default App;
