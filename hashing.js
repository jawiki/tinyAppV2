const bcrypt = require("bcryptjs");

const database = {
  abcd: {
    email: "wow.com",
    passsword: hash,
  },
};

const plainTextPassword = "password";

bcrypt.genSalt(10, (err, salt) => {
  //async
  console.log("salt:", salt);
  bcrypt.hash(plainTextPassword, salt, (err, hash));
  {
    console.log("hash", hash);
    const newUser = {
      email: "wow.com",
      password: hash,
    };
    database["efgh"] = newUser;

    console.log(database);
  }
});

const salt = bcrypt.genSaltSync(10); //syncronous
const hash = bcrypt.hashSync(plainTextPassword, salt);
console.log("sync salt:", salt);
console.log("sync hash:", salt);

bcrypt.compare("password", hash, (err, success) => {
  console.log("was this successfull:", success);
}); //compare method //async

const success = bcrypt.compareSync("password", hash);
console.log("sync compare:", success);
//compare method // sync
