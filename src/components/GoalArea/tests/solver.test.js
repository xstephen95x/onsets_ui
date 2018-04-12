import goal_solver from "../goal_solver";

// [0]
// [1]  [5]
// [2][3][4]

let goal = [0, 0, 0, 0, 0, 0];
describe("goal_solver", () => {
  afterEach(() => {
    goal = [0, 0, 0, 0, 0, 0];
  });
  it("gets the goal from a single cube", () => {
    goal[2] = { index: 0, type: "number", value: "5" };
    expect(goal_solver(goal)).toEqual(5);
  });
  it("multiplies 2 cubes that are vertical", () => {
    goal[1] = { index: 0, type: "number", value: "3" };
    goal[2] = { index: 8, type: "number", value: "2" };
    expect(goal_solver(goal)).toEqual(6);
  });
  it("multiplies 3 cubes that are vertical", () => {
    goal[0] = { index: 4, type: "number", value: "2" };
    goal[1] = { index: 0, type: "number", value: "3" };
    goal[2] = { index: 8, type: "number", value: "4" };
    expect(goal_solver(goal)).toEqual(24);
  });
  it("multiplies with 1 negative correctly", () => {
    goal[1] = { index: 0, type: "number", value: "1", inverted: true };
    goal[2] = { index: 8, type: "number", value: "4" };
    expect(goal_solver(goal)).toEqual(-4);
  });
  it("adds horiztonally", () => {
    goal[2] = { index: 8, type: "number", value: "1" };
    goal[3] = { index: 9, type: "number", value: "3" };
    goal[4] = { index: 7, type: "number", value: "2" };
    expect(goal_solver(goal)).toEqual(6);
  });
  it("handles a(b+c) triangle structure", () => {
    goal[3] = { index: 9, type: "number", value: "1" };
    goal[4] = { index: 7, type: "number", value: "3" };
    goal[5] = { index: 8, type: "number", value: "2" };
    expect(goal_solver(goal)).toEqual(8);
  });
  it("handles (a*b)+c L structure", () => {
    goal[1] = { index: 9, type: "number", value: "1" };
    goal[2] = { index: 7, type: "number", value: "3" };
    goal[3] = { index: 8, type: "number", value: "2" };
    expect(goal_solver(goal)).toEqual(5);
  });
  it("doesn't solve an invalid structure", () => {
    goal[0] = { index: 8, type: "number", value: "2" };
    goal[3] = { index: 8, type: "number", value: "2" };
    goal[5] = { index: 8, type: "number", value: "2" };
    expect(goal_solver(goal)).toEqual(false);
  });
});
