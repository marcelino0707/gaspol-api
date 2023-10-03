const { connectDB, disconnectDB } = require('../utils/dbUtils');

const Outlet = {
  getByOutletId: (outlet_id) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query('SELECT id, name, address, pin FROM outlets WHERE id = ?', outlet_id, (error, results) => {
            disconnectDB();
            if (error) {
              reject(error);
            } else {
              resolve(results[0] || null);
            }
          });
        })
        .catch((error) => reject(error));
    });
  },
};

module.exports = Outlet;