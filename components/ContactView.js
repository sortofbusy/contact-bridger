/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  Alert,
  BackAndroid,
  Linking,
  StyleSheet,
  Text,
  Image,
  TextInput,
  ToastAndroid,
  View
} from 'react-native';

import { ActionButton, Avatar, Card, Container, COLOR, ListItem, Toolbar } from 'react-native-material-ui';
import {GoogleDrivePicker} from 'react-native-google-drive-picker';

export default class ContactView extends Component {
  constructor(props) {
    super(props);  
    this.state = {
      contact: props.contact
    }
  }

  componentDidMount() {
    BackAndroid.addEventListener('hardwareBackPress', () => {
      this.props._navCallback('contacts');
      return true;
    });
  }

  componentWillUnmount() {
    BackAndroid.removeEventListener('hardwareBackPress');
  }

  deleteContact() {
    this.props._deleteContact(this.state.contact.id);
    ToastAndroid.showWithGravity('Contact deleted.', ToastAndroid.SHORT, ToastAndroid.CENTER);
    this.props._navCallback('contacts');
  }

  onPress(action) {
    if (action === 'edit') {
      this.props._navCallback('editcontact', this.state.contact);
    }
    if (action === 'contacts') {
      GoogleDrivePicker.insertContact(this.state.contact.first + ' ' + this.state.contact.last, this.state.contact.phone, this.state.contact.email, this.state.contact.note);
    }
    if (action === 'delete') {
      Alert.alert(
        'Delete Contact',
        'Are you sure you want to permanently delete this contact?',
        [
          {text: 'Cancel', style: 'cancel'},
          {text: 'Delete', onPress: () => this.deleteContact()}     
        ]
      );
    }
  }

  render() {
    return (
      <View style={{flex: 1}}>
        <Toolbar
          leftElement='arrow-back'
          onLeftElementPress={() => this.props._navCallback('contacts')}
          centerElement={this.state.contact.first + ' ' + this.state.contact.last}
        />
        <View style={{padding: 20}}>
          <ListItem
            leftElement={<Avatar icon={'sms'} />}
            centerElement={{
              primaryText: this.state.contact.phone || ''
            }}
            rightElement={this.state.contact.phone ? 'sms' : null}
            onRightElementPress={() => Linking.openURL('smsto:' + this.state.contact.phone)}
          />
          <ListItem
            leftElement={<Avatar icon={'email'} />}
            centerElement={{
              primaryText: this.state.contact.email || ''
            }}
            rightElement={this.state.contact.email ? 'email' : null}
            onRightElementPress={() => Linking.openURL('mailto:' + this.state.contact.email)}
          />
          <ListItem
            leftElement={<Avatar icon={'wc'} />}
            centerElement={{
              primaryText: this.state.contact.gender || ''
            }}
          />
          <ListItem
            leftElement={<Avatar icon={'subject'} />}
            centerElement={{
              primaryText: this.state.contact.note || ''
            }}
          />
          <ListItem
            leftElement={<Avatar icon={'school'} />}
            centerElement={{
              primaryText: this.state.contact.year || ''
            }}
          />
        </View>
        <ActionButton
                    actions={[ {icon: 'edit', label: 'Edit'}, { icon: 'contacts', label: 'Save to Google Contacts' }, { icon: 'delete', label: 'Delete' } ]}
                    icon="more-horiz"
                    transition="speedDial"
                    style={{container: {backgroundColor: COLOR.blue500}}}
                    onPress={this.onPress.bind(this)}
                />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  ref: {
    color: 'gray',
    fontWeight: 'bold',
    fontSize: 16,
  },
  verse: {
    fontFamily: 'serif',
    fontSize: 16,
  },
  content: {
    padding: 10,
    flex: 1
  },
  swiper: {
    padding: 0,
    paddingBottom: 20,
    flex: 1
  }
});