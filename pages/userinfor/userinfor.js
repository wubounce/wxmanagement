import api from '../../requests/api.js'
import utils from '../../utils/util.js'
import moment from '../../utils/moment.js'
import WxValidate from '../../plugins/wx-validate/WxValidate';

const app = getApp()
const request = app.WxRequest;

Page({
  data: {
    userInfo:{}
  },
  onLoad: function (options) {
    this.setData({
      userInfo: app.globalData.userInfo
    })
  },
  logout(){
    request.postRequest(api.logout, {
      header: {
        'Accept': 'application/json, text/plain, */*'
      },
    }).then(res => {
      if (res.result) {
        wx.reLaunch({ url: '../login/login' })
      } else {
        wx.showModal({
          confirmColor: '#666',
          content: res.message,
          showCancel: false,
        })
      }
    })
  }
})