import firebase from "firebase";

let google;
let github;
if (process.env.NODE_ENV === "test") {
  google = () => {};
  github = () => {};
} else {
  google = new firebase.auth.GoogleAuthProvider();
  github = new firebase.auth.GithubAuthProvider();
}

export const handleGoogleAuth = e => {
  e.preventDefault();
  return new Promise((resolve, reject) => {
    firebase
      .auth()
      .signInWithPopup(google)
      .then(result => {
        importUser(result.user);
        resolve(false);
      })
      .catch(err => {
        let alert = err.message.slice(0, 150);
        resolve(alert);
      });
  });
};
export const handleGithubAuth = e => {
  e.preventDefault();
  return new Promise((resolve, reject) => {
    firebase
      .auth()
      .signInWithPopup(github)
      .then(result => {
        importUser(result.user);
        resolve(false);
      })
      .catch(err => {
        let alert = err.message.slice(0, 150);
        resolve(alert);
      });
  });
};

export const importUser = user => {
  firebase.database().ref(`users/${user.uid}`).once("value", snapshot => {
    if (!snapshot.exists()) {
      makeNewUser(user);
    }
  });
};

export const createNewEmailUser = (email, pass) => {
  return new Promise((resolve, reject) => {
    firebase
      .auth()
      .createUserWithEmailAndPassword(email, pass)
      .then(user => {
        makeNewUser(user);
        resolve(false);
      })
      .catch(error => {
        let alert = error.message.slice(0, 150);
        resolve(alert);
      });
  });
};

export const emailLogIn = (email, pass) => {
  return new Promise((resolve, reject) => {
    firebase
      .auth()
      .signInWithEmailAndPassword(email, pass)
      .then(() => {
        resolve(false);
      })
      .catch(err => {
        resolve(err.message.slice(0, 150));
      });
  });
};

export const setDisplayName = displayName => {
  let user = firebase.auth().currentUser;
  user.updateProfile({ displayName: displayName });
  firebase
    .database()
    .ref(`users/${firebase.auth().currentUser.uid}`)
    .transaction(data => {
      console.log("setting dn", data);
      if (!data) data = {};
      data.display_name = displayName;
      return data;
    });
};
export const makeNewUser = user => {
  let newUser = {
    uid: user.uid,
    email: user.email,
    display_name: user.displayName,
    email_verified: user.emailVerified,
    joined: new Date().getTime()
  };
  firebase.database().ref(`users/${user.uid}`).transaction(data => {
    console.log("setting new user");
    return newUser;
  });
};
