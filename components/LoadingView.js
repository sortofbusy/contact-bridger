/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  ActivityIndicator,
  AsyncStorage,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  View
} from 'react-native';

import {GoogleSignin, GoogleSigninButton} from 'react-native-google-signin';
import { Button } from 'react-native-material-ui';
import Bugsnag from 'react-native-bugsnag';

export default class LoadingView extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      loading: true,
      error: null
    };
  }

  componentDidMount() {

    GoogleSignin.configure({
      scopes: ["https://www.googleapis.com/auth/spreadsheets", "https://www.googleapis.com/auth/drive", "https://www.googleapis.com/auth/drive.file"],
      offlineAccess: false
    })
    .then(() => {
      GoogleSignin.currentUserAsync().then((user) => {
        if (user === null) this.setState({loading: false});
        else {
          AsyncStorage.setItem('user', JSON.stringify(user))
            .then( () => {
              AsyncStorage.getItem('contacts', (err, contacts) => {
                if (contacts === null) {
                  AsyncStorage.setItem('contacts', JSON.stringify({})).done();
                }
                AsyncStorage.getItem('driveResource', (err, driveResource) => {
                  this.props.callback(user, JSON.parse(contacts), JSON.parse(driveResource));  
                });
              })
            }).done();
        }
      })
    })
    .catch(error => {
        console.error(error.message);
    })
    .done();
    
  }

  _signIn() {
    GoogleSignin.signIn()
    .then(() => {
      GoogleSignin.currentUserAsync().then((user) => {
        AsyncStorage.setItem('user', JSON.stringify(user))
        .then( () => {
          this.props.callback(user, null, null);
        });
      });
    })
    .catch((err) => {
      this.setState({error: err});
      console.log('WRONG SIGNIN', err);
    })
    .done();
  }

  _signOut() {
    GoogleSignin.signOut()
    .then(() => {
      this.setState({user: null});
    })
    .catch((err) => {
      console.log('NOT SIGNED OUT', err);
    })
    .done();
  }

  renderUserInfo() {
    return (
      <View style={{height: 70}}>
        <View style={styles.row}>
          <Text>
            Hi, {this.state.user.name}!
            <Text style={{color: 'blue'}} onPress={this._signOut.bind(this)}> SIGN OUT </Text>
          </Text>
          <Image source={{uri: this.state.user.photo}}
              style={{width: 40, height: 40, borderRadius: 20, paddingLeft: 30}} />
        </View>
      </View>
    );
  }

  render() {
    return (
        <View 
          style={styles.container}>
          
            <View style={{flex: 1, backgroundColor: '#BBDEFB'}}>
              <Image 
                source={require('../res/img/logo.png')}
                style={{flex: 1, marginTop: 100, width: Dimensions.get('window').width}} 
                resizeMode={'contain'}
              />
              {this.state.error && <Text>{JSON.stringify(this.state.error)}</Text>}
              {this.state.loading && <View style={{height: 48}}><ActivityIndicator size='large' /></View>}
              {!this.state.loading && 
                <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
                  <GoogleSigninButton
                    style={{width: 230, height: 48}}
                    size={GoogleSigninButton.Size.Standard}
                    color={GoogleSigninButton.Color.Dark}
                    onPress={this._signIn.bind(this)} />
                </View>
              }
              <Image 
                source={require('../res/img/filler.png')}
                style={{flex: 1, width: Dimensions.get('window').width}}
                resizeMode={'contain'}
              />
            </View>
        </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  image: {
    flex: 1,
    width: 300
  }
});