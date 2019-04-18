import api from '../../requests/api.js'
import utils from '../../utils/util.js'
import moment from '../../utils/moment.js'
import WxValidate from '../../plugins/wx-validate/WxValidate';

const app = getApp()
const request = app.WxRequest;

Page({
  data: {
    license:'',
    statusList: [
      { value: '1', label: '待接受' },
      { value: '3', label: '运输中' },
      { value: '4', label: '已送达' }
    ],
    statusLabel: '',
    statusValue: '',
    wayBillNum: '',
    wayBillId: '',
    truckLicense: '',
    driverName: '',
    routeName: '',
    status: '',
  },
  initValidate() {
    // 验证字段的规则
    const rules = {
      license: {
        required: true
      }
    }
    // 验证字段的提示信息，若不传则调用默认的信息
    const messages = {
      license: {
        required: '车牌号不能为空'
      }
    }
    // 创建实例对象
    this.WxValidate = new WxValidate(rules, messages)
  },
  onLoad: function (options) {
  },
  // 选择任务状态picker
  bindPickerChange (e) {
    console.log(e)
    if (e.detail.value === '0') {
      this.setData({
        statusLabel: '待接受',
        statusValue: 1
      })
    } else if (e.detail.value === '1') {
      this.setData({
        statusLabel: '运输中',
        statusValue: 3
      })
    } else if (e.detail.value === '2') {
      this.setData({
        statusLabel: '已送达',
        statusValue: 4
      })
    }
  },
  // 确认修改
  beChange () {
    const id = this.data.wayBillId;
    const status = this.data.statusValue;
    console.log(this.data.status)
    if (this.data.status === '待下发' || this.data.status === '已完成' || this.data.status === '已作废') {
      wx.showModal({
        title: '提示',
        content: this.data.status + '任务不允许修改状态',
        showCancel: false,
        confirmColor: '#000000',
      })
      return
    }
    if (!status) {
      wx.showModal({
        title: '提示',
        content: '请选择要变更的状态',
        showCancel: false,
        confirmColor: '#000000',
      })
      return
    }
    console.log(this.data.statusLabel)
    wx.showModal({
      title: '提示',
      content: '确认修改调度单状态？',
      showCancel: true,
      cancelText: '取消',
      cancelColor: '#000000',
      confirmText: '确定',
      confirmColor: '#3CC51F',
      success: res => {
        if(res.confirm){
          request.postRequest(api.changeStatus, {data:{id: id, status: status }}).then(res=> {
            if (res.result) {
              wx.navigateTo({
                url: '../changeSuccess/changeSuccess?wayBillNum='+this.data.wayBillNum+'&routeName='+this.data.routeName+'&status='+this.data.status+'&statusLabel='+this.data.statusLabel,
                success: function(res){
                  // success
                }
              })
            }
          })
        }
      }
    })
  },
  goBack () {
    wx.navigateBack({
      delta: 1, // 回退前 delta(默认为1) 页面
      success: function(res){
        // success
      }
    })
  }
})