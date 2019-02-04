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
  Modal,
  StyleSheet,
  Text,
  Image,
  ListView,
  Picker,
  ToastAndroid,
  Switch,
  View
} from 'react-native';


import Bugsnag from 'react-native-bugsnag';
import {GoogleDrivePicker} from 'react-native-google-drive-picker';
import { ActionButton, Button, Card, Checkbox, Container, Divider, Icon, ListItem, Toolbar } from 'react-native-material-ui';

let alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
let defaultFields = ['first', 'last', 'name', 'phone', 'email', 'gender', 'note', 'year', 'assigned'];

export default class ImportView extends Component {
  // Initialize the hardcoded data

  constructor(props) {
    super(props);
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    let driveResource = props.driveResource || {};
    this.state = {
      dataSource: ds,
      data: [],
      driveResource: driveResource,
      loading: false,
      searchText: null,
      searchGender: {
        m: true,
        f: true
      },
      selectedRow: null,
      checkedRows: {},
      filtersVisible: false,
      showAssigned: false
    };
  }

  componentDidMount() {
    BackAndroid.addEventListener('hardwareBackPress', () => {
      this.props._navCallback('contacts');
      return true;
    });

    if (this.state.driveResource.id) this._getData();
  }

  componentWillUnmount() {
    BackAndroid.removeEventListener('hardwareBackPress');
  }

  // Called from SheetConfigView after a Google Sheet has been selected and headers have been matched 
  configCallback(driveResource) {
    this.setState({driveResource: driveResource});
    AsyncStorage.setItem('driveResource', JSON.stringify(driveResource));
  }

  // Toolbar search
  onChangeText(value) {
    if(this.state.loading) return;
    let exp = /\s/;
    let words = value.toLowerCase().split(exp);
    this.setState({searchText: {first: words[0], last: words[1]}});
    console.log(JSON.stringify(this.state.searchText));
  }

  //Toolbar search
  onSearchClosed() {
    this.setState({searchText: null, searchActive: false});
  }

  //Toolbar search
  onSearchPressed() {
    if(this.state.loading) return;
    this.setState({searchActive: true});
  }

  rightElementPress(element) {
    if (element.action === 'cloud-download') {
      this.pickFile();
    }
    if (element.action === 'tune') {
      this.setState({filtersVisible: !this.state.filtersVisible});
    }
  }

  // Initiate Google Drive File Picker
  pickFile() {
    if(this.state.loading) return;
    this.setState({loading: true});
    GoogleDrivePicker.pickFile() //returns a Google Drive resourceID string
      .then((result) => {
        if(result && result !== '') {
          this.getInitialSheetInfo(result);
          this.forceUpdate();
        }
      })
      .catch((error) => {
        ToastAndroid.showWithGravity('Google Sheet not selected.', ToastAndroid.SHORT, ToastAndroid.CENTER);
        this.setState({loading: false});
      });
  }

  // Get title and header row
  getInitialSheetInfo(resourceId) {
    let request = {
      headers: {
        'Authorization': 'Bearer ' + this.props.user.accessToken
      }
    };

    this.setState({loading: true});
    
    fetch(`https://sheets.googleapis.com/v4/spreadsheets/${resourceId}`, request)
      .then((response) => response.json())
      .then((responseJson) => {
        let title = null;
        if(responseJson.properties && responseJson.properties.title)
          title = responseJson.properties.title;
        fetch(`https://sheets.googleapis.com/v4/spreadsheets/${resourceId}/values/A1:1`, request)
          .then((response2) => response2.json())
          .then((responseJson2) => {
            let newDriveResource = Object.assign({}, this.state.driveResource);
            newDriveResource.id = resourceId;
            newDriveResource.title = title;
            newDriveResource.headers = responseJson2.values[0];
            newDriveResource.configured = false;
            
            //AsyncStorage for driveResource will be called in the callback
            this.props._handleSheetPicked(newDriveResource);
          });
      })
      .catch((error) => {
        ToastAndroid.showWithGravity('Error: Google Sheet not reachable.', ToastAndroid.SHORT, ToastAndroid.CENTER);
        this.setState({loading: false});
      });
  }

