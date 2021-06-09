'use strict';

import { ListItem, ListItemWithSwitch } from 'miot/ui/ListItem';
import Separator from 'miot/ui/Separator';
import { strings } from 'miot/resources';
import React from 'react';
import { StyleSheet, ScrollView, Image, Text, View, Dimensions, StatusBar, TouchableOpacity } from 'react-native';

import { localStrings as LocalizedStrings } from '../MHLocalizableString';

import { styles as settingStyles } from './SettingStyles';

import { Device, Host } from "miot";
import { ChoiceDialog, MessageDialog } from 'miot/ui/Dialog';
import Toast from '../Toast';
import StorageKeys from '../StorageKeys';
import Service from 'miot/Service';
import SdFileManager from '../sdcard/util/SdFileManager';
import id from 'miot/resources/strings/id';
import CameraPlayer from '../util/CameraPlayer';
import NoSdcardPage from './NoSdcardPage';
import Util from '../util2/Util';
import VersionUtil from '../util/VersionUtil';
import { CAMERA_CONTROL_SEPC_PARAMS, CAMERA_SDCARD_SPEC_PARAMS } from '../Constants';
import CancelableProgressDialog from '../ui/CancelableProgressDialog';
export default class SDCardSetting extends React.Component {

  constructor(props, context) {
    super(props, context);

    this.state = {
      sdcardStatus: -1, // 参考 'sds_status'
      motionRecord: 2, // stop(关闭录制) on(开启移动侦测录制) off(关闭移动侦测，始终录制)   数字 0 all 1 on  2 stop

      showSelectMode: false,
      showFormatConfirm: false,
      showExitConfirm: false,

      totalSize: 0,
      videoSize: 0,
      idleSize: 0,

      isVip: false,
      isInternationalServer: true,
      hideSdcardStatus: true
    };
    this._getSetting = this._getSetting.bind(this);
  }

