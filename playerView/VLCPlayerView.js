/**
 * updateed by chenliang on 2018/12/28
 */
import React, {Component} from 'react';
import {
    StyleSheet,
    Text,
    View,
    Dimensions,
    TouchableOpacity,
    ActivityIndicator,
    StatusBar,
    BackHandler,
    Modal,
    Platform,
} from 'react-native';
import VLCPlayer from '../VLCPlayer';
import PropTypes from 'prop-types';
import TimeLimt from './TimeLimit';
import ControlBtn from './ControlBtn';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {getStatusBarHeight} from './SizeController';
import RNLog from "../../../src/Main/Common/utils/RNLog";

const statusBarHeight = getStatusBarHeight();
let deviceHeight = Dimensions.get('window').height;
let deviceWidth = Dimensions.get('window').width;
export default class VLCPlayerView extends Component {
    static propTypes = {
        uri: PropTypes.string,
    };

    constructor(props) {
        super(props);
        this.state = {
            paused: true, //暂停
            isLoading: true,//正在加载
            loadingSuccess: false,//没有加载成功
            isFull: false,//是否全屏
            currentTime: 0.0,//当前播放时间点
            totalTime: 0.0,//总时长
            showControls: false,//是否展示底部控件 比如播放 停止 全屏 进度调控
            seek: 0, //视屏播放的位置
            isError: false,//异常情况
            isEnding: false,
        };
        this.touchTime = 0;
        this.changeUrl = false;
        //this.isEnding = false;
        this.reloadSuccess = false;//是否重新加载
    }

    static defaultProps = {
        initPaused: false,
        source: null,
        seek: 0,
        playInBackground: false,
        isAd: false,
        autoplay: true,
    };

    componentDidMount() {
        if (this.props.isFull) {
            this.setState({
                showControls: true,
            });
        }
        setTimeout(() => this._toFullScreen(), 0)
    }

