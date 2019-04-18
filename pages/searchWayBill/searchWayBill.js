import api from '../../requests/api.js'
import utils from '../../utils/util.js'
import moment from '../../utils/moment.js'
const app = getApp()
const request = app.WxRequest;
Page({
  data: {
    inputShowed: false,
    wayBillNum: "",
    wayBillId: '',
    truckLicense: '',
    driverName: '',
    routeName: '',
    status: '',
    wayBillList: [],
    currentIndex: null,
    timeout: null
  },
  onLoad(option) {
    this.getWayBill()
    console.log(option)
    this.setData({
      wayBillNum: option.wayBillNum
    })
  },
  clearInput: function () {
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2];  //上一个页面
    //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
    prevPage.setData({
      wayBillNum: '',
      wayBillId: '',
      truckLicense: '',
      driverName: '',
      routeName: '',
      status: '',
    })
    this.setData({
      wayBillNum: '',
      wayBillId: '',
      truckLicense: '',
      driverName: '',
      routeName: '',
      status: '',
    })
  },
  inputTyping: function (e) {
    let inputVal = e.detail.value
    wx.showLoading({
      title: '正在加载...',
    })
    this.data.timeout = setTimeout(() => {
      request.getRequest(api.filterMethod, { data: { fieldName: 'num', outPutFiled: 'id,num,truck_license,driver_name,route_name,status', returnNum: 10, tableName: 't_waybill', fieldValue: inputVal } }).then(res => {
        wx.hideLoading()
        const chooseList = res.data;
        chooseList.forEach(item=> {
          item.truckLicense = item.truck_license;
          item.driverName = item.driver_name;
          item.routeName = item.route_name;
          switch(item.status) {
            case 0:
             item.status = '待下发'
            break;
            case 1:
             item.status = '待接受'
            break;
            case 2:
             item.status = '待发车'
            break;
            case 3:
             item.status = '运输中'
            break;
            case 4:
             item.status = '已送达'
            break;
            case 5:
             item.status = '已完成'
            break;
            case 6:
             item.status = '已作废'
            break;
          }
        })
        this.setData({
          wayBillList: chooseList ? chooseList : ''
        });
        this.setData({
          timeout: null
        })
      });
    }, 500);
  },
  getLicense(e) {
    console.log(e);
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1];   //当前页面
    var prevPage = pages[pages.length - 2];  //上一个页面

    //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
    console.log(1)
    prevPage.setData({
      wayBillNum: e.currentTarget.dataset.waybillnum,
      wayBillId: e.currentTarget.dataset.waybillid,
      truckLicense: e.currentTarget.dataset.trucklicense,
      driverName: e.currentTarget.dataset.drivername,
      routeName: e.currentTarget.dataset.routename,
      status: e.currentTarget.dataset.status,
    })
    console.log(2)
    this.setData({
      wayBillNum: e.currentTarget.dataset.waybillnum,
      wayBillId: e.currentTarget.dataset.waybillid,
      currentIndex: e.currentTarget.dataset.index,
      truckLicense: e.currentTarget.dataset.trucklicense,
      driverName: e.currentTarget.dataset.drivername,
      routeName: e.currentTarget.dataset.routename,
      status: e.currentTarget.dataset.status,
    })
    console.log(3)
  },
  getWayBill() {
    request.getRequest(api.waybillList, { data: { pageNo: 1, pageSize: 10 } }).then(res => {
      const resData = res.data;
      resData.forEach(item=> {
        switch(item.status) {
          case 0:
           item.status = '待下发'
          break;
          case 1:
           item.status = '待接受'
          break;
          case 2:
           item.status = '待发车'
          break;
          case 3:
           item.status = '运输中'
          break;
          case 4:
           item.status = '已送达'
          break;
          case 5:
           item.status = '已完成'
          break;
          case 6:
           item.status = '已作废'
          break;
        }
      })
      this.setData({
        wayBillList: res.data,
      });
    })
  }
});