  render() {
    let sdCardView = (
      <ScrollView showsVerticalScrollIndicator={false} key={111111}>
        <View style={styles.stateContainer}
          key={1}
        >
          <View style={styles.stageBack}>
            <Image style={styles.stateImage}
              source={
                this.state.sdcardStatus == 3
                  ? require('../../Resources/Images/mjv3_sdCard_abnormal.png')
                  : (
                    this.state.motionRecord == 2
                      ? require('../../Resources/Images/mjv3_sdCard_pause.png')
                      : require('../../Resources/Images/mjv3_sdCard_normal.png')
                  )
              }
            />
            <View style={styles.stateCover}>
              {
                this.state.motionRecord == 2 ?
                  <Text style={styles.stateCoverTitle}>
                    {LocalizedStrings["camera_storage_pause"]}
                  </Text>
                  :
                  <Text style={styles.stateCoverTitle}>
                    {(this.state.hideSdcardStatus ? "" : LocalizedStrings['sds_status']) + LocalizedStrings[`sds_status_${this.state.sdcardStatus}`]}
                  </Text>
              }
              {
                this.state.sdcardStatus == 3 ?
                  <Text style={styles.stateCoverDesc}>
                    {LocalizedStrings['sds_try_format']}
                  </Text>
                  :
                  null
              }

              <View style={styles.stateCoverSeprate}></View>
              {
                this.state.sdcardStatus != 3 ?
                  <Text style={styles.stateCoverDetail}>{LocalizedStrings['sds_left']}</Text>
                  :
                  null
              }
              {
                this.state.sdcardStatus != 3 ?
                  <Text style={{ position: "absolute", bottom: 39, color: "white", fontSize: 15 }}>{Util._formatSize(this.state.idleSize)}</Text>
                  :
                  null
              }
              {/* <Text style={styles.stateCoverDetail}>{LocalizedStrings['sds_left']}</Text>
              <Text style={{ position: "absolute", bottom: 39, color: "white", fontSize: 15 }}>{this._formatSize(this.state.idleSize)}
              </Text> */}
            </View>
          </View>
          <Text style={styles.totalText}>
            {
              this.state.sdcardStatus != 3 ? LocalizedStrings['sds_total'] + Util._formatSize(this.state.totalSize) : ""
            }
          </Text>
        </View>

        <View style={styles.blank}
          key={2}
        />
        <View style={styles.featureSetting}
          key={8}
        >
          <ListItemWithSwitch
            title={LocalizedStrings['sds_switch']}
            value={this.state.motionRecord != 2}
            onValueChange={(value) => {
              if (this.state.sdcardStatus == 4) {
                Toast.fail('formating_error');
                return;
              }
              else{
                this._onEnableValueChange(value)

              }
            }}

          />
          {
            this.state.motionRecord == 2 ?
              null :
              <ListItem
                title={LocalizedStrings['sds_record_mod']}
                value={
                  this.state.motionRecord == 0
                    ? LocalizedStrings['sds_record_mod2']
                    : LocalizedStrings['sds_record_mod1']
                }
                onPress={() => {

                  if (this.state.sdcardStatus == 4) {
                    Toast.fail('formating_error');
                    return;
                  }
                  else {
                    this.setState({ showSelectMode: true })
                  }
                }

                }

              />
          }

        </View>

        <View style={styles.blank}
          key={3}
        />
        <View style={styles.featureSetting}
          key={4}
        >
          <ListItem
            title={LocalizedStrings['sds_format']}
            onPress={() => {
              if (this.state.sdcardStatus == 4) {
                Toast.fail('formating_error');
                return;
              }

              this.setState({ showFormatConfirm: true });
            }

            }
          />
          <ListItem title={LocalizedStrings['sds_exit']} onPress={() =>
            this.setState({ showExitConfirm: true })
          } />
        </View>
        <View style={styles.tipsBack}
          key={5}
        >
          {
            <Text
              key={111}
              style={styles.tips}>
              {LocalizedStrings["sds_tip1"]}
            </Text>
          }
        </View>
      </ScrollView>
    );
    let width = Dimensions.get("window").width - 34;
    let noSDCardView = (
      <NoSdcardPage
        onButtonClick={
          () => {
            // Service.miotcamera.showCloudStorage(true, false);
            this.props.navigation.navigate("CloudIntroPage");
          }
        }
        showBuyButton={true}
      />
    );

    return (

      <View style={styles.container}>
        {
          this.state.sdcardStatus == -1
            ? (<View></View>)
            : (this.state.sdcardStatus != 1 && this.state.sdcardStatus != 5
              ? [sdCardView]
              : [noSDCardView]
            )
        }
        <ChoiceDialog
          visible={this.state.showSelectMode}
          dialogStyle={{ itemSubtitleNumberOfLines: 2 }}
          title={LocalizedStrings['sds_record_mod']}
          options={
            ['1', '2'].map((item) => {
              return {
                title: LocalizedStrings[`sds_record_mod${item}`],
                subtitle: LocalizedStrings[`sds_record_mod${item}_detail`]
              };
            })
          }
          selectedIndexArray={this.state.motionRecord == 0 ? [1] : [0]}
          onDismiss={() => this.setState({ showSelectMode: false })}
          onSelect={(index) => this._onModeValueWillChange(index == 1 ? 0 : 1)}
        />
        <MessageDialog
          visible={this.state.showFormatConfirm}
          title={LocalizedStrings['sds_format']}
          message={LocalizedStrings['sds_format_alert']}
          onDismiss={() => this.setState({ showFormatConfirm: false })}
          buttons={[
            { text: LocalizedStrings["action_cancle"], callback: () => this.setState({ showFormatConfirm: false }) },
            { text: LocalizedStrings["action_confirm"], callback: () => this._formatSdCard() }
          ]}
        />
        <MessageDialog
          visible={this.state.showExitConfirm}
          title={LocalizedStrings['sds_exit']}
          message={LocalizedStrings['sds_exit_alert']}
          onDismiss={() => this.setState({ showExitConfirm: false })}
          buttons={[
            { text: LocalizedStrings["action_cancle"], callback: () => this.setState({ showExitConfirm: false }) },
            { text: LocalizedStrings["action_confirm"], callback: () => this._exitSdCard() }
          ]}
        />
        <CancelableProgressDialog
          ref={(ref) => {
            this.cancelableProgressDialog = ref;
          }}
          loadingText={LocalizedStrings["formating_error"]}
     
        >
        </CancelableProgressDialog>
      </View>
    );
  }

  componentDidMount() {
    this.props.navigation.setParams({
      title: LocalizedStrings['sds_title'],
      type: 'dark',
      style: { backgroundColor: '#FFF' },
      onPressLeft: () => { this.props.navigation.goBack(); }
    });


    StorageKeys.IS_VIP_STATUS.then((res) => {
      this.setState({ isVip: res });
    }).catch(() => {
      this.setState({ isVip: false });
    });

    StorageKeys.IS_INTERNATIONAL_SERVER.then((res) => {
      this.setState({ isInternationalServer: res });
    }).catch(() => {
      this.setState({ isInternationalServer: false });
    });

    this.willFocusSubscription = this.props.navigation.addListener(
      'willFocus', () => {
        StatusBar.setBarStyle('dark-content'); // 白底黑字 测试过的机型都有效：华为荣耀V9，红米Note4X，小米Mix2
        this._getSetting();
      }
    );

    let language = Host.locale.language || "en";
    let isNoneChinaLand = language != "zh" && language != "tw" && language != "hk";
    this.setState({ hideSdcardStatus: isNoneChinaLand });
    this.getInfoIntervalID = 0;
  }

