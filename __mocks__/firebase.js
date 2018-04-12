const firebase = jest.genMockFromModule("firebase");

let data = { game: {}, auth: {} };

const setMock = mocks => {
  data = mocks;
};
const database = () => {
  return {
    ref: path => {
      return {
        once: (type, cb) => {
          let snapshot = {
            exists: () => true,
            val: () => data.game
          };
          return cb(snapshot);
        },
        on: (type, cb) => {
          let snapshot = {
            exists: () => true,
            val: () => data.game
          };
          return cb(snapshot);
        },
        transaction: cb => {
          return cb();
        }
      };
    }
  };
};

const auth = () => {
  return {
    currentUser: { uid: data.auth },
    onAuthStateChanged: cb => cb(true)
  };
};

firebase.setMock = setMock;
firebase.auth = auth;
firebase.database = database;

export default firebase;
