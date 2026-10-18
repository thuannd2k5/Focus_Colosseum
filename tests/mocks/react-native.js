const React = require('react');

const View = (props) => React.createElement('View', props, props.children);
const Text = (props) => React.createElement('Text', props, props.children);
const TouchableOpacity = (props) => React.createElement('TouchableOpacity', props, props.children);
const TextInput = (props) => React.createElement('TextInput', props);
const Modal = (props) => props.visible ? React.createElement('Modal', props, props.children) : null;
const ScrollView = (props) => React.createElement('ScrollView', props, props.children);
const FlatList = (props) => React.createElement('FlatList', props);
const ActivityIndicator = (props) => React.createElement('ActivityIndicator', props);
const Alert = {
  alert: jest.fn()
};
const StyleSheet = {
  create: (styles) => styles,
  flatten: (style) => style || {}
};
const AppState = {
  currentState: 'active',
  addEventListener: jest.fn((event, cb) => ({
    remove: jest.fn()
  }))
};
const Dimensions = {
  get: jest.fn().mockReturnValue({ width: 375, height: 812 })
};

module.exports = {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Alert,
  StyleSheet,
  AppState,
  Dimensions,
  default: {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    Modal,
    ScrollView,
    FlatList,
    ActivityIndicator,
    Alert,
    StyleSheet,
    AppState,
    Dimensions
  }
};
