// @flow

export const shuffleCards = (n: number) => {
  let combs = shuffleArray(getCombinations("rgby"));
  let cards = [];
  for (var i = 0; i < n; i++) {
    let card = { r: false, g: false, b: false, y: false };
    for (let color of combs[i]) {
      switch (color) {
        case "r":
          card.r = true;
          break;
        case "g":
          card.g = true;
          break;
        case "b":
          card.b = true;
          break;
        case "y":
          card.y = true;
          break;
        default:
          return;
      }
    }
    cards.push(card);
  }
  return cards;
};

export const rollCubes = (): Resources => {
  let cubes = {
    colors: [],
    operators: [],
    universe: [],
    numbers: []
  };
  for (var i = 0; i < 18; i++) {
    let cube = getRandomIntInclusive(1, 6);
    if (i < 8) {
      cubes.colors.push({
        index: i,
        value: chooseColor(cube),
        type: "colors"
      });
    } else if (i >= 8 && i < 12) {
      cubes.operators.push({
        index: i,
        value: chooseOperator(cube),
        type: "operators"
      });
    } else if (i >= 12 && i < 15) {
      cubes.universe.push({
        index: i,
        value: chooseUniverse(cube),
        type: "universe"
      });
    } else {
      cubes.numbers.push({
        index: i,
        value: chooseNumber(cube),
        type: "numbers"
      });
    }
  }

  return (cubes: any);
};

const chooseNumber = face => {
  let value = face;
  if (face === 6) value = 1;
  return value;
};

const chooseUniverse = cube => {
  switch (cube) {
    case 1:
      return "⊆";
    case 2:
      return "=";
    case 3:
      return "V";
    case 4:
      return "Λ";
    case 5:
      return "=";
    case 6:
      return "⊆";
    default:
      throw new Error("Invalid Universe Cube");
  }
};

const chooseOperator = cube => {
  switch (cube) {
    case 1:
      return "∪";
    case 2:
      return "∩";
    case 3:
      return "—";
    case 4:
      return "′";
    case 5:
      return "∪";
    case 6:
      return "∩";
    default:
      throw new Error("Invalid Operator");
  }
};

const chooseColor = (cube): Color => {
  switch (cube) {
    case 1:
      return "R";
    case 2:
      return "G";
    case 3:
      return "B";
    case 4:
      return "Y";
    case 5:
      return "R";
    case 6:
      return "B";
    default:
      throw new Error("Invalid Color");
  }
};
/**
 * Randomize array element order in-place.
 * Using Durstenfeld shuffle algorithm.
 */
const shuffleArray = array => {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
};

const getCombinations = chars => {
  var result = [];
  var f = function(prefix, chars) {
    for (var i = 0; i < chars.length; i++) {
      result.push(prefix + chars[i]);
      f(prefix + chars[i], chars.slice(i + 1));
    }
  };
  f("", chars);
  return result;
};

const getRandomIntInclusive = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
