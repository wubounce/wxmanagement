// pages/historySearch/historySearch.js
import moment from '../../utils/moment.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    startDate: "开始日期",
    endDate: "结束日期",
    wayBillNum: '',
    fromCity: '',
    toCity: '',
    fromId: null,
    toId: null,
    clear: false,
    days:[{day: '最近7天', data:7},{day: '最近15天', data: 15},{day: '最近30天', data:30}],
    current: '',
    license: '',
    licenseId: '',
    driver: '',
    driverId: '',
    startBase: '',
    startBaseId: '',
    endBase: '',
    endBaseId: '',
    statusList: [
      {value: '0', label: '待下发'},
      { value: '1', label: '待接受' },
      { value: '2', label: '待发车' },
      { value: '3', label: '运输中' },
      { value: '4', label: '已送达' },
      { value: '5', label: '已完成' },
      { value: '6', label: '已作废' }
    ],
    statusLabel: '',
    statusValue: ''
  },
  startDateChange: function (e) {
    this.setData({
      startDate: e.detail.value
    })
  },
  endDateChange: function (e) {
    this.setData({
      endDate: e.detail.value
    })
  },
  onLoad: function (options) {
  },
  // 跳转到车辆选择页面
  goCar(e) {
    wx.navigateTo({
      url: '../searchLicense/searchLicense?license=' + this.data.license
    })
  },
  // 跳转到司机选择页面
  goDriver(e) {
    wx.navigateTo({
      url: '../searchDriver/searchDriver?driver=' + this.data.driver
    })
  },
  // 跳转到基地选择页面
  goStart(e) {
    wx.navigateTo({
      url: '../searchBase/searchBase?base=' + this.data.startBase + '&type=1'
    })
  },
  // 跳转到基地选择页面
  goEnd(e) {
    wx.navigateTo({
      url: '../searchBase/searchBase?base=' + this.data.endBase + '&type=2'
    })
  },
    // 跳转到调度单号选择页面
  goWaybill(e) {
    wx.navigateTo({
        url: '../searchWayBill/searchWayBill?wayBillNum=' + this.data.wayBillNum
    })
  },
  // 点击确定搜索
  search() {
    const payload = {};
    if (this.data.startDate !== '开始日期') { payload.createTimeAfter = this.data.startDate + ' 00:00:00';}
    if (this.data.endDate !== '结束日期') { payload.createTimeBefore = this.data.endDate + ' 23:59:59';}
    if (this.data.licenseId) { payload.truckId = this.data.licenseId;}
    if (this.data.driverId) { payload.driverId = this.data.driverId;}
    if (this.data.statusValue) { payload.statusIn = this.data.statusValue;}
    if (this.data.startBaseId) { payload.baseIdIn = this.data.startBaseId; }
    if (this.data.endBaseId) { payload.toBaseIdIn = this.data.endBaseId; }
    if (this.data.wayBillNum) { payload.num = this.data.wayBillNum; }
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2];  //上一个页面
    prevPage.setData({
      searchForm: payload,
      searchMore: true,
      currentTab: 4,
      pageSize: 10
    })
    // 触发上个页面的方法
    prevPage.getWaybillList(payload);
    setTimeout(() => {
      wx.navigateBack({
        delta: 1
      })
    }, 300);
  },
  chooseDay(e) {
    const data = e.currentTarget.dataset.data
    this.setData({
      current: e.currentTarget.dataset.index,
      startDate: moment().add(-data,'day').format('YYYY-MM-DD'),
      endDate: moment().format('YYYY-MM-DD')
    })
  },
  // 选择任务状态picker
  bindPickerChange (e) {
    console.log(e)
    if (e.detail.value === '0') {
      this.setData({
        statusLabel: '待下发'
      })
    } else if (e.detail.value === '1') {
      this.setData({
        statusLabel: '待接受'
      })
    } else if (e.detail.value === '2') {
      this.setData({
        statusLabel: '待发车'
      })
    } else if (e.detail.value === '3') {
      this.setData({
        statusLabel: '运输中'
      })
    } else if (e.detail.value === '4') {
      this.setData({
        statusLabel: '已送达'
      })
    } else if (e.detail.value === '5') {
      this.setData({
        statusLabel: '已完成'
      })
    } else if (e.detail.value === '6') {
      this.setData({
        statusLabel: '已作废'
      })
    }
    this.setData({
      statusValue: e.detail.value
    })
  }
})