const { connectDB, disconnectDB } = require('../utils/dbUtils');

const Member = {
  getAll: () => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query('SELECT id AS member_id, name AS member_name, phone_number AS member_phone_number, email AS member_email, points AS member_point FROM members WHERE deleted_at IS NULL', (error, results) => {
            disconnectDB(connection);
            if (error) {
              reject(error);
            } else {
              resolve(results || null);
            }
          });
        })
        .catch((error) => reject(error));
    });
  },

  create: (member) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query("INSERT INTO members SET ?", member, (error, results) => {
            disconnectDB(connection);
            if (error) {
              reject(error);
            } else {
              resolve(results);
            }
          });
        })
        .catch((error) => reject(error));
    });
  },

  update: (id, member) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query("UPDATE members SET ? WHERE id = ?", [member, id], (error, results) => {
            disconnectDB(connection);
            if (error) {
              reject(error);
            } else {
              resolve(results);
            }
          });
        })
        .catch((error) => reject(error));
    });
  },

  getById: (id) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query("SELECT * FROM members WHERE id = ? AND deleted_at IS NULL", [id], (error, results) => {
            disconnectDB(connection);
            if (error) {
              reject(error);
            } else {
              resolve(results[0] || null); // Return the first result or null if not found
            }
          });
        })
        .catch((error) => reject(error));
    });
  }
};

module.exports = Member;