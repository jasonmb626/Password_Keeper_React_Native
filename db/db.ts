import "reflect-metadata";
import servicesJSON from '../passwords.json';
import CryptoJS from 'crypto-js';
import {Current_User_Model} from './Current_User';
import {ServiceModel} from './Service';
import { ConnectionOptions, createConnection } from "typeorm/browser";

/* Had to change a line in node_modules\typeorm\browser\driver\expo\ExpoDriver.js

from

this.sqlite = window.Expo.SQLite;

to

this.sqlite = require('expo-sqlite');

*/
const options: ConnectionOptions = {
  type: "expo",
  database: `password_keeper.db`,
  entities: [ Current_User_Model, ServiceModel ],
  synchronize: true,
  logging: false
}

export const getLoginCredentialsFromDB = async () => {
  return createConnection(options).then(async connection => {
    const Current_User_Repository = connection.getRepository(Current_User_Model);
    const current_user = Current_User_Repository.findOne();
    connection.close();
    return current_user;
  });
}

//Delete all services from DB and add all services from passwords.json
export const seedData = async () => {
  //this seems to auto convert the json to an array so we can map it directly.
  //revisedServices is the array of services (service, username, password, notes, etc) with fields encrypted with password.
  const revisedServices = servicesJSON.map(service => {
    const revisedService = {...service} as ServiceModel;
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
    return revisedService as ServiceModel;
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
    const Current_User_Repository = connection.getRepository(Current_User_Model);
    const user = Current_User_Repository.create({email: username, password: password});
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
    const Current_User_Repository = connection.getRepository(Current_User_Model);
    const deleted = Current_User_Repository.delete({});
    connection.close();
    return deleted;
  });
};

//returns all services (service, password, username, notes etc) for specific user (usually currently logged in user)
export const getServicesForUserFromDB = (user: string) => {
  return createConnection(options).then(async connection => {
    const Service_Repository = connection.getRepository(ServiceModel);
    const services = Service_Repository.find({user});
    connection.close();
    return services;
  });
};

//Returns all services from DB. This is for debugging.
export const getServicesFromDB = () => {
  return createConnection(options).then(async connection => {
    const Service_Repository = connection.getRepository(ServiceModel);
    const services = Service_Repository.find();
    connection.close();
    return services;
  });
};

//Change a service's data in the database
export const updateServiceToDB = (serviceData: ServiceModel) => {
  return createConnection(options).then(async connection => {
    const Service_Repository = connection.getRepository(ServiceModel);
    const foundService = await Service_Repository.findOne(serviceData.id);
    if (foundService) {
      const revised = Service_Repository.merge(foundService, serviceData);
      const saved = await revised.save();
      connection.close();
      return saved;
    }
  });
};

//Delete a service from the DB
export const deleteServiceFromDB = (serviceId: string) => {
  return createConnection(options).then(async connection => {
    const Service_Repository = connection.getRepository(ServiceModel);
    const service = await Service_Repository.findOne(serviceId);
    if (service) {
      const deleted = await Service_Repository.delete(service);
      connection.close();
      return deleted;
    }
  });
};

//Delete all services from DB. Used with the SeedData function to reinitialize all entries from a JSON file. Used ocasionally in debugging only.
export const deleteServicesFromDB = () => {
  return createConnection(options).then(async connection => {
    const Service_Repository = connection.getRepository(ServiceModel);
    const deleted = Service_Repository.delete({});
    connection.close();
    return deleted;
  });
};

//Add a service to the DB.
export const addServiceToDB = (serviceData: ServiceModel) => {
  return createConnection(options).then(async connection => {
    const Service_Repository = connection.getRepository(ServiceModel);
    const newService = Service_Repository.create(serviceData);
    const saved = await newService.save();
    connection.close();
    return saved;
  });
};

//This is the same as updateServiceToDB but is more descriptive of what it does.
export const reenctryptWithNewPasswordToDB = (serviceData: ServiceModel) => {
  return createConnection(options).then(async connection => {
    const Service_Repository = connection.getRepository(ServiceModel);
    const foundService = await Service_Repository.findOne(serviceData.id);
    if (foundService) {
      const revised = Service_Repository.merge(foundService, serviceData);
      const saved = await revised.save();
      connection.close();
      return saved;
    }
  });
};
