import { getDevFunctions, getDeviceDetails, deviceControl } from '../../../utils/api/device-api';
import { getStatiHours, getStatiDays, getStatiMonths, getStatiAll, getStatiType } from '../../../utils/api/statistics-api';
import wxMqtt from '../../../utils/mqtt/wxMqtt';

let wxCharts = require('../../../utils/wxcharts.js');
let columnChart = null;

let {
    powerOn,
    powerOff,
    logger,
    controller,
    timer,
    bgImage,
    statistics
} = require('./img');

Page({
    /**
     * 页面的初始数据
     */
    data: {
        statusCount: 0,
        loading: true,
        device_name: '',
        titleItem: {
            name: '',
            value: '',
        },
        roDpList: {}, //只上报功能点
        rwDpList: {}, //可上报可下发功能点
        isRoDpListShow: false,
        isRwDpListShow: false,
        imgList: {
            powerOn,
            powerOff,
            logger,
            controller,
            timer,
            bgImage,
            statistics
        }
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        const {
            device_id
        } = options
        this.setData({
            device_id
        })
        // mqtt消息监听
        wxMqtt.on('message', (topic, newVal) => {
            const {
                status
            } = newVal
            this.updateStatus(status)
        })
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: async function() {
        const {
            device_id
        } = this.data
        const [{
            name,
            status,
            icon
        }, {
            functions = []
        }] = await Promise.all([
            getDeviceDetails(device_id),
            getDevFunctions(device_id),
        ]);
        this.setData({
            loading: false
        })

        //自定义toast的调用
        this.toast = this.selectComponent("#toast");

        //获得上传下发list
        const {
            roDpList,
            rwDpList
        } = this.reducerDpList(status, functions)

        // 获取头部展示功能点信息
        let titleItem = {
            name: '',
            value: '',
        };
        if (Object.keys(roDpList).length > 0) {
            let keys = Object.keys(roDpList)[0];
            titleItem = roDpList[keys];
        } else {
            let keys = Object.keys(rwDpList)[0];
            titleItem = rwDpList[keys];
        }

        const roDpListLength = Object.keys(roDpList).length
        const isRoDpListShow = Object.keys(roDpList).length > 0
        const isRwDpListShow = Object.keys(rwDpList).length > 0

        this.setData({
            titleItem,
            roDpList,
            rwDpList,
            device_name: name === "智能单插联通版" ? "乐随心控" : name,
            isRoDpListShow,
            isRwDpListShow,
            roDpListLength,
            icon
        })
    },

    // 分离只上报功能点，可上报可下发功能点
    reducerDpList: function(status, functions) {
        // 处理功能点和状态的数据
        let roDpList = {};
        let rwDpList = {};
        if (status && status.length) {
            status.map((item) => {
                const {
                    code,
                    value
                } = item;
                let isExit = functions.find(element => element.code == code);
                if (isExit) {
                    let rightvalue = value
                    // 兼容初始拿到的布尔类型的值为字符串类型
                    if (isExit.type === 'Boolean' && typeof value === 'string') {
                        rightvalue = value === 'true'
                    }
                    rwDpList[code] = {
                        code,
                        value: rightvalue,
                        type: isExit.type,
                        values: isExit.values,
                        name: isExit.name,
                    };
                } else {
                    roDpList[code] = {
                        code,
                        value,
                        name: code,
                    };
                }
            });
        }
        return {
            roDpList,
            rwDpList
        }
    },

    sendDp: function(dpCode, value) {
        const {
            device_id
        } = this.data
        deviceControl(device_id, dpCode, value)
    },

    updateStatus: function(newStatus) {
        let {
            roDpList,
            rwDpList,
            titleItem
        } = this.data

        newStatus.forEach(item => {
            const {
                code,
                value
            } = item

            if (typeof roDpList[code] !== 'undefined') {
                roDpList[code]['value'] = value;
            } else if (rwDpList[code]) {
                rwDpList[code]['value'] = value;
            }
        })

        // 更新titleItem
        if (Object.keys(roDpList).length > 0) {
            let keys = Object.keys(roDpList)[0];
            titleItem = roDpList[keys];
        } else {
            let keys = Object.keys(rwDpList)[0];
            titleItem = rwDpList[keys];
        }

        this.setData({
            titleItem,
            roDpList: {
                ...roDpList
            },
            rwDpList: {
                ...rwDpList
            }
        })
    },

    jumpTodeviceEditPage: function() {
        const {
            icon,
            device_id,
            device_name
        } = this.data
        wx.navigateTo({
            url: `/pages/home_center/device_manage/index?device_id=${device_id}&device_name=${device_name}&device_icon=${icon}`,
        })
    },

    //获得当前设备状态
    turnDeviceOn: function(e) {
        const switcher = this.data.rwDpList.switch,
            value = switcher ? switcher.value : "undefined";
        if (value !== "undefined") {
            this.sendDp('switch', !value)
        }
    },

    //待开发功能
    turnNoticeOn: function() {
        this.toast.showToast('功能待开发~');
    },


  /**
   * 生命周期函数--监听页面显示
   */
  onShow: async  function () {
    const { device_id } = this.data
    //const { thisDay,sum,years }  = await getStatiAll(device_id)
    const thisDaystartHour = this.formatTime(new Date().getTime(),'YMD') + '00'
    const thisDayendHour = this.formatTime(new Date().getTime(),'YMD') + '23'
    const thisDay  = await getStatiAll(device_id)
    let thisMonstart = this.formatTime(new Date().getTime(),'YM')
    const thisMon  = await getStatiMonths(device_id, thisMonstart, thisMonstart)
    const statiHours  = await getStatiHours(device_id, thisDaystartHour, thisDayendHour)
    this.setData({ 
      list_data:thisDay,
    })
    this.setData({ 
      baobiao_data:statiHours.hours,
    })
    let { months } = thisMon
    this.setData({ 
      year_data:months,
      thisdayString:this.formatTime(new Date().getTime(),'YMD'),
      thismonString:this.formatTime(new Date().getTime(),'YM'),
    })
    let windowWidth = 300;
        try {
            let res = wx.getSystemInfoSync();
            windowWidth = res.windowWidth - 30;
        } catch (options) {
            console.error('getSystemInfoSync failed!');
        }
        
        let simulationData = this.createSimulationData(statiHours.hours);
        columnChart = new wxCharts({
            canvasId: 'columnCanvas',
            type: 'column',
            categories: simulationData.categories,
            animation: true,
            series: [{
                name: '用电量',
                data: simulationData.data,
                format: function (val, name) {
                    return val + 'kwh';
                }
            }],
            xAxis: {
                disableGrid: true
            },
            yAxis: {
                title: '用电量(kwh)',
                format: function (val) {
                    return val; 
                },
                min: 0
            },
            width: windowWidth,
            height: 260,
            dataLabel: false,
            dataPointShape: true,
            extra: {
                lineStyle: 'straight'
            }
        });
    },

    byHour: async function() {
        let {
            device_id
        } = this.data
        let dateTime = this.formatTime(new Date().getTime(), 'YMD')
        let thisstartHour = dateTime + '00'
        let thisendHour = dateTime + '23'
        let statiHours = await getStatiHours(device_id, thisstartHour, thisendHour)
        this.updateData(statiHours.hours);
        //this.setData({
        //baobiao_data:statiHours.hours,
        //});
        this.setData({
            ribaodate: dateTime,
        });
    },

    byDay: async function() {
        let {
            device_id
        } = this.data
        let dateTime = this.formatTime(new Date().getTime(), 'YM')
        let thisstartDay = dateTime + '01'
        let thisendDay = dateTime + '31'
        let statiDays = await getStatiDays(device_id, thisstartDay, thisendDay)

        this.setData({
            yuebaodate: dateTime,
        });
        this.updateData(statiDays.days);
    },

    byMonth: async function() {
        let dateTime = new Date().getFullYear()
        let {
            device_id
        } = this.data
        let thisstartMon = dateTime + '01'
        let thisendMon = dateTime + '12'
        let statiMons = await getStatiMonths(device_id, thisstartMon, thisendMon)

        this.setData({
            nianbaodate: dateTime,
        });
        this.updateData(statiMons.months);
    },

    formatNumber(n) {
        n = n.toString()
        return n[1] ? n : '0' + n
    },

    formatTime(number, format) {
        let formateArr = ['Y', 'M', 'D', 'h', 'm', 's'];
        let returnArr = [];

        let date = new Date(number);
        returnArr.push(date.getFullYear());
        returnArr.push(this.formatNumber(date.getMonth() + 1));
        returnArr.push(this.formatNumber(date.getDate()));

        for (let i in returnArr) {
            format = format.replace(formateArr[i], returnArr[i]);
        }
        return format;
    },

    touchHandler: function(e) {
        columnChart.scrollStart(e);
    },

    moveHandler: function(e) {
        columnChart.scroll(e);
    },

    touchEndHandler: function(e) {
        columnChart.scrollEnd(e);
        columnChart.showToolTip(e, {
            format: function(item, category) {
                return category + ' ' + item.name + ':' + item.data
            }
        });
    },
    makeCategorySense: function(s) {
        if (s.length === 6) {
            return s.replace(/^.+(..)$/, "$1月");
        } else if (s.length === 8) {
            return s.replace(/^.+(..)$/, "$1日");
        } else if (s.length === 10) {
            return s.replace(/^.+(..)$/, "$1时");
        }
        return s;
    },

    createSimulationData: function(e) {
        //将hours的Json数据转换为图表用的索引数组和数值数组
        let arr = [];
        let yourdata = e;
        let arri = Object.keys(yourdata).map(this.makeCategorySense); //这是索引数组2021042500-23
        for (let one in yourdata) {
            let str = yourdata[one];
            //加到数组中去
            arr.push(str); //这是对应的数值数组
        }
        console.log(arri);
        return {
            categories: arri,
            data: arr
        };
    },

    updateData: function(e) {
        let simulationData = this.createSimulationData(e);
        let series = [{
            name: '用电量',
            data: simulationData.data,
            format: function(val, name) {
                return val + 'kwh';
            }
        }];
        columnChart.updateData({
            categories: simulationData.categories,
            series: series
        });
    }
});
