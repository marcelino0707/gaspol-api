const { connectDB, disconnectDB } = require("../utils/dbUtils");

const User = {
  getByUsername: (username) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query(
            "SELECT id, username, password, role, outlet_id, menu_access FROM users WHERE username = ? AND deleted_at IS NULL",
            username,
            (error, results) => {
              disconnectDB();
              if (error) {
                reject(error);
              } else {
                resolve(results[0]);
              }
            }
          );
        })
        .catch((error) => reject(error));
    });
  },
};

module.exports = User;
