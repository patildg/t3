/*
 * Copyright (c) 2015, salesforce.com, inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification, are permitted provided
 * that the following conditions are met:
 *
 * Redistributions of source code must retain the above copyright notice, this list of conditions and the
 * following disclaimer.
 *
 * Redistributions in binary form must reproduce the above copyright notice, this list of conditions and
 * the following disclaimer in the documentation and/or other materials provided with the distribution.
 *
 * Neither the name of salesforce.com, inc. nor the names of its contributors may be used to endorse or
 * promote products derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED
 * WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
 * PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 * TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

import React from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    View,
    ListView,
    PixelRatio,
} from 'react-native';

import Subscribable from 'Subscribable';
import dismissKeyboard from 'dismissKeyboard';
import SearchBar from './SearchBar';
import ContactScreen from './ContactScreen';
import ContactCell from './ContactCell';
import storeMgr from './StoreMgr';

var createReactClass = require('create-react-class');
const SearchScreen = createReactClass({
    mixins: [Subscribable.Mixin],
    
    getInitialState() {
      const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        return {
            isLoading: false,
            filter: '',
            dataSource: ds.cloneWithRows([]),
            queryNumber: 0
      };
    },

    componentDidMount() {
        storeMgr.addStoreChangeListener(() => { this.refresh(); });
    },
    
    refresh() {
        this.searchContacts(this.state.filter);
    },

    render() {
        return (
                <View style={this.props.style}>
                  <SearchBar
                    onSearchChange={this.onSearchChange}
                    isLoading={this.state.isLoading}
                  />
                  <View style={styles.separator} />
                  <ListView
                    automaticallyAdjustContentInsets={false}
                    dataSource={this.state.dataSource}
                    enableEmptySections={true}
                    renderRow={this.renderRow} />
                </View>
      );
    },

    renderRow(row: Object)  {
        return (
                <ContactCell
                  onSelect={() => this.selectContact(row)}
                  contact={row}
                />
        );
    },

    selectContact(contact: Object) {
        dismissKeyboard();
        this.props.navigator.push({
            name: 'Contact',
            contact: contact,
        });
    },

    onSearchChange(event: Object) {
        var filter = event.nativeEvent.text.toLowerCase();
        clearTimeout(this.timeoutID);
        this.timeoutID = setTimeout(() => this.searchContacts(filter), 10);
    },

    searchContacts(query: string) {
        this.setState({
            isLoading: true,
            filter: query
        });

        const that = this;
        storeMgr.searchContacts(
            query,
            (contacts, currentStoreQuery) => {
                that.setState({
                    isLoading: false,
                    filter: query,
                    dataSource: that.state.dataSource.cloneWithRows(contacts),
                    queryNumber: currentStoreQuery
                });
            },
            (error) => {
                that.setState({
                    isLoading: false
                });
            });
    }
});

const styles = StyleSheet.create({
    separator: {
        height: 1,
        backgroundColor: '#eeeeee',
    }
});

export default SearchScreen;
