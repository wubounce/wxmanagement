import api from '../../requests/api.js'
import utils from '../../utils/util.js'
import moment from '../../utils/moment.js'
const app = getApp()
const request = app.WxRequest;
Page({
  data: {
    inputShowed: false,
    license: "",
    licenseId: '',
    licenseList: [],
    currentIndex: null,
    timeout: null
  },
  onLoad(option) {
    this.getLicenseList()
    this.setData({
      license: option.license
    })
  },
  clearInput: function () {
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2];  //上一个页面
    //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
    prevPage.setData({
      license: '',
      licenseId: ''
    })
    this.setData({
      license: '',
      licenseId: ''
    })
  },
  inputTyping: function (e) {
    let inputVal = e.detail.value
    wx.showLoading({
      title: '正在加载...',
    })
    this.data.timeout = setTimeout(() => {
      request.getRequest(api.frontList, { data: { pageNo: 1, pageSize: 18, licenseLk: inputVal } }).then(res => {
        wx.hideLoading()
        const chooseList = res.data;
        this.setData({
          licenseList: chooseList ? chooseList : ''
        });
        this.setData({
          timeout: null
        })
      });
    }, 500);
  },
  getLicense(e) {
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1];   //当前页面
    var prevPage = pages[pages.length - 2];  //上一个页面

    //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
    prevPage.setData({
      license: e.currentTarget.dataset.license,
      licenseId: e.currentTarget.dataset.licenseid
    })
    this.setData({
      license: e.currentTarget.dataset.license,
      licenseId: e.currentTarget.dataset.licenseid,
      currentIndex: e.currentTarget.dataset.index
    })
  },
  getLicenseList() {
    request.getRequest(api.frontList, { data: { pageNo: 1, pageSize: 18 } }).then(res => {
      this.setData({
        licenseList: res.data,
      });
    })
  }
});