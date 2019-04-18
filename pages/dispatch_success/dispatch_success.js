Page({
  data: {
    wayNum: '',
    driverName: '',
    license: '',
    planDepartureTime: '',
    driverPhone: ''
  },
  onLoad: function (options) {
    this.setData({
      wayNum: options.wayNum,
      driverName: options.driverName,
      license: options.license,
      planDepartureTime: options.planDepartureTime,
      driverPhone: options.driverPhone
    })
  },
  back() {
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2];  //上一个页面
    prevPage.setData({
      startSite: '',
      waySitItems: [
        {
          name: '',
          id: 0
        }
      ],
      endSite: '',
      license: '',
      driverName: ''
    })
    wx.navigateBack({
      delta: 1
    });
  },
  call() {
    wx.makePhoneCall({
      phoneNumber: this.data.driverPhone,
      success: function () {
        console.log("拨打电话成功！")
      },
      fail: function () {
        console.log("拨打电话失败！")
      }
    })
  }
})