  componentWillUnmount() {
    if (this.getInfoIntervalID > 0) {
      clearInterval(this.getInfoIntervalID);
      this.getInfoIntervalID = 0;
    }

    this.willFocusSubscription.remove();
  }

  _getSetting() {

    CameraPlayer.getInstance().getSdcardStatus()
      .then(({ sdcardCode, recordMode, totalSize, videoSize, idleSize }) => {
        this.setState({
          sdcardStatus: sdcardCode,
          motionRecord: recordMode,
          totalSize: totalSize,
          videoSize: videoSize,
          idleSize: idleSize
        });
      })
      .catch((error) => {
        Toast.fail('c_get_fail', error.error);
      });
  }

  _onEnableValueChange(value) {

    Toast.loading('c_setting');
    if (VersionUtil.isUsingSpec(Device.model)) {
      let newValue = value ? 1 : 2;
      let param = { ...CAMERA_CONTROL_SEPC_PARAMS[2], value: newValue };
      Service.spec.setPropertiesValue([param])
        .then((result) => {
          let isOk = result[0].code == 0;
          if (isOk) {
            this.setState({ motionRecord: newValue });
            Toast.success('c_set_success');
          } else {
            this.setState({ motionRecord: this.state.motionRecord });
            Toast.success('c_set_fail');
          }
        })
        .catch((err) => {
          this.setState({ motionRecord: this.state.motionRecord });
          Toast.success('c_set_fail');
        });
    } else {
      let newValue = value ? 'on' : 'stop';
      let valueInt = value ? 1 : 2;
      Device.getDeviceWifi().callMethod("set_motion_record", [
        newValue
      ]).then((res) => {
        this.setState({
          motionRecord: res.result == 1 ? valueInt : this.state.motionRecord
        });
        Toast.success('c_set_success');
      }).catch((err) => {
        this.setState({
          motionRecord: this.state.motionRecord
        });
        Toast.fail('c_set_fail', err);
      });
    }

  }

  _onModeValueWillChange(value) {
    this.setState({
      showSelectMode: false
    });

    Toast.loading('c_setting');
    if (VersionUtil.isUsingSpec(Device.model)) {
      let param = { ...CAMERA_CONTROL_SEPC_PARAMS[2], value: value }
      Service.spec.setPropertiesValue([param])
        .then((result) => {
          let success = result[0].code == 0;
          if (success) {
            this.setState({
              motionRecord: value
            });
            Toast.success('c_set_success');
          } else {
            this.setState({
              motionRecord: this.state.motionRecord
            });
            Toast.fail('c_set_fail');
          }
        })
        .catch((err) => {
          this.setState({
            motionRecord: this.state.motionRecord
          });
          Toast.fail('c_set_fail');
        });
    } else {
      let valueStr = "off";
      if (value == 0) {
        valueStr = "off";
      } else if (value == 1) {
        valueStr = "on";
      }
      Device.getDeviceWifi().callMethod('set_motion_record', [
        valueStr
      ]).then((res) => {
        this.setState({
          motionRecord: res.result == 1 ? value : this.state.motionRecord
        });
        Toast.success('c_set_success');
      }).catch((err) => {
        this.setState({
          motionRecord: this.state.motionRecord
        });
        Toast.fail('c_set_fail', err);
      });
    }

  }

  _formatSdCard() {
    console.log("why!, _formatSdCard");

    this.setState({
      showFormatConfirm: false,
    });
    this.cancelableProgressDialog && this.cancelableProgressDialog.show();
    if (VersionUtil.isUsingSpec(Device.model)) {
      Service.spec.doAction({ ...CAMERA_SDCARD_SPEC_PARAMS[4], in: [] })
        .then((result) => {
          let isSuccess = result.code == 0;
          if (isSuccess) {
            setTimeout(() => {
              this._getFormatStatus();
            }, 300);
            clearInterval(this.getInfoIntervalID);

            this.getInfoIntervalID = setInterval(() => {
              this._getFormatStatus();
            }, 2000);
          } else {
            Toast.fail('sds_format_fail');
            this.cancelableProgressDialog && this.cancelableProgressDialog.hide();

          }
        })
        .catch((err) => {
          Toast.fail('sds_format_fail', err);
          this.cancelableProgressDialog && this.cancelableProgressDialog.hide();

        });

    } else {
      Device.getDeviceWifi().callMethod('sd_format', []).then((res) => {
        console.log(`why!, sd_format res: ${JSON.stringify(res)}`);

        setTimeout(() => {
          this._getFormatStatus();
        }, 300);
        clearInterval(this.getInfoIntervalID);

        this.getInfoIntervalID = setInterval(() => {
          this._getFormatStatus();
        }, 2000);

      }).catch((err) => {
        Toast.fail('sds_format_fail', err);
        this.cancelableProgressDialog && this.cancelableProgressDialog.hide();

      });
    }
  }

