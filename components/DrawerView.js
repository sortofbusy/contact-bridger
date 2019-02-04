/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  Alert,
  AsyncStorage,
  Dimensions,
  StyleSheet,
  Text,
  Image,
  ListView,
  View,
  ViewPagerAndroid
} from 'react-native';

import { ActionButton, Avatar, Container, COLOR, Drawer, Toolbar } from 'react-native-material-ui';
import {GoogleSignin} from 'react-native-google-signin';

export default class DrawerView extends Component {
  
  constructor(props) {
    super(props);
    this.state = {
      accountToggle: false
    };
  }

  _accountTogglePress() {
    this.setState({accountToggle: !this.state.accountToggle});
  }

  _makeSureRevoke() {
    Alert.alert('Revoke Access and Delete Data', 'Are you sure you want to sign out and delete data? All information stored in the app will be deleted.',
      [{text: 'Cancel', style: 'cancel'},
      {text: 'REVOKE ACCESS', onPress: this._signOut.bind(this)}]);
  }

  _signOut() {
    GoogleSignin.revokeAccess()
    .then(() => {
      AsyncStorage.multiRemove(['user', 'contacts', 'driveResource'])
      .then(() => this.props._navCallback(null));
    })
    .catch((err) => {
      console.log('NOT SIGNED OUT', err);
    })
    .done();
  }
  
  render() {
    let accountToggleIcon = 'arrow-drop-down';
    if (this.state.accountToggle) accountToggleIcon = 'arrow-drop-up';
    return (
      <View style={{flex: 1}}>
      <Drawer>
        <Drawer.Header 
          image={<Image 
            source={require('../res/img/drawer.png')}
            style={{flex: 1}}
            resizeMode={'cover'}
            />} >
            <Drawer.Header.Account
                avatar={<Avatar image={<Image source={{uri: this.props.user.photo}} style={{width: 54, height: 54, borderRadius: 27}}/>} />}
                
                footer={{
                    dense: true,
                    centerElement: {
                        primaryText: this.props.user.name,
                        secondaryText: this.props.user.email,
                    },
                    rightElement: accountToggleIcon,
                    onRightElementPress: this._accountTogglePress.bind(this), 
                    onPress: this._accountTogglePress.bind(this)
                }}
            />
        </Drawer.Header>
        {this.state.accountToggle && <Drawer.Section
            title='Account'
            divider
            items={[
                { icon: 'remove-circle-outline', value: 'Sign Out and Delete Data', onPress: this._makeSureRevoke.bind(this) },
            ]}
        />}
        <Drawer.Section
            items={[
                { icon: 'info', value: 'Info', onPress: () => Alert.alert('Contacts', 'Version: 0.1')}
                //{ icon: 'settings', value: 'Settings' },
            ]}
        />
      </Drawer>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
        flex: 1,
        width: 260,
        elevation: 4,
        backgroundColor: 'white',
    },
});
