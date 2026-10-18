const React = require('react');

const View = (props) => React.createElement('View', props, props.children);
const Text = (props) => React.createElement('Text', props, props.children);
const TouchableOpacity = (props) => React.createElement('TouchableOpacity', props, props.children);
const Pressable = (props) => React.createElement('Pressable', props, props.children);
const TextInput = (props) => React.createElement('TextInput', props, props.children);
const Image = (props) => React.createElement('Image', props, props.children);
const Switch = (props) => React.createElement('Switch', props, props.children);
const Modal = (props) => {
  if (props.visible === false) return null;
  return React.createElement('Modal', props, props.children);
};
const ScrollView = (props) => React.createElement('ScrollView', props, props.children);
const FlatList = (props) => {
  const items = props.data || [];
  const renderedItems = items.map((item, index) => {
    const key = props.keyExtractor ? props.keyExtractor(item, index) : index;
    return props.renderItem ? React.createElement(View, { key }, props.renderItem({ item, index })) : null;
  });
  return React.createElement('FlatList', props, renderedItems);
};
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
  Pressable,
  TextInput,
  Image,
  Switch,
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
    Pressable,
    TextInput,
    Image,
    Switch,
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
