/**
 * Created by yuanzhou.xu on 2018/5/16.
 */
import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Slider from 'react-native-slider';
import PropTypes from 'prop-types';
import TimeLimt from './TimeLimit';

export default class ControlBtn extends Component {
  _getTime = (data = 0) => {
    let hourCourse = Math.floor(data / 3600);
    let diffCourse = data % 3600;
    let minCourse = Math.floor(diffCourse / 60);
    let secondCourse = Math.floor(diffCourse % 60);
    let courseReal = '';
    if (hourCourse) {
      if (hourCourse < 10) {
        courseReal += '0' + hourCourse + ':';
      } else {
        courseReal += hourCourse + ':';
      }
    }
    if (minCourse < 10) {
      courseReal += '0' + minCourse + ':';
    } else {
      courseReal += minCourse + ':';
    }
    if (secondCourse < 10) {
      courseReal += '0' + secondCourse;
    } else {
      courseReal += secondCourse;
    }
    return courseReal;
  };

  render() {
    let {
      paused,
      muted,
      isFull,
      showSlider,
      onPausedPress,
      onMutePress,
      onFullPress,
      onValueChange,
      onSlidingComplete,
      currentTime,
      totalTime,
      style,
      onReload
    } = this.props;
    return (
        <View style={styles.controlContainer}>
          <TouchableOpacity style={styles.controlContent} activeOpacity={1}>
            <View style={styles.controlContent2}>
              <View style={{flexDirection:'row'}}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  onPausedPress && onPausedPress(!paused);
                }}
                style={{ width: 35, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={paused ? 'play' : 'pause'} size={26} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  onMutePress && onMutePress(!paused);
                }}
                style={{ width: 35, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={muted ? 'volume-off' : 'volume-high'} size={24} color="#fff" />
              </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                  onReload && onReload();
                }}
                  style={{ width: 35, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={'reload'} size={24} color="#fff"/>
                </TouchableOpacity>
              </View>
              {showSlider &&
                totalTime > 0 && (
                  <View
                    style={{
                      flex: 1,
                      alignItems: 'center',
                      flexDirection: 'row',
                      //justifyContent: 'space-between',
                    }}>
                    <View
                      style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: 50,
                        minWidth: 50,
                      }}>
                      <Text style={{ fontSize: 11, color: '#fff' }}>
                        {this._getTime(currentTime) || 0}
                      </Text>
                    </View>
                    <View style={styles.progress}>
                      <Slider
                        minimumTrackTintColor="#30a935"
                        thumbStyle={styles.thumb}
                        style={{ width: '100%' }}
                        value={currentTime}
                        maximumValue={totalTime}
                        step={1}
                        onSlidingStart={(value)=>{
                          console.log('onSlidingStart',value)
                        }}
                        onValueChange={value => {
                          onValueChange && onValueChange(value);
                        }}
                        onSlidingComplete={value => {
                          onSlidingComplete && onSlidingComplete(value);
                        }}
                      />
                    </View>
                    <View
                      style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: 50,
                        minWidth: 50,
                      }}>
                      <Text style={{ fontSize: 11, color: '#fff' }}>
                        {this._getTime(totalTime) || 0}
                      </Text>
                    </View>
                  </View>
                )}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  onFullPress && onFullPress(!isFull);
                }}
                style={{ width: 35, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={isFull ? 'fullscreen-exit' : 'fullscreen'} size={26} color="#fff" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //backgroundColor: '#000',
  },
  controls: {
    width: '100%',
    height: 37,
  },
  rateControl: {
    flex: 0,
    flexDirection: 'row',
    marginTop: 10,
    marginLeft: 10,
    //backgroundColor: 'rgba(0,0,0,0.5)',
    width: 120,
    height: 30,
    justifyContent: 'space-around',
    alignItems: 'center',
    borderRadius: 10,
  },
  controlOption: {
    textAlign: 'center',
    fontSize: 13,
    color: '#fff',
    width: 30,
    //lineHeight: 12,
  },
  controlContainer: {
    flex: 1,
    //padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },

  controlContent: {
    width: '100%',
    height: 37,
    //borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  controlContent2: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  progress: {
    flex: 1,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumb: {
    width: 6,
    height: 18,
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  loading: {
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 0,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  ad: {
    backgroundColor: 'rgba(255,255,255,1)',
    height: 30,
    paddingLeft: 10,
    paddingRight: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