  // Load rows from a selected and configured Google Sheet
  _getData() {
    if (!this.state.driveResource.fields) return;

    let columns = Object.values(this.state.driveResource.fields);
    let lastCol = Math.max(...columns);

    let request = {
      headers: {
        'Authorization': 'Bearer ' + this.props.user.accessToken
      }
    };

    this.setState({loading: true});
    
    fetch(`https://sheets.googleapis.com/v4/spreadsheets/${this.state.driveResource.id}/values/${'A2:' + alphabet.charAt(lastCol)}`, request)
      .then((response) => response.json())
      .then((responseJson) => {
        let data = [];
        let resourceFields = Object.keys(this.state.driveResource.fields);
        let checkedRows = {};

        for (let i = responseJson.values.length - 1; i >= 0; i--) {
          let cur = responseJson.values[i];
          if(this.state.driveResource.fields.assigned && cur[this.state.driveResource.fields.assigned] && !this.state.showAssigned) continue;
          data[i] = {};
          for (var j = resourceFields.length - 1; j >= 0; j--) {
            data[i][resourceFields[j]] = cur[this.state.driveResource.fields[resourceFields[j]]] || ''; // fill this contact's object with the present default fields
          }
          checkedRows[i] = false;
          data[i].selected = false;
          
          let exp = /\s/; //one or more whitespace characters
          if (data[i]['name'] && !data[i]['first']) [data[i]['first'], data[i]['last'], ] = data[i]['name'].split(exp);
          if (!data[i]['last']) data[i]['last'] = '';
        }
        this.setState({data: data, checkedRows: checkedRows, loading: false});
      })
      .catch((error) => {
        ToastAndroid.showWithGravity('Error: Google Sheet not reachable.', ToastAndroid.SHORT, ToastAndroid.CENTER);
        this.setState({loading: false});
      });

  }

  //save contacts locally
  _importData() {
    let obj = {};
    for (var i = this.state.data.length - 1; i >= 0; i--) {
      const cur = this.state.data[i];
      if (cur && this.state.checkedRows[i]) {
        let newID = cur['first']+cur['last']+Date.now(); 
        cur.id = newID;
        obj[newID] = cur;
      }
    }
    this._updateSheet();
    this.setState({loading: false});
    
    if (Object.keys(obj).length > 0) {
      this.props._handleUpdate(obj);
    }
  }

  // Mark checked contcts as imported in the Google Sheet if applicable
  _updateSheet() {
    if(!this.state.driveResource.fields['assigned']) return;

    let values = [];
    for (let i = 0; i < this.state.data.length; i++) {
      if (this.state.data[i] && this.state.checkedRows[i]) values.push([this.props.user.name]);
      else values.push([null]);
    }

    let column = alphabet.charAt(this.state.driveResource.fields['assigned']);

    let request = {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer ' + this.props.user.accessToken
      },
      body: JSON.stringify({
        values: values
      })
    };

