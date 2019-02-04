/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  BackAndroid,
  DrawerLayoutAndroid,
  StyleSheet,
  Text,
  Image,
  Linking,
  ListView,
  TouchableHighlight,
  View
} from 'react-native';

import { ActionButton, Avatar, Card, Container, COLOR, Drawer, ListItem, Toolbar } from 'react-native-material-ui';
import DrawerView from './DrawerView';

export default class ContactListView extends Component {
  
  constructor(props) {
    super(props);
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    

    this.state = {
      dataSource: ds,
      drawerOpen: false,
      contacts: {},
      searchText: null,
      searchActive: false
    };
  }

  componentDidMount() {
    BackAndroid.addEventListener('hardwareBackPress', () => {
      return false;
    });
    this.sortContacts();
  }

  componentWillUnmount() {
    BackAndroid.removeEventListener('hardwareBackPress');
  }

  onChangeText(value) {
    let exp = /\s/;
    let words = value.toLowerCase().split(exp);
    this.setState({searchText: {first: words[0], last: words[1]}});
    console.log(words[0] + ':' + words[1]);
  }

  onSearchClosed() {
    this.setState({searchText: null, searchActive: false});
  }

  onSearchPressed() {
    this.setState({searchActive: true});
  }

  sortContacts() { 
    let newContacts = {};

    Object.keys(this.props.contacts)
      .sort()
      .forEach((key, i) => {
          newContacts[key] = this.props.contacts[key];
       });
    this.setState({contacts: newContacts});
  }

  _drawerCallback() {
    this.setState({drawerOpen: false});
  }

  _callPhone(phone) {
    Linking.openURL(phone);
  }

  _onPressDelete(data) {
    this.props._deleteContact(data);
  }

  _renderRow(rowData, sectionID, rowID) {
    let shouldRender = true; //TODO: fix name search

    if (rowData === null || rowData.length === 0) return null;
    
    if (this.state.searchText && this.state.searchText.first && this.state.searchText.first !== '') {
      shouldRender = false;
      if (rowData.first.toLowerCase().startsWith(this.state.searchText.first))
          shouldRender = true;
      if (rowData.last.toLowerCase().startsWith(this.state.searchText.first) || this.state.searchText.last && rowData.last.toLowerCase().startsWith(this.state.searchText.last))
          shouldRender = true;
    }

    if(!shouldRender) return null;
    else return (
      <Card
        onPress={() => this.props._navCallback('contact', rowData)}>
        <ListItem
          leftElement={<Avatar text={rowData.first.charAt(0).toUpperCase() + rowData.last.charAt(0).toUpperCase()} />}
          centerElement={{
            primaryText: rowData.first + ' ' + rowData.last,
            secondaryText: rowData.phone || rowData.email || ' '
          }}
        />
      </Card>
    );
  }

  render() {
    return (
      <DrawerLayoutAndroid
        drawerWidth={300}
        drawerPosition={DrawerLayoutAndroid.positions.Left}
        renderNavigationView={() => <DrawerView user={this.props.user} _navCallback={this.props._navCallback} />} 
        ref={'DRAWER'} 
        _navCallback={this.props._navCallback}>
      <View style={{flex: 1}}>
        <View style={{flex: 1}}>
          <Toolbar
            leftElement='menu'
            onLeftElementPress={() => this.refs['DRAWER'].openDrawer()}
            centerElement={'Contacts'}
            searchable={{
              autoFocus: true,
              placeholder: 'Search',
              onChangeText: this.onChangeText.bind(this),
              onSearchClosed: this.onSearchClosed.bind(this)
            }}
          />
          <ListView
              key={1000}
              dataSource={this.state.dataSource.cloneWithRows(this.state.contacts)}
              enableEmptySections={true}
              renderRow={this._renderRow.bind(this)}
              initialListSize={10}
            />
        </View>  
        {!this.state.searchActive && <ActionButton
          icon="add"
          onPress={() => this.props._navCallback('import')}
          style={{container: {backgroundColor: COLOR.blue500}}}
        />}
      </View>
    </DrawerLayoutAndroid>
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