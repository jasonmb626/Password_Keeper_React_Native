import React from 'react';
import { FlatList, StyleSheet, View, Text } from 'react-native';
import { data } from '../db';
import Service from '../Components/Service';

const PasswordListScreen = props => {
    return (
        <FlatList style={styles.container} keyExtractor={item => item.id.toString()} data={data} renderItem={item=>(<Service id={item.item.id} service={item.item.service} username={item.item.username} password={item.item.password} />)} />
        )
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    }
});

export default PasswordListScreen;