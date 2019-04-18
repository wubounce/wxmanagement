Page({
  data: {
    wayBillNum: '',
    routeName: '',
    status: '',
    statusLabel: ''
  },
  onLoad: function (options) {
    console.log(options)
    this.setData({
      wayBillNum: options.wayBillNum,
      routeName: options.routeName,
      status: options.status, // 旧的状态
      statusLabel: options.statusLabel, // 变更后的状态
    })
  },
  back() {
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2];  //上一个页面
    prevPage.setData({
      wayBillNum: '',
      wayBillId: '',
      truckLicense: '',
      driverName: '',
      routeName: '',
      status: '',
      statusValue: '',
      statusLabel: ''
    })
    wx.navigateBack({
      delta: 1
    });
  }
})