  _getFormatStatus() {

    CameraPlayer.getInstance().getSdcardStatus()
      .then(({ recordMode, sdcardCode, totalSize, videoSize, idleSize }) => {
        if (sdcardCode == 0) {
          this.setState({
            sdcardStatus: parseInt(sdcardCode),
            motionRecord: recordMode,
            totalSize: totalSize == 0 ? this.state.totalSize : totalSize,
            videoSize: videoSize == 0 ? this.state.videoSize : videoSize,
            idleSize: idleSize == 0 ? this.state.idleSize : idleSize
          });
          clearInterval(this.getInfoIntervalID);
          this.getInfoIntervalID = 0;
          Toast.success('sds_format_success');
          this.cancelableProgressDialog && this.cancelableProgressDialog.hide();

        } else if (sdcardCode == 4) {
          this.setState({
            sdcardStatus: parseInt(sdcardCode),
            motionRecord: recordMode
          });
        } else {
          Toast.fail('sds_format_fail');
          this.cancelableProgressDialog && this.cancelableProgressDialog.hide();
          clearInterval(this.getInfoIntervalID);
          this.getInfoIntervalID = 0;
        }
      })
      .catch((err) => {
        Toast.fail('sds_format_fail');
        this.cancelableProgressDialog && this.cancelableProgressDialog.hide();
        clearInterval(this.getInfoIntervalID);
        this.getInfoIntervalID = 0;
      });

  }

  _exitSdCard() {
    this.setState({ showExitConfirm: false });
    if (VersionUtil.isUsingSpec(Device.model)) {
      let param = { ...CAMERA_SDCARD_SPEC_PARAMS[5], in: [] }
      Service.spec.doAction(param)
        .then((result) => {
          if (result.code == 0) {
            Toast.success('sds_exit_success');
          } else {
            Toast.fail('sds_exit_fail');
          }
        })
        .catch((err) => {
          Toast.fail('sds_exit_fail', err);
        });
    } else {
      Device.getDeviceWifi().callMethod('sd_umount', []).then(() => {
        Toast.success('sds_exit_success');
      }).catch((err) => {
        Toast.fail('sds_exit_fail', err);
      });
    }
    this.setState({ sdcardStatus: 1 });
  }
}

const storageStyles = StyleSheet.create({
  stateContainer: {
    width: '100%',
    backgroundColor: 'white',
    alignItems: 'center'
  },
  stageBack: {
    width: 217,
    height: 217,
    display: "flex",
    alignItems: "center"
  },
  stateImage: {
    width: '100%',
    height: '100%'
  },
  stateCover: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    display: "flex",
    alignItems: 'center'
  },
  stateCoverTitle: {
    marginTop: 66,
    fontSize: 22,
    color: 'white',
    textAlign: "center"
  },
  stateCoverDesc: {
    marginTop: 2,
    fontSize: 12,
    color: 'white',
    textAlign: "center"
  },
  stateCoverSeprate: {
    position: "absolute",
    top: 124,
    backgroundColor: 'rgba(255,255,255,0.5)',
    height: 1,
    width: '80%'
  },
  stateCoverDetail: {
    position: "absolute",
    bottom: 56,
    fontSize: 15,
    color: 'white'
  },
  totalText: {
    marginTop: 20,
    marginBottom: 30,
    fontSize: 16,
    color: 'rgba(0,0,0,0.6)'
  },
  tipsBack: {
    paddingTop: 3,
    paddingLeft: 24,
    paddingRight: 24
  },
  tips: {
    marginTop: 5,
    fontSize: 14,
    color: 'rgba(0,0,0,0.5)'
  },
  noTopBack: {
    backgroundColor: 'white',
    width: '100%',
    alignItems: 'center'
  },
  noTopImage: {
    resizeMode: 'center',
    marginTop: 25,
    width: 216
  },
  noDetailBack: {
    paddingTop: 3,
    paddingLeft: 24,
    paddingRight: 24
  },
  noGridContainer: {
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.1)'
  },
  noGrid: {
    width: '33.33333333%',
    height: 40,
    borderWidth: 0.3,
    borderColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  noText: {
    marginTop: 5,
    fontSize: 14,
    color: 'rgba(0,0,0,0.5)',
    textAlign: "center"
  },
  noTextLeft: {
    marginTop: 5,
    fontSize: 14,
    color: 'rgba(0,0,0,0.5)'
  }
});

const styles = { ...settingStyles, ...storageStyles };
