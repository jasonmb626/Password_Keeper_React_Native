import * as SQLite from 'expo-sqlite';
import servicesJSON from './passwords.json';
import CryptoJS from 'crypto-js';
import { IService } from './context/services';
import { CurrentUser } from './context/auth';

//Opens database. Does it not need to be explicity closed?
const db = SQLite.openDatabase('password_keeper.db');

//Create the tables if they don't exist. Note that if they do exist it doesn't delete or modify them, but it also resolves true/no error.
export const initDB = async () => {
  const promise1 = new Promise<SQLResultSet | SQLError>((resolve, reject) => {
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
        (_, err) => {
          reject(err);
          return false;
        }
      );
    });
  });
  const promise2 = new Promise<SQLResultSet | SQLError>((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS current_user (
            email TEXT NOT NULL PRIMARY KEY,
            password TEXT NOT NULL
        )`,
        [],
        (_, result) => resolve(result),
        (_, err) => {
          reject(err);
          return false;
        }
      );
    });
  });
  await Promise.all([promise1, promise2]);
  const allServices = await getServicesFromDB();
  //  console.log('Start list of full database service contents');
  //  console.log(JSON.stringify(allServices));
  //  console.log('End list of full database service contents');
};

//Delete all services from DB and add all services from passwords.json
export const seedData = async () => {
  //this seems to auto convert the json to an array so we can map it directly.
  //revisedServices is the array of services (service, username, password, notes, etc) with fields encrypted with password.
  const revisedServices = servicesJSON.map(service => {
    const revisedService = {...service};
    const newPassword = '123456';
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

//Store username/password as single entry in database. This is the currently logged in user for which fingerprint authentication will let bypass logging in manually.
export const setLoginCredentialsToDB = async (
  username: string,
  password: string
) => {
  await clearLoginCredentialsFromDB();
  return new Promise<number | SQLError>((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO current_user (email, password) VALUES (?, ?)`,
        [username, password],
        (_, result) => {
          resolve(result.insertId);
        },
        (_, err) => {
          reject(err);
          return false;
        }
      );
    });
  });
};

//return login credentials (if they exist) from the database for fingerprint authentication to let bypass manual login.
export const getLoginCredentialsFromDB = async () => {
  return new Promise<CurrentUser | SQLError>((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM current_user`,
        [],
        (_, result) => {
          resolve(result.rows.item(0));
        },
        (_, err) => {
          reject(err);
          return false;
        }
      );
    });
  });
};

//delete login credentials for current user from database. Note this table should always have either 
//0 rows: no currently authenticated user OR 
//1 row: currently authenticated user
export const clearLoginCredentialsFromDB = () => {
  return new Promise<SQLResultSetRowList | SQLError>((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `DELETE FROM current_user`,
        [],
        (_, result) => {
          resolve(result.rows);
        },
        (_, err) => {
          reject(err);
          return false;
        }
      );
    });
  });
};

//returns all services (service, password, username, notes etc) for specific user (usually currently logged in user)
export const getServicesForUserFromDB = (user: string) => {
  return new Promise<IService[] | SQLError>((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM services WHERE user=?`,
        [user],
        (_, result) => {
          resolve(result.rows._array);
        },
        (_, err) => {
          reject(err);
          return false;
        }
      );
    });
  });
};

//Returns all services from DB. This is for debugging.
export const getServicesFromDB = () => {
  return new Promise<IService[]>((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM services`,
        [],
        (_, result) => {
          resolve(result.rows._array);
        },
        (_, err) => {
          reject(err);
          return false;
        }
      );
    });
  });
};

//Change a service's data in the database
export const updateServiceToDB = (serviceData: IService) => {
  return new Promise((resolve, reject) => {
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
          return false;
        }
      );
    });
  });
};

//Delete a service from the DB
export const deleteServiceFromDB = (serviceId: string) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `DELETE FROM services WHERE id=?`,
        [serviceId],
        (TX, result) => {
          resolve(result);
        },
        (TX, err) => {
          reject(err);
          return false;
        }
      );
    });
  });
};

//Delete all services from DB. Used with the SeedData function to reinitialize all entries from a JSON file. Used ocasionally in debugging only.
export const deleteServicesFromDB = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `DELETE FROM services`,
        [],
        (TX, result) => {
          resolve(result);
        },
        (TX, err) => {
          reject(err);
          return false;
        }
      );
    });
  });
};

//Add a service to the DB.
export const addServiceToDB = (serviceData: IService) => {
  return new Promise((resolve, reject) => {
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
          return false;
        }
      );
    });
  });
};

//This is the same as updateServiceToDB but is more descriptive of what it does.
export const reenctryptWithNewPasswordToDB = (serviceData: IService) => {
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
          return false;
        }
      );
    });
  });
};
