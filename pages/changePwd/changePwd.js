import api from '../../requests/api.js'
import utils from '../../utils/util.js'
import moment from '../../utils/moment.js'
import WxValidate from '../../plugins/wx-validate/WxValidate';

const app = getApp()
const request = app.WxRequest;

Page({
  data: {
    oldPassword:'',
    newPassword:'',
    newPasswordCheck:'',
  },
  initValidate() {
    // 验证字段的规则
    const rules = {
      oldPassword: {
        required: true,
        rangelength: [6, 20]
      },
      newPassword: {
        required: true,
        rangelength: [6, 20]
      },
      newPasswordCheck: {
        required: true,
        rangelength: [6, 20]
      }
    }
    // 验证字段的提示信息，若不传则调用默认的信息
    const messages = {
      oldPassword: {
        required: '旧密码不能为空',
        rangelength: '密码长度为6-20位',
      },
      newPassword: {
        required: '新密码不能为空',
        rangelength: '新密码长度为6-20位',
      },
      newPasswordCheck: {
        required: '确认新密码不能为空',
        rangelength: '确认新密码为6-20位',
      }
    }
    // 创建实例对象
    this.WxValidate = new WxValidate(rules, messages)
  },
  onLoad: function (options) {
    this.initValidate()
  },
  changePwd(e) {
    const that = this;
    if (!that.WxValidate.checkForm(e)) {
      const error = that.WxValidate.errorList[0]
      wx.showModal({
        confirmColor: '#666',
        content: error.msg,
        showCancel: false,
      })
      return false
    }
    if (e.detail.value.newPassword !== e.detail.value.newPasswordCheck) {
      wx.showModal({
        confirmColor: '#666',
        content: '确认新密码与新密码必须一致',
        showCancel: false,
      })
      return false
    }
    const params = { oldPassword: e.detail.value.oldPassword, newPassword: e.detail.value.newPassword  };
    request.postRequest(api.changePassword, {
      data: params,
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    .then(res => {
      if (res.result) {
        wx.showModal({
          confirmColor: '#666',
          content: '修改密码成功',
          showCancel: false,
        })
        wx.getStorage({
          key: 'username',
          success: function(res) {
            console.log(res.data)
            app.globalData.userInfo = res.data;
          }
        })
        wx.navigateTo({ url: '../login/login' })
      } else {
        wx.showModal({
          confirmColor: '#666',
          content: res.data.message ? res.data.message : res.message,
          showCancel: false,
        })
      }
    })
  },
})