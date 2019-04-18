Page({
  data: {
    issuccess: ''
  },
  onLoad: function (options) {
    this.setData({
      issuccess: options.issuccess
    })
  },
  back() {
    wx.navigateBack({
      delta:1
    })
  }
})