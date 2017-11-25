import React, { Component } from "react";
import { sample, random, flatten } from "lodash";
import DungeonGenerator from "random-dungeon-generator";
import foodImage from "./images/food.png";
import playerImage from "./images/player.png";
import tileImage from "./images/tile.png";
import enemiesImage from "./images/enemies.png";
import "./index.css";

// Configuración inicial

// Parametros para la creación del mapa
const DUNGEON_WIDTH = 40;
const DUNGEON_HEIGHT = 40;
const DUNGEON_OPTIONS = {
  width: DUNGEON_WIDTH,
  height: DUNGEON_HEIGHT,
  minRoomSize: 20,
  maxRoomSize: 40
};

// Tipos de elementos del mapa
const TILES = [
  {
    type: "empty"
  },
  {
    type: "wall",
    image: tileImage,
    backgroundPosition: "-96px -64px"
  },
  {
    type: "food",
    name: "tomatoe",
    food: 10,
    image: foodImage,
    backgroundPosition: "0 -64px"
  },
  {
    type: "food",
    name: "carrot",
    food: 15,
    image: foodImage,
    backgroundPosition: "0 -96px"
  },
  {
    type: "food",
    name: "pack",
    food: 30,
    image: foodImage,
    backgroundPosition: "-64px -129px"
  },
  {
    type: "enemy",
    name: "enemy1",
    damage: 10,
    image: enemiesImage,
    backgroundPosition: "0 -160px"
  },
  {
    type: "enemy",
    name: "enemy2",
    damage: 20,
    image: enemiesImage,
    backgroundPosition: "0 -288px"
  },
  {
    type: "enemy",
    name: "demon",
    damage: 30,
    image: enemiesImage,
    backgroundPosition: "-160px -64px"
  },
  {
    type: "player",
    image: playerImage
  }
];

const MOVES_LIST = [
  {
    code: 37,
    positionFunc: pos => [pos[0], pos[1] - 1]
  },
  {
    code: 38,
    positionFunc: pos => [pos[0] - 1, pos[1]]
  },
  {
    code: 39,
    positionFunc: pos => [pos[0], pos[1] + 1]
  },
  {
    code: 40,
    positionFunc: pos => [pos[0] + 1, pos[1]]
  }
];

const randomProbability = probability =>
  probability * 10000 >= random(0, 10000);

// Recibe el mapa del juego y devuelve el resultado de ejecutar la función fn
// por cada una de las celdas
const mapOverMapCells = (dungeon, fn) =>
  dungeon.map((row, rowIndex) =>
    row.map((cell, cellIndex) => fn(cell, rowIndex, cellIndex))
  );

// Función de utilidad para normalizar el mapa generado (solo utilizar 0s y 1s)
const normalizeDungeon = dungeonMap =>
  mapOverMapCells(
    dungeonMap,
    cell =>
      cell === 1
        ? TILES.find(t => t.type === "wall")
        : TILES.find(t => t.type === "empty")
  );

// Agrega los enemigos, armas y vidas en el mapa
const addElementsToMap = (dungeonMap, playerPosition) =>
  mapOverMapCells(dungeonMap, (cell, rowIndex, cellIndex) => {
    if (cell.type === "wall") return cell;
    if (playerPosition[0] === rowIndex && playerPosition[1] === cellIndex)
      return TILES.find(t => t.type === "player");

    if (randomProbability(0.01)) {
      return sample(TILES.filter(t => t.type === "food"));
    }

    if (randomProbability(0.01)) {
      return sample(TILES.filter(t => t.type === "enemy"));
    }
    return cell;
  });

const findFirstEmptyPosition = dungeonMap => {
  const flattedMap = flatten(dungeonMap);
  const firstEmptyPosition = flattedMap.findIndex(
    cell => cell.type === "empty"
  );
  const selectedRow = Math.floor(firstEmptyPosition / DUNGEON_WIDTH);
  const selectedColumn = firstEmptyPosition % DUNGEON_WIDTH;

  return [selectedRow, selectedColumn];
};

class Dungeon extends Component {
  constructor() {
    super();

    const emptyDungeon = normalizeDungeon(DungeonGenerator(DUNGEON_OPTIONS));

    const initialPlayerPosition = findFirstEmptyPosition(emptyDungeon);
    const dungeonWithElements = addElementsToMap(
      emptyDungeon,
      initialPlayerPosition
    );

    // Inicializamos el state del componente con el mapa que acabamos de crear
    // y los distintos atributos del jugador (posición, vida, nivel y ataque)
    this.state = {
      dungeon: dungeonWithElements,
      playerPosition: initialPlayerPosition,
      playerLife: 100,
      playerLevel: 0,
      playerAttack: 1
    };

    // Bindeamos las funciónes al componente
    // Más info: http://reactkungfu.com/2015/07/why-and-how-to-bind-methods-in-your-react-component-classes/
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handlePlayerMovement = this.handlePlayerMovement.bind(this);
    this.movePlayer = this.movePlayer.bind(this);
  }
  movePlayer(dungeon, playerPosition, movedPosition) {
    return mapOverMapCells(dungeon, (cell, rowIndex, cellIndex) => {
      if (rowIndex === playerPosition[0] && cellIndex === playerPosition[1])
        return TILES.find(t => t.type === "empty");
      if (rowIndex === movedPosition[0] && cellIndex === movedPosition[1])
        return TILES.find(t => t.type === "player");
      return cell;
    });
  }
  handleKeyDown(event) {
    const keyCode = event.keyCode;
    const currentMove = MOVES_LIST.find(m => m.code === keyCode);
    if (!currentMove) return;

    this.handlePlayerMovement(
      currentMove.positionFunc(this.state.playerPosition)
    );
  }
  handlePlayerMovement(movedPosition) {
    // Revisar que hay en la posición a la cual buscamos movernos (Comida, arma, enemigo)
    // En base a esto ejecutar distintas acciones
    const cellTypeToMove = this.state.dungeon[movedPosition[0]][
      movedPosition[1]
    ].type;

    // Si es posible (no hay un mounstruo) movemos al personaje a la proxima posición
    if (cellTypeToMove !== "enemy" && cellTypeToMove !== "wall") {
      this.setState(oldState => ({
        playerPosition: movedPosition,
        dungeon: this.movePlayer(
          oldState.dungeon,
          oldState.playerPosition,
          movedPosition
        )
      }));
    }
  }
  render() {
    return (
      <div className="dungeon" onKeyDown={this.handleKeyDown} tabIndex="1">
        {this.state.dungeon.map(row => (
          <div className="dungeon-row">
            {row.map(cell => (
              <div
                style={{
                  backgroundImage: `url('${cell.image}')`,
                  backgroundPosition: cell.backgroundPosition
                }}
                className={`dungeon-cell ${cell.type} ${
                  cell.name ? cell.name : ""
                }`}
              />
            ))}
          </div>
        ))}
      </div>
    );
  }
}

export default Dungeon;
