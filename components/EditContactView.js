/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  Alert,
  BackAndroid,
  StyleSheet,
  Text,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  TextInput,
  ToastAndroid,
  View
} from 'react-native';

import { ActionButton, Avatar, Card, Container, COLOR, ListItem, Toolbar } from 'react-native-material-ui';

export default class EditContactView extends Component {
  constructor(props) {
    super(props);
    let newContact = Object.assign({}, props.contact);  
    this.state = {
      contact: newContact,
      onlyRender: null
    }
  }

  componentDidMount() {
    BackAndroid.addEventListener('hardwareBackPress', () => {
      this.props._navCallback('contact', this.props.contact);
      return true;
    });
  }

  componentWillUnmount() {
    BackAndroid.removeEventListener('hardwareBackPress');
  }

  changeText(newText, field) {
    let newContact = this.state.contact;
    if (field === 'name') {
      let exp = /\s/;
      [newContact.first, newContact.last, ] = newText.split(exp);
    } else newContact[field] = newText;
    this.setState({contact: newContact});
  }

  saveEdits() {
    ToastAndroid.showWithGravity('Changes Saved.', ToastAndroid.SHORT, ToastAndroid.CENTER);
    this.props._editContact(this.state.contact);
  }

  render() {
    return (
      <View style={{flex: 1}}>
        <Toolbar
          leftElement='close'
          onLeftElementPress={() => this.props._navCallback('contact', this.state.contact)}
          centerElement={'Edit Contact'}
          style={{
            container: {backgroundColor: COLOR.white, marginBottom: 40},
            leftElement: {color: COLOR.gray},
            titleText: {color: COLOR.grey}
          }}
        />
        <ScrollView style={{flex: 1}}>  
          <KeyboardAvoidingView 
            behavior='padding'
            style={{flex: 1, padding: 20}}>
            <View style={styles.row}>
              <View style={{flex: 0, flexDirection: 'row', marginRight: 20}}><Avatar icon={'perm-identity'} /></View>
              <View style={{flex: 1, }}>
                <TextInput 
                  value={this.state.contact.first + ' ' + this.state.contact.last} 
                  onChangeText={(change) => this.changeText(change, 'name')}/>
              </View>
            </View>
            <View style={styles.row}>
              <View style={{flex: 0, flexDirection: 'row', marginRight: 20}}><Avatar icon={'sms'} /></View>
              <View style={{flex: 1, }}>
                <TextInput 
                  value={this.state.contact.phone} 
                  keyboardType='phone-pad' 
                  onChangeText={(change) => this.changeText(change, 'phone')}/>
                </View>
            </View>
            <View style={styles.row}>
              <View style={{flex: 0, flexDirection: 'row', marginRight: 20}}><Avatar icon={'email'} /></View>
              <View style={{flex: 1, }}>
                <TextInput 
                  value={this.state.contact.email} 
                  keyboardType='email-address'
                  onChangeText={(change) => this.changeText(change, 'email')}/>
              </View>
            </View>
            <View style={styles.row}>
              <View style={{flex: 0, flexDirection: 'row', marginRight: 20}}><Avatar icon={'wc'} /></View>
              <View style={{flex: 1, }}>
                <TextInput 
                  value={this.state.contact.gender} 
                  onChangeText={(change) => this.changeText(change, 'gender')}/>
              </View>
            </View>
            <View style={styles.row}>
              <View style={{flex: 0, flexDirection: 'row', marginRight: 20}}><Avatar icon={'subject'} /></View>
              <View style={{flex: 1, }}>
                <TextInput 
                  value={this.state.contact.note} 
                  onChangeText={(change) => this.changeText(change, 'note')}/>
              </View>
            </View>
            <View style={styles.row}>
              <View style={{flex: 0, flexDirection: 'row', marginRight: 20}}><Avatar icon={'school'} /></View>
              <View style={{flex: 1, }}>
                <TextInput 
                  value={this.state.contact.year} 
                  onChangeText={(change) => this.changeText(change, 'year')}/>
              </View>
            </View>
          </KeyboardAvoidingView>
        </ScrollView>
        <ActionButton
          icon="check"
          onPress={this.saveEdits.bind(this)}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  row: {
    flex: 1,
    margin: 5, 
    flexDirection: 'row', 
    alignItems: 'center'
  }
});

const avatar = {
  container: {
    marginRight: 20
  }
};