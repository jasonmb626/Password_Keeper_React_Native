import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { data } from '../db';
import Service from './Service';

const PasswordList = props => {
    return (
        <FlatList style={styles.container} data={data} renderItem={item=><Service service={item.service} />} />
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    }
});

export default PasswordList;