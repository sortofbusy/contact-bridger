/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AsyncStorage,
  ActivityIndicator,
  Alert,
  BackAndroid,
  StyleSheet,
  Text,
  ListView,
  Picker,
  ToastAndroid,
  View
} from 'react-native';

import { ActionButton, Button, Card, Container, Divider, Icon, Toolbar } from 'react-native-material-ui';

let alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
let defaultFields = ['first', 'last', 'name', 'phone', 'email', 'gender', 'note', 'year', 'assigned'];

export default class SheetConfigView extends Component {
  // Initialize the hardcoded data
  

  constructor(props) {
    super(props);
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    
    this.state = {
      dataSource: ds,
      callback: props.callback,
      driveResource: props.driveResource,
      fields: null,
      headers: null
    };
  }

  componentDidMount() {
    BackAndroid.addEventListener('hardwareBackPress', () => {
      this.props._navCallback('import');
      return true;
    });

    let fields = {};
    for (var i = 0; i < this.state.driveResource.headers.length; i++) {
      let obj = {};
      obj.index = i;
      obj.header = this.state.driveResource.headers[i];
      obj.match = 'ignore';
      for (var j = defaultFields.length - 1; j >= 0; j--) {
        if (this.state.driveResource.headers[i].toLowerCase().includes(defaultFields[j]))
          obj.match = defaultFields[j];
      }
      fields[this.state.driveResource.headers[i]] = obj;
    }
    this.setState({fields: fields});
  }

  componentWillUnmount() {
    BackAndroid.removeEventListener('hardwareBackPress');
  }

  // return a set of fields to ImportView that can be used to build queries
  setFields() {
    let fields = {}; //fields is a object with properties of defaultFields

    let fieldKeys = Object.keys(this.state.fields);
    // cycle through each field, checking to see if one of the sheet's columns has been assigned to it
    for (var j = fieldKeys.length - 1; j >= 0; j--) {
      let curField = this.state.fields[fieldKeys[j]]; 
      if (curField.match !== 'ignore') {
        fields[curField.match] = curField.index; 
      }  
    }

    let driveResource = this.state.driveResource;
    driveResource.fields = fields;
    driveResource.configured = true;

    this.props._handleSheetConfig(driveResource);
  }

  pickerValueChange(match, header) {
    fields = this.state.fields;
    fields[header].match = match;
    this.setState({fields: fields});
  }

  _renderImportRow(rowData, sectionID, rowID) {
    return (
      <View style={styles.row}>
        <View style={{flex: 1}}>
          <Text style={styles.listBodyText}>{rowData.header}</Text>
        </View>
        <View style={{flex: 1}}>
          <Card>
          <Picker 
            style={{borderColor: 'lightgray', borderWidth: 2}}
            selectedValue={rowData.match}
            onValueChange={(match) => this.pickerValueChange(match, rowData.header)}>
            
            <Picker.Item label="--Ignore--" value="ignore" />
            <Picker.Item label="First Name" value="first" />
            <Picker.Item label="Last Name" value="last" />
            <Picker.Item label="Full Name" value="name" />
            <Picker.Item label="Phone" value="phone" />
            <Picker.Item label="Email" value="email" />
            <Picker.Item label="Gender" value="gender" />
            <Picker.Item label="Note" value="note" />
            <Picker.Item label="Year" value="year" />
            <Picker.Item label="Assigned To" value="assigned" />
          </Picker>
          </Card>
        </View>
      </View>
    );
  }

  render() {
    return (
      <View style={{flex: 1}}>
        <Toolbar
          leftElement='arrow-back'
          onLeftElementPress={() => this.props._navCallback('import')}
          centerElement={'Configure Sheet'}
        />
        <View style={styles.headerRow}>
          <Text style={styles.headerText}>Header Columns</Text>
          <Text style={styles.headerText}>Use As</Text>
        </View>
        {this.state.fields && <ListView
            key={1000}
            dataSource={this.state.dataSource.cloneWithRows(this.state.fields)}
            enableEmptySections={true}
            renderRow={this._renderImportRow.bind(this)}
            initialListSize={10}
        />}
        <ActionButton
          icon="check"
          onPress={this.setFields.bind(this)}
        />
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
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  row: {
    flex: 1,
    margin: 5, 
    flexDirection: 'row', 
    alignItems: 'center',
    justifyContent: 'center', 
  },
  headerRow: {
    height: 35,
    marginTop: 10,
    marginLeft: 15, 
    marginRight: 55, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center'
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 20
  },
  listBodyText: {
    fontSize: 18
  }
});