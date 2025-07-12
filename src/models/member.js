const { connectDB, disconnectDB } = require('../utils/dbUtils');
const moment = require("moment-timezone");

const Member = {
  getAll: () => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query(
            'SELECT ' +
            'id AS member_id, ' +
            'name AS member_name, ' +
            'phone_number AS member_phone_number, ' +
            'email AS member_email, ' +
            'points AS member_points, ' +
            'updated_at ' +
            'FROM members ' +
            'WHERE deleted_at IS NULL',
            (error, results) => {
              disconnectDB(connection);
              if (error) {
                reject(error);
              } else {
                // Format tanggal
                const formattedResults = results.map(result => ({
                  member_id: result.member_id,
                  member_name: result.member_name,
                  member_phone_number: result.member_phone_number,
                  member_email: result.member_email,
                  member_points: result.member_points,
                  updated_at: result.updated_at
                    ? moment(result.updated_at).locale('id').format('YYYY-MM-DD HH:mm:ss')
                    : null
                }));

                resolve(formattedResults || null);
              }
            }
          );
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
  createMembersBonusPoint: (bonusPoint) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query("INSERT INTO members_settings SET ?", bonusPoint, (error, results) => {
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
  getAllMembersSettings: () => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query(
            `SELECT 
                    id, 
                    point_percentage, 
                    updated_at, 
                    updated_by 
                  FROM members_settings 
                  ORDER BY id DESC`, // You can modify the order as needed
            (error, results) => {
              disconnectDB(connection);
              if (error) {
                reject(error);
              } else {
                // Format the results, e.g., format the dates
                const formattedResults = results.map(result => ({
                  id: result.id,
                  point_percentage: result.point_percentage,
                  updated_at: result.updated_at
                    ? moment(result.updated_at).locale('id').format('YYYY-MM-DD HH:mm:ss')
                    : null,
                  updated_by: result.updated_by
                }));

                resolve(formattedResults || null);
              }
            }
          );
        })
        .catch((error) => reject(error));
    });
  },
  getMembersBonusPoint: () => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query(
            `SELECT 
              id, 
              point_percentage, 
              updated_at, 
              updated_by 
            FROM members_settings 
            ORDER BY id DESC 
            LIMIT 1`,
            (error, results) => {
              disconnectDB(connection);

              if (error) {
                reject(error);
              } else {
                // Jika tidak ada hasil, kembalikan default object
                const settingsData = results.length > 0
                  ? {
                    id: results[0].id,
                    point_percentage: results[0].point_percentage,
                    updated_at: moment(results[0].updated_at).locale('id').format("YYYY-MM-DD HH:mm:ss"),
                    updated_by: results[0].updated_by
                  }
                  : {
                    id: null,
                    point_percentage: 1,
                    updated_at: null,
                    updated_by: null
                  };

                resolve(settingsData);
              }
            }
          );
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