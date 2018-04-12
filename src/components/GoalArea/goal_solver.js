/*
[0]
[1]  [5]
[2][3][4]
*/

// cubes: Array<Cube | 0>, len 6
const goal_solver = cubes => {
  let goal = 0;
  let isValid = isValidStructure(cubes);
  if (!isValid) {
    return false;
  }
  for (var i = 0; i < cubes.length; i++) {
    let cube = cubes[i];
    if (cube !== 0) {
      let value = parseInt(cube.value);
      if (cube.inverted) value = value * -1;
      if (i < 3) {
        if (goal === 0) {
          goal = value;
        } else {
          goal = goal * value;
        }
      } else if (i === 3 || i === 4) {
        goal = goal + value;
      } else if (i === 5) {
        goal = goal * value;
      }
    }
  }
  return goal;
};

const isValidStructure = cubes => {
  let flatRep = [];
  for (var i = 0; i < cubes.length; i++) {
    if (cubes[i]) {
      flatRep.push(i);
    }
  }
  flatRep = flatRep.join("");
  if (flatRep.length === 1) return true;
  if (flatRep.length === 3) {
    return ["012", "234", "345", "123"].includes(flatRep);
  }
  if (flatRep.length === 2) {
    return ["01", "12", "23", "34"].includes(flatRep);
  }
  return false;
};

export default goal_solver;
