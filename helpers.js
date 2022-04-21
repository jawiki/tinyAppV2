// searches users by email
const searchUserByEmail = (users, email) => {
  for (const userId in users) {
    const user = users[userId];
    if (user.email === email) {
      return user;
    }
  }
  return null;
};

// generates random string of upper and lowercase letters
function generateRandomString() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
  let String = 5;
  let randomString = "";
  for (let i = 0; i < String; i++) {
    num = Math.floor(Math.random() * letters.length);
    randomString += letters.substring(num, num + 1);
  }
  return randomString;
}
module.exports = { generateRandomString, searchUserByEmail };
