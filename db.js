import * as SQLite from "expo-sqlite";
import servicesJSON from "./passwords.json";
import uuid from "uuid";
import CryptoJS from "crypto-js";

const db = SQLite.openDatabase("password_keeper.db");

export const seedData = async () => {
  const revisedServices = servicesJSON.map(service => {
    const revisedService = service;
    const newPassword = "123456";
    revisedService.service = CryptoJS.AES.encrypt(
      service.service,
      newPassword
    ).toString();
    revisedService.username = CryptoJS.AES.encrypt(
      service.username,
      newPassword
    ).toString();
    revisedService.password = CryptoJS.AES.encrypt(
      service.password,
      newPassword
    ).toString();
    revisedService.notes = CryptoJS.AES.encrypt(
      service.notes,
      newPassword
    ).toString();
    return revisedService;
  });
  await deleteServicesFromDB();
  revisedServices.forEach(service => {
    addServiceToDB(service);
  });
};

export const initDB = async () => {
  const promise1 = new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS services (
            id TEXT NOT NULL PRIMARY KEY,
            user TEXT NOT NULL,
            service TEXT NOT NULL,
            username TEXT NOT NULL,
            password TEXT NOT NULL,
            notes TEXT
        )`,
        [],
        (_, result) => resolve(result),
        (_, err) => reject(err)
      );
    });
  });
  const promise2 = new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS current_user (
            email TEXT NOT NULL PRIMARY KEY,
            password TEXT NOT NULL
        )`,
        [],
        (_, result) => resolve(result),
        (_, err) => reject(err)
      );
    });
  });
  await Promise.all([promise1, promise2]);
  const allServices = await getServicesFromDB();
  console.log("Start list of full database service contents");
  console.log(allServices.rows._array);
  console.log("End list of full database service contents");
};

export const setLoginCredentialsToDB = async (username, password) => {
  await clearLoginCredentialsFromDB();
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO current_user (email, password) VALUES (?, ?)`,
        [username, password],
        (_, result) => {
          console.log(result);
          resolve(result.rows);
        },
        (_, err) => {
          reject(err);
        }
      );
    });
  });
};

export const getLoginCredentialsFromDB = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM current_user`,
        [],
        (_, result) => {
          resolve(result.rows._array[0]);
        },
        (_, err) => {
          reject(err);
        }
      );
    });
  });
};

export const clearLoginCredentialsFromDB = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `DELETE FROM current_user`,
        [],
        (_, result) => {
          resolve(result.rows);
        },
        (_, err) => {
          reject(err);
        }
      );
    });
  });
};

export const getServicesForUserFromDB = user => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM services WHERE user=?`,
        [user],
        (_, result) => {
          resolve(result.rows);
        },
        (_, err) => {
          reject(err);
        }
      );
    });
  });
};

export const getServicesFromDB = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM services`,
        [],
        (_, result) => {
          resolve(result);
        },
        (_, err) => {
          reject(err);
        }
      );
    });
  });
};

export const updateServiceToDB = serviceData => {
  const promise = new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `UPDATE services 
                SET service=?,
                username=?,
                password=?,
                notes=?
                WHERE id=?`,
        [
          serviceData.service,
          serviceData.username,
          serviceData.password,
          serviceData.notes,
          serviceData.id
        ],
        (SQL, result) => {
          resolve(result);
        },
        (_, err) => {
          reject(err);
        }
      );
    });
  });
};

export const deleteServiceFromDB = serviceId => {
  console.log(`Deleting ${serviceId}`);
  const promise = new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `DELETE FROM services WHERE id=?`,
        [serviceId],
        (TX, result) => {
          resolve(result);
        },
        (TX, err) => {
          reject(err);
        }
      );
    });
  });
};

export const deleteServicesFromDB = () => {
  const promise = new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `DELETE FROM services`,
        [],
        (TX, result) => {
          resolve(result);
        },
        (TX, err) => {
          reject(err);
        }
      );
    });
  });
};

export const addServiceToDB = serviceData => {
  const promise = new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO services (id, user, service, username, password, notes) 
            VALUES (?, ?, ?, ?, ?, ?) `,
        [
          serviceData.id,
          serviceData.user,
          serviceData.service,
          serviceData.username,
          serviceData.password,
          serviceData.notes
        ],
        (TX, result) => {
          resolve(result);
        },
        (TX, err) => {
          reject(err);
        }
      );
    });
  });
};

export const reenctryptWithNewPasswordToDB = serviceData => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `UPDATE services SET service=?, username=?, password=?, notes=?
        WHERE id=?`,
        [
          serviceData.service,
          serviceData.username,
          serviceData.password,
          serviceData.notes,
          serviceData.id
        ],
        (TX, result) => {
          resolve(result);
        },
        (TX, err) => {
          reject(err);
        }
      );
    });
  });
};

export default (state = initialState, action) => {
  switch (action.type) {
    case GET_SERVICES:
      return [...action.payload];
    case ADD_UPDATE_SERVICE:
      if (action.payload.id) {
        return state.map(service => {
          if (service.id === action.payload.id)
            return {
              id: action.payload.id,
              service: action.payload.service,
              username: action.payload.username,
              password: action.payload.password,
              notes: action.payload.notes
            };
          else return service;
        });
      } else {
        return [
          ...state,
          {
            id: uuid(),
            service: action.payload.service,
            username: action.payload.username,
            password: action.payload.password,
            notes: action.payload.notes
          }
        ];
      }
    default:
      return state;
  }
};
