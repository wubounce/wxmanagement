import api from '../../requests/api.js'
import utils from '../../utils/util.js'
import moment from '../../utils/moment.js'
const app = getApp()
const request = app.WxRequest;
Page({
  data: {
    inputShowed: false,
    licenise: "",
    liceniseid: '',
    liceniseArr: [],
    sheacchLiceniseArr: [],
    currentIndex: null,
    siteflag:null,
    mowarr: [],
    timeout: null
  },
  onLoad(option) {
    this.setData({
      siteflag: option.siteflag,
      licenise: option.license
    });
    this.getLicenseList()
  },
  // 清除输入框
  clearInput: function (e) {
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2];  //上一个页面
    //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
    if (this.data.siteflag === 'startSiteId'){
      prevPage.setData({
        startSite: '',
        startSiteId: '',
        baseId: ''
      })
    } else if (this.data.siteflag === 'endSiteId'){
      prevPage.setData({
        endSite: '',
        endSiteId: '',
      })
    }else {
      let tag = Number(this.data.siteflag)
      let name = "waySitItems[" + tag + "].name"
      let id = "waySitItems[" + tag + "].id"
      prevPage.setData({
        [name] : '',
        [id] : '',
      })
    }
    this.setData({
      licenise: '',
      liceniseid: '',
    })
  },
  inputTyping: function (e) {
    let nowlicense = e.detail.value
      wx.showLoading({
        title: '正在加载...',
      })
      this.data.timeout = setTimeout(() => {
        request.getRequest(api.siteapi, { data: { pageNo: 1, pageSize: 18, nameLk: nowlicense } }).then(res => {
          wx.hideLoading()
          const mowarr = res.data;
          this.setData({
            liceniseArr: mowarr ? mowarr : ''
          });
          this.setData({
            timeout: null
          })
        });
      }, 500);
  },
  getLicense(e) {
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2];  //上一个页面
    //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
    if (this.data.siteflag === 'startSiteId'){
      prevPage.setData({
        startSite: e.currentTarget.dataset.license,
        startSiteId: e.currentTarget.dataset.licenseid,
        baseId: e.currentTarget.dataset.baseid
      })
    } else if (this.data.siteflag === 'endSiteId'){
      prevPage.setData({
        endSite: e.currentTarget.dataset.license,
        endSiteId: e.currentTarget.dataset.licenseid,
      })
    }else {
      let tag = Number(this.data.siteflag)
      let name = "waySitItems[" + tag + "].name"
      let id = "waySitItems[" + tag + "].id"
      prevPage.setData({
        [name] : e.currentTarget.dataset.license,
        [id] : e.currentTarget.dataset.licenseid,
      })
    }
    this.setData({
      licenise: e.currentTarget.dataset.license,
      liceniseid: e.currentTarget.dataset.licenseid,
      currentIndex: e.currentTarget.dataset.index
    })
  },
  getLicenseList() {
    wx.showLoading({
      title: '加载列表中...',
    })
    request.getRequest(api.siteapi,{data:{pageNo:1,pageSize:20}}).then(res => {
      this.setData({
        liceniseArr: res.data.filter((item,index) => index < 18),
        sheacchLiceniseArr: res.data,
      });
      wx.hideLoading()
    })
  }
});