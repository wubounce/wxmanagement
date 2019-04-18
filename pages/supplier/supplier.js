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
    currentIndex:null
  },
  onLoad(option){
    this.getLicenseList()
    this.setData({
      licenise: option.repairName
    })
  },
  inputTyping: function (e) {
    let nowlicense = e.detail.value
    let mowarr = this.data.sheacchLiceniseArr.filter(item => {
      return item.shortName.includes(nowlicense)
    })
    if (!nowlicense){
      mowarr = mowarr.filter((item,index) => index < 18)
    } else {
      mowarr =mowarr
    }
    this.setData({
      liceniseArr: mowarr ? mowarr: ''
    });
    console.log(nowlicense);
  },
  // 清除输入框
  clearInput: function (e) {
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2];  //上一个页面
    //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
    prevPage.setData({
      repairName: '',
      liceniseid: ''
    })
    this.setData({
      licenise: '',
      liceniseid: ''
    })
  },
  getLicense(e){
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2];  //上一个页面
    //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
    prevPage.setData({
      repairName: e.currentTarget.dataset.license,
      liceniseid: e.currentTarget.dataset.liceniseid
    })
    this.setData({
      licenise: e.currentTarget.dataset.license,
      liceniseid: e.currentTarget.dataset.liceniseid,
      currentIndex: e.currentTarget.dataset.index
    })
  },
  getLicenseList() {
    request.getRequest(api.supplierList, { data: { pageNo: 1, pageSize: 500, contractType: 2 }}).then(res => {
      this.setData({
        liceniseArr: res.data.filter((item,index) => index < 18),
        sheacchLiceniseArr: res.data,
      });
    })
  }
});