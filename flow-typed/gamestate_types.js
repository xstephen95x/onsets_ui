// @flow
//NOTE: These type declarations may differ from those used in the back-end repo

type GameState = {
  bot_first: boolean,
  cards?: Array<Card>,
  challenge?: Challenge,
  cubes?: Resources,
  currentPlayer?: number,
  forbidden?: Array<Cube>,
  goal?: Goal,
  goal_value?: number,
  log: Array<Move>,
  permitted?: Array<Cube>,
  players: Array<Player>,
  required?: Array<Cube>,
  scores?: Scores,
  solutions?: SolutionStrings,
  stage: Stage,
  stall: ?Stall,
  turn: number,
  universe?: number,
  uuid: string
};
type Scores = {
  [uid: string]: number
};

type GameStateOffline = {
  auth?: any,
  alert: ?string,
  cards?: Array<Card>,
  challenge?: Challenge,
  cubes?: Resources,
  currentPlayer?: number,
  forbidden: Array<Cube>,
  goal?: Goal,
  goal_value?: number,
  movingCube: ?Cube,
  permitted: Array<Cube>,
  required: Array<Cube>,
  stage: Stage,
  stall: Stall,
  turn: number,
  universe?: number,
  variations: Array<string>
};

// -------------- Firebase ---------------------------
type TransactionReceipt = Promise<{
  committed: boolean,
  snapshot: $npm$firebase$database$DataSnapshot | null
}>;
// -------------- Cubes -----------------
type Cube = ColorCube | OperatorCube | UniverseCube | NumberCube;

type NumberCubes = [NumberCube, NumberCube, NumberCube];
type OperatorCubes = [OperatorCube, OperatorCube, OperatorCube, OperatorCube];
type UniverseCubes = [UniverseCube, UniverseCube, UniverseCube];

type Color = "R" | "G" | "B" | "Y";
type ColorCube = {
  index: number,
  type: "colors",
  value: Color
};

type Operator = "′" | "∪" | "∩" | "—";
type OperatorCube = {
  index: number,
  type: "operators",
  value: Operator
};

type Universe = "⊆" | "=" | "V" | "Λ";
type UniverseCube = {
  index: number,
  type: "universe",
  value: Universe
};

//  [1,2,3,4,5]
type NumberCube = {
  index: number,
  type: "numbers",
  inverted?: boolean,
  value: number,
  wasUsed?: boolean
};

// ------- Cube Data Structures ---------------

type Resources = {
  colors: ColorCubes,
  numbers: NumberCubes,
  operators: OperatorCubes,
  universe: UniverseCubes
};

type ColorCubes = Array<ColorCube>;

type Goal = [
  0 | NumberCube,
  0 | NumberCube,
  0 | NumberCube,
  0 | NumberCube,
  0 | NumberCube,
  0 | NumberCube
];

// ------------ Other --------------------------

type Move = {
  area: BoardArea,
  cube: Cube
};

type BoardArea = "permitted" | "forbidden" | "required";

type Card = { r: boolean, g: boolean, b: boolean, y: boolean };

type Stage =
  | "new"
  | "pregame"
  | "universe"
  | "variations"
  | "goal"
  | "ingame"
  | "challenge"
  | "reveal"
  | "archived";

type Player = {
  name: string,
  uid: string
};

type Stall = {
  began: number,
  stalledIndex?: number
};
type Challenge = {
  caller_uid: string,
  began: number,
  now: Boolean,
  forceout: Boolean
};
type SolutionStrings = {
  [uid: string]: SolutionSubmission
};
type SolutionSubmission = {
  solution: string,
  restriction: string
};

// // ------------- Restrictions ------------------
// type Set1 = [SolutionNode, SolutionNode];
// type Set2 = [SolutionNode, SolutionNode, SolutionNode];
// type Set3 = [SolutionNode, SolutionNode, SolutionNode, SolutionNode];
//
// type Rest1 = [Rest];
// type Rest2 = [Rest, Rest];
// type Rest3 = [Rest, Rest, Rest];
// type Rest = "⊆" | "=";
//
// //NOTE: Set1 => Rest1
// //  Set2+Rest2 = 2-Chain restriction. I.e.  (set rest set rest set)
// type RestrictionStatement = {
//   sets: Set1 | Set2 | Set3,
//   rest: Rest1 | Rest2 | Rest3
// };
