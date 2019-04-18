Page({
  data: {
    num:'',
    routeName:'',
    driverName:'',
    truckLicense:'',
    driverPhone: ''
  },
  onLoad: function (options) {
    this.setData({
      num: options.num,
      routeName: options.routeName,
      driverName: options.driverName,
      truckLicense: options.truckLicense,
      driverPhone: options.driverPhone
    })
    this._getBillList();
  },
  back() {
    wx.navigateBack({
      delta: 2
    });
  },
  _getBillList() {
    let pages = getCurrentPages();//当前页面
    let prevPage = pages[pages.length-3];//上一页面
    prevPage.getWaybillList();
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