// components/t_navbar/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    device_name: String,
    device_id: String
  },

  /**
   * 组件的初始数据
   */
  data: {
    device_name: '未知设备',
    marginTop: '40rpx',
    height: 'auto',
  },

  lifetimes: {
    attached: function () {
      const { statusBarHeight, system } = wx.getSystemInfoSync();
      const height = system.indexOf('iOS') > -1 ? '88rpx' : '96rpx'
      this.setData({ height, marginTop: `${statusBarHeight}px`})
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    backPage: function () {
      wx.navigateBack({
        delta: 1,
      })
    },
    jumpEditPage: function() {
      this.triggerEvent('jumpTodeviceEditPage',{})
    }
  }
})
