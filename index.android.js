/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AsyncStorage,
  AppRegistry,
  ActivityIndicator,
  StyleSheet,
  Text,
  Image,
  ListView,
  Navigator,
  NativeModules,
  ToastAndroid,
  View
} from 'react-native';

import Bugsnag from 'react-native-bugsnag';
import { Icon, Button, Divider, Checkbox, Toolbar } from 'react-native-material-design';
import { COLOR, ThemeProvider } from 'react-native-material-ui';

// you can set your style right here, it'll be propagated to application
const uiTheme = {
    palette: {
        //primaryColor: COLOR.green500,
    },
    /*toolbar: {
        container: {
            //height: 80,
        },
    },*/
};

import ImportView from './components/ImportView';
import LoadingView from './components/LoadingView';
import ContactView from './components/ContactView';
import EditContactView from './components/EditContactView';
import ContactListView from './components/ContactListView';
import SheetConfigView from './components/SheetConfigView';

const CONTACTS = 'contacts';
const CONTACT = 'contact';
const EDITCONTACT = 'editcontact';
const LOADING = 'loading';
const IMPORT = 'import';
const SHEETCONFIG = 'sheetconfig';

export default class Contacts extends Component {
  constructor(props) {
    super(props);
    let bugsnag = new Bugsnag({suppressDevErrors:false});
    
    this.state = {
      user: null,
      bugsnag: bugsnag,
      loading: true,
      contacts: null,
      driveResource: null,
      currentView: null,
      viewParams: null
    };
  }

  _navCallback(dest, viewParams = null) {
    this.setState({currentView: dest, viewParams: viewParams});
  }

  _handleLoadingView(user, contacts, driveResource) {
    this.setState({user: user, contacts: contacts || {}, driveResource: driveResource, loading: false, currentView: CONTACTS});
  }

  _handleUpdate(contacts) {
    AsyncStorage.mergeItem('contacts', JSON.stringify(contacts))
      .then( AsyncStorage.getItem('contacts', (err, result) => {
        if(err) console.log(err);
        else {
          this.setState({contacts: JSON.parse(result), currentView: CONTACTS});
          ToastAndroid.showWithGravity(`${Object.keys(contacts).length} contacts imported successfully.`, ToastAndroid.SHORT, ToastAndroid.CENTER);
        }
      })
    );
  }

  _handleSheetPicked(driveResource) {
    AsyncStorage.setItem('driveResource', JSON.stringify(driveResource));
    this.setState({driveResource: driveResource, currentView: SHEETCONFIG});
  }

  _handleSheetConfig(driveResource) {
    AsyncStorage.setItem('driveResource', JSON.stringify(driveResource))
    this.setState({driveResource: driveResource, currentView: IMPORT});
  }

  _editContact(contact) {
    let newContacts = this.state.contacts;
    newContacts[contact.id] = contact;
    AsyncStorage.setItem('contacts', JSON.stringify(newContacts));
    this.setState({contacts: newContacts, currentView: CONTACT, viewParams: contact});
  }

  _deleteContact(contactKey) {
    AsyncStorage.getItem('contacts', (err, result) => {
        if(err) console.log(err);
        else {
          let newContacts = JSON.parse(result);
          delete newContacts[contactKey];
          AsyncStorage.setItem('contacts', JSON.stringify(newContacts), () => {
            this.setState({contacts: newContacts});
          })
        }
      });
  }

  render() {
    if (!this.state.currentView || !this.state.user) return (
      <ThemeProvider uiTheme={uiTheme}>
        <LoadingView callback={this._handleLoadingView.bind(this)} bugsnag={this.state.bugsnag} loading={this.state.loading} />
      </ThemeProvider>
    );
    else return (
      <ThemeProvider uiTheme={uiTheme}>
        
        <View style={{flex: 1}}>
          {this.state.currentView === CONTACTS && 
            <ContactListView 
              contacts={this.state.contacts}
              user={this.state.user} 
              _deleteContact={this._deleteContact.bind(this)}
              _navCallback={this._navCallback.bind(this)} 
          />}
          {this.state.currentView === CONTACT && 
            <ContactView 
              contact={this.state.viewParams}
              _deleteContact={this._deleteContact.bind(this)}
              _navCallback={this._navCallback.bind(this)} 
          />}
          {this.state.currentView === EDITCONTACT && 
            <EditContactView 
              contact={this.state.viewParams}
              _editContact={this._editContact.bind(this)}
              _navCallback={this._navCallback.bind(this)} 
          />}
          {this.state.currentView === IMPORT && 
            <ImportView 
              user={this.state.user}
              driveResource={this.state.driveResource} 
              _handleUpdate={this._handleUpdate.bind(this)}
              _handleSheetPicked={this._handleSheetPicked.bind(this)}
              _navCallback={this._navCallback.bind(this)}
          />}
          {this.state.currentView === SHEETCONFIG && 
            <SheetConfigView 
              driveResource={this.state.driveResource} 
              _handleSheetConfig={this._handleSheetConfig.bind(this)}
              _navCallback={this._navCallback.bind(this)}
          />}
        </View>
      </ThemeProvider> 
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
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'left',
    color: '#333333',
    marginBottom: 5,
  },
  row: {
    flex: 1,
    margin: 5, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center'
  },
  headerRow: {
    height: 35,
    marginLeft: 25, 
    marginRight: 25, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center'
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 16
  },
  listBodyText: {
    fontSize: 14
  }
});

AppRegistry.registerComponent('Contacts', () => Contacts);
