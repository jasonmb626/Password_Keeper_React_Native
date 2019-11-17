import React from 'React';
import { TouchableNativeFeedback, View, Text, StyleSheet, Clipboard } from 'react-native';
import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';

const Service = props => {
    return (
        <TouchableNativeFeedback onPress={()=>console.log(`detail ${props.id}`)}>
            <View style={styles.serviceContainer}>
                <Text style={styles.serviceTextBox}>{props.service}</Text>
                <View style={styles.copyIcons}>
                    <TouchableNativeFeedback onPress={() =>Clipboard.setString(`${props.username}`)}>
                        <AntDesign style={styles.copyIcon} name="user" size={24} />
                    </TouchableNativeFeedback>
                    <TouchableNativeFeedback onPress={() =>Clipboard.setString(`${props.password}`)}>
                        <MaterialCommunityIcons style={styles.copyIcon} name="textbox-password" size={24} />
                    </TouchableNativeFeedback>
                </View>
            </View>

        </TouchableNativeFeedback>
    )
}

const styles = StyleSheet.create({
    serviceContainer: {
        flexDirection: 'row',
        height: 50,
        borderBottomWidth: 1,
        borderBottomColor: 'black',
        justifyContent: 'space-between',
        alignItems: "center"
    },
    serviceTextBox: {
        marginLeft: 50
    },
    copyIcons: {
        flexDirection: 'row',
        marginRight: 50
    },
    copyIcon: {
        margin: 20
    }
});

export default Service;