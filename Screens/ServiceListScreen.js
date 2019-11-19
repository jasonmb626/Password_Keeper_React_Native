import React, { useEffect } from 'react';
import { FlatList, StyleSheet, View, Text } from 'react-native';
import { HeaderButton, HeaderButtons, Item } from 'react-navigation-header-buttons';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import Service from '../Components/Service';
import { getServices } from '../store/actions/services';

const PasswordListScreen = props => {
    const dispatch = useDispatch();
    useEffect(()=> {
        dispatch(getServices());
    }, []);
    const data = useSelector(state=>state.services);
    return (
        <FlatList style={styles.container} keyExtractor={item => item.id.toString()} data={data} renderItem={item=>(<Service id={item.item.id} navigation={props.navigation} />)} />
    )
}

PasswordListScreen.navigationOptions = navData => {
    return {
        title: 'All Passwords',
        headerRight: () => (
            <HeaderButtons 
                HeaderButtonComponent={HeaderButton}
                OverflowIcon={<Ionicons name="md-more" size={23} />}>
                <Item title="add" IconComponent={Ionicons} iconSize={23} iconName="md-add-circle-outline" onPress={() => props.navData.navigation.navigate('AddEditService')} />
                <Item title="Change Password" IconComponent={Ionicons} iconSize={23} show={Item.SHOW_NEVER} onPress={() => alert('change password')} />
                <Item title="Logout" IconComponent={Ionicons} iconSize={23} show={Item.SHOW_NEVER} onPress={() => alert('logout')} />
            </HeaderButtons>)
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    }
});

export default PasswordListScreen;