import { View, Image, TouchableOpacity, Animated } from "react-native";
import PropTypes, { func } from "prop-types";

import React from 'react';
import { StyleSheet, Modal, Text, TouchableHighlight, BackHandler, Button } from 'react-native';
import { localStrings as LocalizedStrings } from '../MHLocalizableString';
import { Styles } from 'miot/resources';

export default class CancelableProgressDialog extends React.Component {

  static propTypes = {
    visible: PropTypes.bool,
    loadingText: PropTypes.string,
    cancelText: PropTypes.string,
    onCancelPress: PropTypes.func,
    disableOutsideCancel: PropTypes.bool
  }

  static defaultProps = {
    visible: false
  };

  constructor(props) {
    super(props);
    this.state = {
      visible: props.visible,
      rotate: new Animated.Value(0)
    };
    this.stopAnimation = false;
  }

  componentDidMount() {
    this.onShowView();
  }

  componentWillUnmount() {
    this.animation && this.animation.stop();
    this.stopAnimation = true;
  }

  onShowView = () => {
    this.state.rotate.setValue(0);
    this.animation = Animated.timing(this.state.rotate, {
      toValue: 1,
      useNativeDriver: true,
      duration: 1000
    }).start(() => {
      if (this.stopAnimation) {
        return;
      }
      this.onShowView();
    });
  };

  hide() {
    this.setState({ visible: false });
  }

  show() {
    this.setState({ visible: true });
  }

  render() {
    if (!this.state.visible) {
      return null;
    }

    const pic = require("../../Resources/Images/loading.png");
    const imageView = <Animated.Image source={pic} style={{
      marginLeft: 23,
      marginRight: 23,
      backgroundColor: 'transparent',
      width: 22,
      height: 22,
      transform: [{
        rotate: this.state.rotate.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '360deg']
        })
      }]
    }} />;

    return (
      <Modal
        style={{ display: "flex", width: "100%", height: "100%" }}
        animationType="none"
        transparent={true}
        onRequestClose={() => {
          this.hide();
        }}
      >

        <View style={{ width: "100%", height: "100%", backgroundColor: "#00000066" }}>
          <TouchableOpacity style={{ width: "100%", height: "100%" }}
            onPress={() => {
              if (this.props.disableOutsideCancel) {
                return;
              }
              if (this.props.onCancelPress) {
                this.props.onCancelPress();
              } else {
                this.hide();
              }
            }}
          >

          </TouchableOpacity>
          <View style={styles.dialogBgStyle}>


            {imageView}
            <View style={styles.descContainerStyle}>
              <Text style={styles.descStyle}>
                {this.props.loadingText || LocalizedStrings["camera_loading"]}
              </Text>
            </View>
            {
              this.props.cancelText ?
                <TouchableOpacity style={{ marginRight: 23, paddingHorizontal: 13, height: 30, backgroundColor: "#F5F5F5", borderRadius: 15, display: "flex", justifyContent: "center" }}
                  onPress={() => {
                    if (this.props.onCancelPress) {
                      this.props.onCancelPress();
                    } else {
                      this.hide();
                    }
                  }}
                >
                  <Text style={{ fontSize: 12, color: "#00000080" }}>
                    {LocalizedStrings["action_cancle"]}
                  </Text>
                </TouchableOpacity>
                : 
                <TouchableOpacity style={{ marginRight: 23, paddingHorizontal: 13, height: 30, borderRadius: 15, display: "flex", justifyContent: "center" }}
                >
                 
                </TouchableOpacity>
            }

          </View>
        </View>

      </Modal>
    );
  }

  _renderInstallItem(item) {
    let installGroupStyle = {
      display: "flex",
      flexDirection: "column",
      position: "relative",
      width: "30%",
      height: "100%",
      alignItems: "center",
      justifyContent: "center"
    };

    let imgUnselect = require("../../Resources/Images/icon_camera_panoram_angle_unselect.png");
    let imgSelect = require("../../Resources/Images/icon_camera_panoram_angle_select.png");

    return (
      <View style={installGroupStyle}>
        <Image style={{ position: "relative", width: 60, height: 60 }}
          source={item.source}
        >
        </Image>

        <Text style={{ position: "relative", marginTop: 10, fontSize: 13, textAlign: 'center', textAlignVertical: 'center' }}>
          {item.title}
        </Text>

        <Text style={{ position: "relative", marginTop: 5, fontSize: 12, textAlign: 'center', textAlignVertical: 'center' }}>
          {item.degree}
        </Text>

        <View style={{ position: "relative", marginTop: 15, width: 30, height: 30 }}>
          <Image style={{ position: "absolute" }}
            source={this.state.selectedType == item.panoType ? imgSelect : imgUnselect}
          />
          <TouchableOpacity style={{ position: "absolute", width: "100%", height: "100%" }}
            onPress={() => {
              this.setState({ selectedType: item.panoType });
            }}
          />
        </View>
      </View>
    );
  }

  _renderButton(btnText, btnTextColor, onBtnPress) {

    let btnStyle = {
      position: "relative",
      fontSize: 16,
      fontWeight: "normal",
      color: btnTextColor,
      textAlign: 'center',
      textAlignVertical: 'center'
    };

    let btnContainerStyle = styles.btnContainerStyleFull;
    if (this.props.onConfirmPress && this.props.onCancelPress) {
      btnContainerStyle = styles.btnContainerStyleHalf;
    }
    return (
      <View style={btnContainerStyle}>
        <Text style={btnStyle}>
          {btnText}
        </Text>
        <TouchableOpacity style={{ position: "absolute", width: "100%", height: "100%" }}
          onPress={() => {
            onBtnPress(this.state.selectedType);
          }}
        />
      </View>
    );
  }
}

export const styles = StyleSheet.create({
  dialogBgStyle: {
    display: "flex",
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 67,
    flexDirection: "row",
    backgroundColor: "white",
    alignItems: "center",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20
  },

  titleStyle: {
    position: "relative",
    marginTop: 25,
    fontSize: 18,
    fontWeight: "bold",
    textAlign: 'center',
    textAlignVertical: 'center'
  },
  descContainerStyle: {
    flexGrow: 1
  },
  descStyle: {
    position: "relative",
    fontSize: 14,
    color: "#000000CC",
    textAlign: 'center',
    textAlignVertical: 'center'
  },

  installGroupStyle: {
    display: "flex",
    flexDirection: "row",
    position: "relative",
    marginTop: 10,
    width: "100%",
    height: 180,
    alignItems: "center",
    justifyContent: "space-around"
  },


  btnGroupStyle: {
    display: "flex",
    position: "relative",
    flexDirection: "row",
    bottom: 0,
    marginBottom: 10,
    width: "100%",
    height: 50,
    alignItems: "center",
    justifyContent: "space-around"
  },

  btnContainerStyleHalf: {
    display: "flex",
    flexDirection: "row",
    position: "relative",
    width: 150,
    height: "100%",
    backgroundColor: "#EEEEEE",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "stretch",
    borderRadius: 30
  },

  btnContainerStyleFull: {
    display: "flex",
    flexDirection: "row",
    position: "relative",
    width: "85%",
    height: "100%",
    backgroundColor: "#EEEEEE",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 30
  }


});
