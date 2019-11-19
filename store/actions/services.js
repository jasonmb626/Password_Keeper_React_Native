import { updateServiceToDB, getServicesFromDB, addServiceToDB } from '../../db';
import uuid from 'uuid';

export const ADD_SERVICE = 'ADD_SERVICE';
export const UPDATE_SERVICE = 'UPDATE_SERVICE';
export const GET_SERVICES = 'GET_SERVICES';
export const DELETE_SERVICE = 'DELETE_SERVICE';

export const addUpdateService = serviceData => async dispatch => {
    if (serviceData.id) {
        try {
            await updateServiceToDB(serviceData);
            dispatch ({
                type: UPDATE_SERVICE,
                payload: serviceData
            });
        } catch (err) {
            console.log("Error");
            console.error(err);
        }
    } else {
        serviceData.id = uuid();
        try {
            await addServiceToDB(serviceData);
            dispatch ({
                type: ADD_SERVICE,
                payload: serviceData
            });
        } catch (err) {
            console.log("Error");
            console.error(err);
        }
    }
}

export const deleteService = serviceId => async dispatch => {
    try {
        await deleteServiceFromDB(serviceId);
        dispatch ({
            type: DELETE_SERVICE,
            payload: serviceId
        });
    } catch (err) {
        console.log("Error");
        console.error(err);
    }
}

export const getServices = () => async dispatch => {
    const data = await getServicesFromDB();
    dispatch ({
        type: GET_SERVICES,
        payload: data._array
    });
}