import "reflect-metadata";
import servicesJSON from '../passwords.json';
import CryptoJS from 'crypto-js';
import {UserModel} from './User';
import {ServiceModel} from './Service';
import { ConnectionOptions, createConnection, Connection, Repository } from "typeorm";

export const dbSecret = '123456';
interface DB {
  Connection: Connection | null;
  UserRepository: Repository<UserModel> | null;
  ServiceRepository: Repository<ServiceModel> | null;
}
export const db: DB = {
  Connection: null,
  UserRepository: null,
  ServiceRepository: null
}

const options: ConnectionOptions = {
  type: "expo",
  database: `password_keeper.db`,
  entities: [ UserModel, ServiceModel ],
  synchronize: true,
  logging: true
}

export const establishDBConnection = () => new Promise<void>((resolve, reject) => {
  createConnection(options).then(conn => {
    db.Connection = conn;
    db.UserRepository = conn.getRepository(UserModel);
    db.ServiceRepository = conn.getRepository(ServiceModel);
    resolve();
  }).catch(err => {
    console.error(err);
    reject();
  })
});

export const printDB = async () => {
  if (db && db.Connection && db.UserRepository && db.ServiceRepository) {
    const users = await db.UserRepository.find();
    users.forEach(user => console.log(user));
    const services = await db.ServiceRepository.find({ relations: ["user"]});
    services.forEach(service => console.log(service));
    db.Connection.query('SELECT * FROM service_model').then(res => console.log(res));
  }
}

export const getUserFromDBFromEmail = async (email: string) => {
  if (db && db.Connection && db.UserRepository && db.ServiceRepository) {
    const userObj = await db.UserRepository.findOne({email});
    if (userObj) {
      const bytes = CryptoJS.AES.decrypt(userObj.password, dbSecret);
      userObj.password = bytes.toString(CryptoJS.enc.Utf8);
    }
    return userObj;
  }
}

export const registerUserToDB = async (newUser: UserModel) => {
  if (db && db.Connection && db.UserRepository && db.ServiceRepository) {
    await logoutAllUsersFromDB();
    newUser.loggedIn = true;
    const newUserObj = db.UserRepository.create(newUser);
    const saved = newUserObj.save();
    return saved;
  }
}

export const logoutAllUsersFromDB = async () => {
  if (db && db.Connection && db.UserRepository && db.ServiceRepository) {
    try {
      const users = await db.UserRepository.find();
      users.forEach(async user => {
        user.loggedIn = false;
        await user.save();
      });
    } catch (err) {
      console.log ('no users or user error');
      //probably no users...do nothing
    }
  }
}

export const setUserLoggedInToDB = async (userId: string) => {
  if (db && db.Connection && db.UserRepository && db.ServiceRepository) {
    await logoutAllUsersFromDB();
    const user = await db.UserRepository.findOne(userId);
    let saved = null;
    if (user) {
      user.loggedIn = true;
      const newUserObj = db.UserRepository.create(user);
      saved = await newUserObj.save();
    }
    return saved;
  }
}

export const getLoggedInUserFromDB = async () => {
  if (db && db.Connection && db.UserRepository && db.ServiceRepository) {
    const current_user = await db.UserRepository.findOne({loggedIn: true});
    if (current_user) {
      const bytes = CryptoJS.AES.decrypt(current_user.password, dbSecret);
      current_user.password = bytes.toString(CryptoJS.enc.Utf8);
    }
    return current_user;
  }
}

//Delete all services from DB and add all services from passwords.json
export const seedData = () => new Promise(async (resolve, reject) => {
  //this seems to auto convert the json to an array so we can map it directly.
  //revisedServices is the array of services (service, username, password, notes, etc) with fields encrypted with password.
  if (db && db.Connection && db.UserRepository && db.ServiceRepository) {
    const users = await db.UserRepository.find();
    users.forEach(async user => {
      try {
        await db.UserRepository!.delete(user);
      } catch (err) {
        console.error(err);
      }
    });
    const newUser = new UserModel();
    newUser.email = 'jason@jasonbrunelle.com';
    newUser.password = CryptoJS.AES.encrypt('123456', dbSecret).toString();
    const addedUser = await registerUserToDB(newUser);
    if (addedUser) {
      const revisedServices = servicesJSON.map(service => {
        const revisedService = {...service} as unknown as ServiceModel;
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
      revisedServices.forEach(async service => {
        await addServiceToDB(service, addedUser.id);
      });
      console.log('Resolving seeded data');
      resolve();
    }
  }
  reject();
});

//returns all services (service, password, username, notes etc) for specific user (usually currently logged in user)
//this may be unecessary as the mapping should have put a services array on the user.
export const getServicesForUserFromDB = async (userId: string) => {
  if (db && db.Connection && db.UserRepository && db.ServiceRepository) {
    const foundUser = await db.UserRepository.findOne(userId);
    const services = db.ServiceRepository.find({user: foundUser});
    return services;
  }
};

//Returns all services from DB. This is for debugging.
export const getServicesFromDB = () => {
  if (db && db.Connection && db.UserRepository && db.ServiceRepository) {
    const services = db.ServiceRepository.find();
    return services;
  }
};

//Change a service's data in the database
export const updateServiceToDB = async (serviceData: ServiceModel) => {
  if (db && db.Connection && db.UserRepository && db.ServiceRepository) {
    const foundService = await db.ServiceRepository.findOne(serviceData.id);
    if (foundService) {
      const revised = db.ServiceRepository.merge(foundService, serviceData);
      const saved = await revised.save();
      return saved;
    }
  }
};

//Delete a service from the DB
export const deleteServiceFromDB = (serviceId: string) => new Promise(async (resolve, reject)=> {
  if (db && db.Connection && db.UserRepository && db.ServiceRepository) {
    const service = await db.ServiceRepository.findOne(serviceId);
    if (service) {
      const deleted = await db.ServiceRepository.delete(service);
      resolve(deleted);
    }
  }
  reject();
});

//Delete all services from DB. Used with the SeedData function to reinitialize all entries from a JSON file. Used ocasionally in debugging only.
export const deleteServicesFromDB = () => new Promise((resolve, reject) => {
  if (db && db.Connection && db.UserRepository && db.ServiceRepository) {
    const deleted = db.ServiceRepository.delete({});
    resolve(deleted);
  }
  reject();
});

//Add a service to the DB.
export const addServiceToDB = (serviceData: ServiceModel, userId: string) => new Promise(async (resovle, reject) => {
  if (db && db.Connection && db.UserRepository && db.ServiceRepository) {
    const user = await db.UserRepository.findOne(userId);
    if (user) {
      const newService = db.ServiceRepository.create(serviceData);
      await db.Connection.manager.save(newService);
      user.services = [newService];
      await db.Connection.manager.save(user);
      resovle();
    }
  }
  reject();
});

//This is the same as updateServiceToDB but is more descriptive of what it does.
export const reenctryptWithNewPasswordToDB = async (serviceData: ServiceModel) => {
  if (db && db.Connection && db.UserRepository && db.ServiceRepository) {
    const foundService = await db.ServiceRepository.findOne(serviceData.id);
    if (foundService) {
      const revised = db.ServiceRepository.merge(foundService, serviceData);
      const saved = await revised.save();
      return saved;
    }
  }
};