    componentWillUnmount() {
        if (this.bufferInterval) {
            clearInterval(this.bufferInterval);
            this.bufferInterval = null;
        }

    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.uri !== prevProps.uri) {
            console.log("componentDidUpdate");
            this.changeUrl = true;
        }
    }

    onPressOut = () => {
        let currentTime = new Date().getTime();
        if (this.touchTime === 0) {
            this.touchTime = currentTime;
            this.setState({showControls: !this.state.showControls});
        } else {
            if (currentTime - this.touchTime >= 500) {
                this.touchTime = currentTime;
                this.setState({showControls: !this.state.showControls});
            }
        }
    }

    getSource = (uri) => {
        let source = {};
        if (uri) {
            if (uri.split) {
                source = {uri: this.props.uri};
            } else {
                source = uri;
            }
        }
        return source
    }

    render() {
        let {onEnd, style, isAd, type, isFull, uri, title, onLeftPress, closeFullScreen, showBack, showTitle, videoAspectRatio,} = this.props;
        let {isLoading, loadingSuccess, totalTime, showControls, isError, paused, isEnding} = this.state;
        let realShowLoding = false;
        let source = this.getSource(uri)
        if (Platform.OS === 'ios') {
            if (isLoading && type !== 'swf') {
                realShowLoding = true;
            }
        } else {
            if (isLoading) {
                realShowLoding = true;
            }
        }

        return (

            <TouchableOpacity
                activeOpacity={1}
                style={[styles.videoBtn, style]}
                onPressOut={() => this.onPressOut()}>
                {!isEnding && this.getVLCPlayer(source, videoAspectRatio)}
                {realShowLoding && !isError && this.getRealShowLoding()}
                {isError && this.getShowErrorRefresh()}
                {(showBack || isFull) && this.getShowBack(isFull, closeFullScreen, onLeftPress)}
                {totalTime > 0 && showControls && this.getShowControls(isFull, onEnd, onLeftPress)}
            </TouchableOpacity>
        );
    }

    /**
     * 得到视屏播放器View
     */
    getVLCPlayer = (source, videoAspectRatio) => {
        try {
            return (<VLCPlayer
                ref={ref => (this.vlcPlayer = ref)}
                autoplay={false}
                paused={this.state.paused}
                style={[styles.video]}
                source={source}
                videoAspectRatio={videoAspectRatio}
                onProgress={this.onProgress.bind(this)}
                onEnd={this.onEnded.bind(this)}
                onStopped={this.onEnded.bind(this)}
                onPlaying={this.onPlaying.bind(this)}
                onBuffering={this.onBuffering.bind(this)}
                onPaused={this.onPaused.bind(this)}
                progressUpdateInterval={250}
                onError={this._onError}
                onOpen={this._onOpen}
                onLoadStart={this._onLoadStart}
            />)
        } catch (e) {
            RNLog.log(e)
        }
    }

    /**
     * error refresh loading
     */
    getRealShowLoding = () => {
        return (
            <View style={styles.loading}>
                <ActivityIndicator size={'large'} animating={true} color="#fff"/>
            </View>
        )
    }

    /**
     * 报错重新加载View
     */
    getShowErrorRefresh = () => {
        return (<View style={[styles.loading, {backgroundColor: '#000'}]}>
            <Text style={{color: 'red'}}>视频播放出错,请重新加载</Text>
            <TouchableOpacity
                activeOpacity={1}
                onPress={this._reload}
                style={{
                    width: 100,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: 10,
                }}>
                <Icon name={'reload'} size={45} color="#fff"/>
            </TouchableOpacity>
        </View>)
    }

    /**
     * 返回功能
     */
    getShowBack = (isFull, closeFullScreen, onLeftPress) => {
        return (<View style={styles.topView}>
            <View style={styles.backBtn}>
                <TouchableOpacity
                    onPress={() => {
                        // if (isFull) {
                        //     closeFullScreen && closeFullScreen();
                        // } else {
                            onLeftPress && onLeftPress();
                        // }
                    }}
                    style={styles.btn}
                    activeOpacity={0.8}>
                    <Icon name={'chevron-left'} size={30} color="#fff"/>
                </TouchableOpacity>
            </View>
        </View>)
    }

    /**
     * 底部播放进度
     */
    getShowControls = (isFull, onEnd, onLeftPress) => {
        return (<View style={[styles.bottomView]}>
            <ControlBtn
                showSlider={true}
                onEnd={onEnd}
                onLeftPress={onLeftPress}
                paused={this.state.paused}
                isFull={isFull}
                currentTime={this.state.currentTime}
                totalTime={this.state.totalTime}
                onPausedPress={this._play}
                //onFullPress={this._toFullScreen}
                onValueChange={value => {
                    this.changingSlider = true;
                    this.setState({currentTime: value});
                }}
                onSlidingComplete={value => {
                    try {
                        this.changingSlider = false;
                        if (Platform.OS === 'ios') {
                            this.vlcPlayer.resume && this.vlcPlayer.seek(Number((value / this.state.totalTime).toFixed(17)));
                        } else {
                            this.vlcPlayer.resume && this.vlcPlayer.seek(value);
                        }
                    } catch (e) {
                        RNLog.log(e)
                    }
                }}
            />
        </View>)
    }

    /**
     * 视屏播放
     * @param event
     */
    onPlaying(event) {
        this.isEnding = false;
        if (this.state.paused) {
            this.setState({paused: false});
        }
        console.log('onPlaying');
    }

    /**
     * 视屏停止
     * @param event
     */
    onPaused(event) {
        this.setState({paused: true});
        console.log('onPaused');
    }

    /**
     * 视屏缓冲
     * @param event
     */
    onBuffering(event) {
        // {type: "Buffering", bufferRate: 100, duration: 54000, currentTime: 0, position: 0, …}
        this.setState({
            isLoading: true,
            isError: false,
        });
        let duration = event.duration
        let bufferRate = event.bufferRate
        if ((duration > 0 && bufferRate == 100) || event.isPlaying|| Platform.OS == 'ios') {
            this.setState({paused: false, isLoading: false});
        } else {
            this.setState({paused: true, isLoading: true});
        }
        // this.bufferTime = new Date().getTime();
        // if (!this.bufferInterval) {
        //     this.bufferInterval = setInterval(this.bufferIntervalFunction, 250);
        // }
        console.log('onBuffering');
        console.log(event);
    }

    bufferIntervalFunction = () => {
        console.log('bufferIntervalFunction');
        let currentTime = new Date().getTime();
        let diffTime = currentTime - this.bufferTime;
        if (diffTime > 1 * 1000) {
            clearInterval(this.bufferInterval);
            this.setState({
                paused: true,
            }, () => {
                this.setState({
                    paused: false,
                    isLoading: false,
                });
            });
            this.bufferInterval = null;
            console.log('remove  bufferIntervalFunction');
        }
    };

    _onError = e => {
        console.log('_onError');
        console.log(e);
        this.reloadSuccess = false;
        this.setState({
            isError: true,
        });
    };

    _onOpen = e => {
        console.log('onOpen');
        console.log(e);
    };

    _onLoadStart = e => {
        console.log('_onLoadStart');
        console.log(e);
        let {isError} = this.state;
        try {
            if (isError) {
                this.reloadSuccess = true;
                let {currentTime, totalTime} = this.state;
                if (Platform.OS === 'ios') {
                    this.vlcPlayer.seek(Number((currentTime / totalTime).toFixed(17)));
                } else {
                    this.vlcPlayer.seek(currentTime);
                }
                this.setState({
                    paused: true,
                    isError: false,
                }, () => {
                    this.setState({
                        paused: false,
                    });
                })
            } else {
                this.vlcPlayer.seek(0);
                this.setState({
                    isLoading: true,
                    isError: false,
                    loadingSuccess: false,
                    paused: true,
                    currentTime: 0.0,
                    totalTime: 0.0,
                }, () => {
                    this.setState({
                        paused: false,
                    });
                })
            }
        } catch (e) {
            RNLog.log(e)
        }
    };

    _reload = () => {
        try {
            if (!this.reloadSuccess) {
                this.vlcPlayer.resume && this.vlcPlayer.resume(false);
            }
        } catch (e) {
            RNLog.log(e)
        }
    };

    /**
     * 视屏进度变化
     * @param event
     */
    onProgress(event) {
        console.log('onProgress')
        console.log(event)

        let currentTime = event.currentTime;
        let duration = event.duration;

        let loadingSuccess = false;
        if (currentTime > 0 || this.state.currentTime > 0) {
            loadingSuccess = true;
        }
        if (!this.changingSlider) {
            if (currentTime === 0 || !event.isPlaying || currentTime === this.state.currentTime * 1000) {
                // this.setState({paused: true});
            } else {
                this.setState({
                    showControls: true,
                    loadingSuccess: loadingSuccess,
                    isLoading: false,
                    isError: false,
                    progress: event.position,
                    currentTime: currentTime / 1000 > duration / 1000 ? duration / 1000 : event.currentTime / 1000,
                    totalTime: duration / 1000,
                });
            }
        }
    }

    /**
     * 视屏播放结束
     * @param event
     */
    onEnded(event) {
        console.log('onEnded ---------->')
        console.log(event)
        console.log('<---------- onEnded ')
        let {currentTime, totalTime} = this.state;
        let {onEnd, autoplay, isAd} = this.props;

        let type = event.type;
        // let position = event.position;
        if (type === 'Ended' || !event.isPlaying) {
            this.isEnding = true;
            console.log('<---------- Ended ')
            console.log(this.props.uri + ':   onEnded');
            onEnd && onEnd();
            this.vlcPlayer.resume && this.vlcPlayer.resume(false);
            this.setState({
                isLoading: false,
                paused: true,
                currentTime: event.currentTime / 1000 > event.duration / 1000 ? event.duration / 1000 : event.currentTime / 1000,
                totalTime: event.duration / 1000,
                isEnding: true
            });
        }

        // try {
        // if (((currentTime + 5) >= totalTime && totalTime > 0)) {
        //     this.setState({
        //             paused: true,
        //             //showControls: true
        //         },
        //         () => {
        //             if (!this.state.isEnding) {
        //                 onEnd && onEnd();
        //                 this.vlcPlayer.resume && this.vlcPlayer.resume(false);
        //                 console.log(this.props.uri + ':   onEnded');
        //                 this.setState({
        //                     isLoading: false,
        //                     paused: true,
        //                     currentTime: event.currentTime / 1000,
        //                     totalTime: event.duration / 1000,
        //                     isEnding: true
        //                 });
        //             }
        //         },
        //     );
        // } else {
        //
        // }
        // } catch (e) {
        //     RNLog.log(e)
        // }
    }

    /**
     * 全屏
     * @private
     */
    _toFullScreen = () => {
        try {
            let {startFullScreen, closeFullScreen, isFull} = this.props;
            if (isFull) {
                closeFullScreen && closeFullScreen();
            } else {
                startFullScreen && startFullScreen();
            }
        } catch (e) {
            RNLog.log(e)
        }
    };

    /**
     * 播放/停止
     * @private
     */
    _play = () => {
        let {totalTime, currentTime, isEnding} = this.state
        if (isEnding) {
            this.setState({isEnding: false})
        }
        this.setState({paused: !this.state.paused, currentTime: currentTime, totalTime: totalTime});
    };
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    videoBtn: {
        flex: 1,
    },
    video: {
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        width: '100%',
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
        marginRight: 10,
        paddingLeft: 10,
        paddingRight: 10,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topView: {
        top: Platform.OS === 'ios' ? statusBarHeight : 0,
        left: 0,
        height: 45,
        position: 'absolute',
        width: '100%',
        //backgroundColor: 'red'
    },
    bottomView: {
        bottom: 0,
        left: 0,
        height: 50,
        position: 'absolute',
        width: '100%',
        backgroundColor: 'rgba(0,0,0,0)',
    },
    backBtn: {
        height: 45,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
    },
    btn: {
        marginLeft: 10,
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
        height: 40,
        borderRadius: 20,
        width: 40,
        paddingTop: 3,
    },
});