    fetch(`https://sheets.googleapis.com/v4/spreadsheets/${this.state.driveResource.id}/values/${column + '2:' + column}?valueInputOption=RAW`, request)
      .catch((error) => {
        console.error(error);
        ToastAndroid.showWithGravity('Assignments were not updated.', ToastAndroid.SHORT, ToastAndroid.CENTER);
      });

  }

  toggleSearchGender(gender) {
    let searchGender = this.state.searchGender;
    searchGender[gender] = !searchGender[gender];
    this.setState({searchGender: searchGender});
  }

  toggleSelected(rowID) {
    let selectedRow = this.state.selectedRow;
    if (!selectedRow || selectedRow !== rowID) this.setState({selectedRow: rowID});
    else this.setState({selectedRow: null});
  }

  toggleShowAssigned() {
    let newShowAssigned = !this.state.showAssigned
    this.setState({showAssigned: newShowAssigned});
    this._getData();
  }

  _updateCheckbox(isChecked, rowID) {
    let checkedRows = this.state.checkedRows;
    checkedRows[rowID] = !checkedRows[rowID];
    this.setState({checkedRows: checkedRows});
  }

  // Called when a contact card is tapped.
  showDetails(rowData) {
    let returnValue = [];
    let keys = Object.keys(this.state.driveResource.fields);
    for (field in this.state.driveResource.fields) {
      if (['name', 'first', 'last'].indexOf(field) < 0) returnValue.push(
        <Text style = {styles.listItem} key={field}> { field.charAt(0).toUpperCase() + field.substring(1) + ': ' + rowData[field] } </Text>
      );
    }
    return returnValue;
  }

  _renderImportRow(rowData, sectionID, rowID) {
    let shouldRender = true; //TODO: fix name search

    if (rowData === null || rowData.length === 0) return null;
    
    if (this.state.searchText && this.state.searchText.first && this.state.searchText.first !== '') {
      shouldRender = false;
      if (rowData.first && rowData.first.toLowerCase().startsWith(this.state.searchText.first))
          shouldRender = true;
      if (rowData.last && rowData.last.toLowerCase().startsWith(this.state.searchText.first) || this.state.searchText.last && rowData.last.toLowerCase().startsWith(this.state.searchText.last))
          shouldRender = true;
    }

    if (rowData.gender) {
      if (!this.state.searchGender['m'] && rowData.gender.toLowerCase().startsWith('m')) shouldRender = false;
      if (!this.state.searchGender['f'] && rowData.gender.toLowerCase().startsWith('f')) shouldRender = false;
    }

    if(!shouldRender) return null;
    else return (
      <Card
        onPress={() => this.toggleSelected(rowID)}>
        <View style={styles.row}>
          <View style={{flex: 0}}>
            <Checkbox value={rowID} checked={(this.state.checkedRows[rowID])} onCheck={this._updateCheckbox.bind(this)}/>
          </View>
          <View style={{flex: 1}}>
            <Text style={styles.listBodyText}> {rowData.first} {rowData.last} </Text>
          </View>
          <View style={{justifyContent: 'flex-end', marginRight: 10}}>
            {this.state.selectedRow !== rowID && <Icon name='keyboard-arrow-down' />}
            {this.state.selectedRow === rowID && <Icon name='keyboard-arrow-up' />}
          </View>
        </View>
        {this.state.selectedRow === rowID && <View style={{marginLeft: 30, marginBottom: 20}}>
           {this.showDetails(rowData)}
        </View>}
      </Card>
    );
  }

  render() {
    return (
      <View style={{flex: 1}}>
        <Toolbar
          leftElement='arrow-back'
          onLeftElementPress={() => this.props._navCallback('contacts')}
          centerElement={'Import Contacts'}
          rightElement={['cloud-download', 'tune']}
          onRightElementPress={this.rightElementPress.bind(this)}
          searchable={{
              autoFocus: true,
              placeholder: 'Search',
              onChangeText: this.onChangeText.bind(this),
              onSearchClosed: this.onSearchClosed.bind(this)
            }}
        />
        
        {this.state.driveResource.configured && this.state.filtersVisible && <View style={{}}>
            <View style={styles.headerRow}>
              <Text style={styles.headerText}>Show Already Assigned to Me</Text>
              <Switch 
                value={this.state.showAssigned}
                onValueChange={() => this.toggleShowAssigned()}/>
            </View>
            { this.state.driveResource.fields && this.state.driveResource.fields['gender'] && <View style={styles.headerRow}>
              <Text style={styles.headerText}>Show Male </Text>
              <Switch 
                value={this.state.searchGender.m}
                onValueChange={() => this.toggleSearchGender('m')}/> 
              <Text style={styles.headerText}>Show Female </Text>
              <Switch 
                value={this.state.searchGender.f}
                onValueChange={() => this.toggleSearchGender('f')}/>
            </View>}
          </View>}

        
        {this.state.loading && <View style={{flex:1, justifyContent: 'center'}}><ActivityIndicator size='large' /></View>}
        
        {!this.state.loading && this.state.driveResource.configured && 
         <View style={{flex: 1}}>
          <ListView
            key={1000}
            dataSource={this.state.dataSource.cloneWithRows(this.state.data)}
            enableEmptySections={true}
            renderRow={this._renderImportRow.bind(this)}
            initialListSize={10}
          />
          <ActionButton
            icon="person-add"
            onPress={this._importData.bind(this)}
          />
        </View>}
      
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
    alignItems: 'center'
  },
  headerRow: {
    height: 35,
    marginTop: 10,
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
    fontSize: 16,
    color: 'black'
  },
  listItem: {
    fontSize: 14,
    margin: 3,
    marginLeft: 25
  }
});