import foodImage from "./images/food.png";
import playerImage from "./images/player.png";
import tileImage from "./images/tile.png";
import enemiesImage from "./images/enemies.png";
import weaponsImage from "./images/weapons.png";

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
    life: 30,
    xp: 20,
    image: enemiesImage,
    backgroundPosition: "0 -160px"
  },
  {
    type: "enemy",
    name: "enemy2",
    damage: 20,
    life: 50,
    xp: 40,
    image: enemiesImage,
    backgroundPosition: "0 -288px"
  },
  {
    type: "enemy",
    name: "demon",
    damage: 30,
    life: 100,
    xp: 100,
    image: enemiesImage,
    backgroundPosition: "-160px -64px"
  },
  {
    type: "weapon",
    name: "weapon1",
    damage: 10,
    image: weaponsImage,
    backgroundPosition: "0 0"
  },
  {
    type: "weapon",
    name: "weapon2",
    damage: 30,
    image: weaponsImage,
    backgroundPosition: "0 -128px"
  },
  {
    type: "player",
    image: playerImage
  }
];

export default TILES;
