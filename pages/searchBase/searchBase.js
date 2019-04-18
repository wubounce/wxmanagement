import api from '../../requests/api.js'
import utils from '../../utils/util.js'
import moment from '../../utils/moment.js'
const app = getApp()
const request = app.WxRequest;
Page({
  data: {
    inputShowed: false,
    base: "",
    baseId: '',
    baseList: [],
    currentIndex: null,
    timeout: null,
    baseType: ''
  },
  onLoad(option) {
    console.log(option)
    this.getLicenseList()
    this.setData({
      base: option.base,
      baseType: option.type
    })
  },
  clearInput: function () {
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2];  //上一个页面
    //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
    if (this.data.baseType == '1') {
      prevPage.setData({
        startBase: '',
        startBaseId: ''
      })
    } else if (this.data.baseType == '2') {
      prevPage.setData({
        endBase: '',
        endBaseId: ''
      })
    }
    this.setData({
      base: '',
      baseId: ''
    })
  },
  inputTyping: function (e) {
    let inputVal = e.detail.value
    wx.showLoading({
      title: '正在加载...',
    })
    this.data.timeout = setTimeout(() => {
      request.getRequest(api.searchBase, { data: { pageNo: 1, pageSize: 18, nameLk: inputVal } }).then(res => {
        wx.hideLoading()
        const chooseList = res.data;
        this.setData({
          baseList: chooseList ? chooseList : ''
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
    if (this.data.baseType == '1') {
      prevPage.setData({
        startBase: e.currentTarget.dataset.base,
        startBaseId: e.currentTarget.dataset.baseid
      })
    } else if (this.data.baseType == '2') {
      prevPage.setData({
        endBase: e.currentTarget.dataset.base,
        endBaseId: e.currentTarget.dataset.baseid
      })
    }
    this.setData({
      base: e.currentTarget.dataset.base,
      baseId: e.currentTarget.dataset.baseid,
      currentIndex: e.currentTarget.dataset.index
    })
  },
  getLicenseList() {
    request.getRequest(api.searchBase, { data: { pageNo: 1, pageSize: 18 } }).then(res => {
      this.setData({
        baseList: res.data,
      });
    })
  }
});