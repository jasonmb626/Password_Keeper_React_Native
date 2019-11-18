import React from 'react';
import { StyleSheet } from 'react-native';
import { HeaderButtons, Item, HeaderButton } from 'react-navigation-header-buttons';

import { Ionicons } from '@expo/vector-icons';

const IoniconsHeaderButton = passMeFurther => (
    // the `passMeFurther` variable here contains props from <Item .../> as well as <HeaderButtons ... />
    // and it is important to pass those props to `HeaderButton`
    // then you may add some information like icon size or color (if you use icons)
    <HeaderButton {...passMeFurther} IconComponent={Ionicons} iconSize={23} />
  );

const HeaderRight = props => {
    return (
        <HeaderButtons 
            HeaderButtonComponent={IoniconsHeaderButton}
            OverflowIcon={<Ionicons name="md-more" size={23} />}>
            <Item title="add" iconName="md-add-circle-outline" onPress={() => alert('search')} />
            <Item title="Change Password" show={Item.SHOW_NEVER} onPress={() => alert('change password')} />
            <Item title="Logout" show={Item.SHOW_NEVER} onPress={() => alert('logout')} />
        </HeaderButtons>
    );
}

const styles = StyleSheet.create({
    headerButtons: {
      flexDirection: 'row',
      marginRight: 20
    },
    headerButton: {
      margin: 15
    }
  });
  
export default HeaderRight;