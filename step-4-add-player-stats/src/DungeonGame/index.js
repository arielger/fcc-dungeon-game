import React, { Component } from "react";
import { sample, random, flatten } from "lodash";
import DungeonGenerator from "random-dungeon-generator";
import PlayerStats from "../PlayerStats";
import TILES from "./tiles";
import "./index.css";

// Configuración inicial
const MAX_LIFE = 100;
const INITIAL_ATACK = 10;

// Parametros para la creación del mapa
const DUNGEON_WIDTH = 40;
const DUNGEON_HEIGHT = 40;
const DUNGEON_OPTIONS = {
  width: DUNGEON_WIDTH,
  height: DUNGEON_HEIGHT,
  minRoomSize: 20,
  maxRoomSize: 40
};

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

    if (randomProbability(0.005)) {
      return sample(TILES.filter(t => t.type === "weapon"));
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
      playerLife: MAX_LIFE,
      playerAttack: INITIAL_ATACK,
      playerExperience: 0,
      playerLevel: 0
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
    const cellToMove = this.state.dungeon[movedPosition[0]][movedPosition[1]];

    if (cellToMove.type === "wall") return;

    if (cellToMove.type === "food") {
      this.setState(oldState => ({
        playerLife:
          cellToMove.food + oldState.playerLife > MAX_LIFE
            ? MAX_LIFE
            : cellToMove.food + oldState.playerLife
      }));
    }

    if (cellToMove.type === "weapon") {
      this.setState({
        playerAttack: cellToMove.damage
      });
    }

    if (cellToMove.type === "enemy") {
      const isPlayerMove = sample([true, false]);

      if (isPlayerMove) {
        // Resto a la vida del enemigo el ataque del personaje
        // Si la vida es <= 0 entonces elimino al personaje, sumo la xp correspondiente y muevo al personaje
        // Si la vida es > 0 entonces no hago nada
        const monsterLifeAfterAttack =
          cellToMove.life - this.state.playerAttack;
        const isMonsterDead = monsterLifeAfterAttack <= 0;

        this.setState(oldState => ({
          playerExperience: isMonsterDead
            ? oldState.playerExperience + cellToMove.xp
            : oldState.playerExperience,
          dungeon: isMonsterDead
            ? oldState.dungeon
            : mapOverMapCells(oldState.dungeon, (cell, rowIndex, cellIndex) => {
                if (
                  rowIndex === movedPosition[0] &&
                  cellIndex === movedPosition[1]
                ) {
                  return Object.assign({}, cell, {
                    life: monsterLifeAfterAttack
                  });
                }
                return cell;
              })
        }));

        if (!isMonsterDead) return;
      } else {
        const playerLife = this.state.playerLife - cellToMove.damage;
        const isPlayerDead = playerLife <= 0;

        if (isPlayerDead) return alert("Perdiste!");

        return this.setState(oldState => ({ playerLife }));
      }
    }

    // Mover al jugador a la posición deseada
    this.setState(oldState => ({
      playerPosition: movedPosition,
      dungeon: this.movePlayer(
        oldState.dungeon,
        oldState.playerPosition,
        movedPosition
      )
    }));
  }
  render() {
    return (
      <div className="dungeon">
        <PlayerStats
          life={this.state.playerLife}
          experience={this.state.playerExperience / 200 * 100}
          level={this.state.playerLevel}
        />
        <div
          className="dungeon-game"
          onKeyDown={this.handleKeyDown}
          tabIndex="1"
        >
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
      </div>
    );
  }
}

export default Dungeon;
