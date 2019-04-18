Page({
  data: {
    num:'',
    routeName:'',
    driverName:'',
    truckLicense:''
  },
  onLoad: function (options) {
      this.setData({
        num: options.num,
        routeName: options.routeName,
        driverName: options.driverName,
        truckLicense: options.truckLicense
      })
  },
})