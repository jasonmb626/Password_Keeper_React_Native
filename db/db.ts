import * as SQLite from 'expo-sqlite';
import "reflect-metadata";
import servicesJSON from '../passwords.json';
import CryptoJS from 'crypto-js';
import { IService } from '../context/services';
import {Current_User} from './Current_User';
import {Service} from './Service';
import { ConnectionOptions, createConnection } from "typeorm/browser";

const options: ConnectionOptions = {
  type: "expo",
  database: `password_keeper.db`,
  entities: [ Current_User, Service ],
  synchronize: true,
  logging: true
}

export const getLoginCredentialsFromDB = async () => {
  return createConnection(options).then(async connection => {
    const Current_User_Repository = connection.getRepository(Current_User);
    const current_user = Current_User_Repository.findOne();
    connection.close();
    return current_user;
  });
}

//Opens database. Does it not need to be explicity closed?
//const db = SQLite.openDatabase('password_keeper.db');

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
    return revisedService as Service;
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
  return createConnection(options).then(async connection => {
    const Current_User_Repository = connection.getRepository(Current_User);
    const user = await Current_User_Repository.create({email: username, password: password});
    const saved = await user.save();
    connection.close();
    return saved;
  });
};

//delete login credentials for current user from database. Note this table should always have either 
//0 rows: no currently authenticated user OR 
//1 row: currently authenticated user
export const clearLoginCredentialsFromDB = () => {
  return createConnection(options).then(async connection => {
    const Current_User_Repository = connection.getRepository(Current_User);
    const deleted = Current_User_Repository.delete({});
    connection.close();
    return deleted;
  });
};

//returns all services (service, password, username, notes etc) for specific user (usually currently logged in user)
export const getServicesForUserFromDB = (user: string) => {
  return createConnection(options).then(async connection => {
    const Service_Repository = connection.getRepository(Service);
    const services = Service_Repository.find({user});
    connection.close();
    return services;
  });
};

//Returns all services from DB. This is for debugging.
export const getServicesFromDB = () => {
  return createConnection(options).then(async connection => {
    const Service_Repository = connection.getRepository(Service);
    const services = Service_Repository.find();
    connection.close();
    return services;
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
  return createConnection(options).then(async connection => {
    const Service_Repository = connection.getRepository(Service);
    const deleted = Service_Repository.delete({});
    connection.close();
    return deleted;
  });
};

//Add a service to the DB.
export const addServiceToDB = (serviceData: Service) => {
  return createConnection(options).then(async connection => {
    const Service_Repository = connection.getRepository(Service);
    const newService = Service_Repository.create(serviceData);
    const saved = newService.save();
    connection.close();
    return saved;
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
