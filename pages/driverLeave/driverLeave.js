import api from '../../requests/api.js'
import utils from '../../utils/util.js'
import moment from '../../utils/moment.js'
import WxValidate from '../../plugins/wx-validate/WxValidate';
import regeneratorRuntime from '../../utils/regenerator-runtime/runtime.js';

const app = getApp()
const request = app.WxRequest;

Page({
  data: {
    showModal: false,
    disagreeArr: ['没有人代办您的业务', '公司有大会议展开', '无法同意，请配合工作'],
    agreeArr: ['同意请假', '好好休息', '祝您假期愉快'],
    list: [],
    id:'',
    examineStatus: '',
    examineRemark: '',
    pageNo: 1,
    pageSize: 10,
    disabled: false
  },
  initValidate() {
    // 验证字段的规则
    const rules = {
      examineRemark: {
        required: true,
        maxlength: 100
      }
    }
    // 验证字段的提示信息，若不传则调用默认的信息
    const messages = {
      examineRemark: {
        required: '审批备注不能为空',
        maxlength: '审批备注最多可以输入100位'
      }
    }
    // 创建实例对象
    this.WxValidate = new WxValidate(rules, messages)
  },
  onLoad: function (options) {
    this.getList();
    this.initValidate()
  },
  getList() {
    wx.showLoading({
      title: '数据加载中',
      mask: true
    })
    setTimeout(function(){
      wx.hideLoading()
    },6000)
    request.getRequest(api.leavenoteListApi,{data:{pageNo:this.data.pageNo,pageSize:this.data.pageSize}}).then(res => {
      res.data.forEach(function (item, i) {
        if (item.examineStatus === 0) {
          item.examineStatus = '待审批';
        } else if (item.examineStatus === 2) {
          item.examineStatus = '已审批';
        } else if (item.examineStatus === 3) {
          item.examineStatus = '驳回';
        }
        item.endTime = moment(item.endTime).format("YYYY-MM-DD");
        item.startTime = moment(item.startTime).format("YYYY-MM-DD");
        item.createTime = item.createTime.slice(5,16)
      });
      this.setData({
        list: res.data
      })
      setTimeout(function(){
        wx.hideLoading()
      },500)
    })
  },
  showM: function (e) {
    this.setData({
      examineStatus: e.target.dataset.examinestatus,
      id: e.target.dataset.id,
      showModal: true,
      disabled: false,
    })
  },
  preventTouchMove: function () {

  },
  examine(e) {
    
    if (!this.WxValidate.checkForm(e)) {
      const error = this.WxValidate.errorList[0]
      wx.showModal({
        confirmColor: '#666',
        content: error.msg,
        showCancel: false,
      })
      return false
    }
    this.setData({
      disabled: true
    })
    const params = {
      examineRemark: e.detail.value.examineRemark,
      examineStatus: Number(this.data.examineStatus),
      id: this.data.id
    }
    request.postRequest(api.examineLeave, {
      data: params,
      header: {
        'Accept': 'application/json, text/plain, */*'
      },
    }).then(res => {
      if (res.result) {
        this.getList();
        wx.showToast({
          title: '审核完成',
          icon: 'success'
        })
      } else {
        wx.showModal({
          confirmColor: '#666',
          content: res.message,
          showCancel: false,
        })
      }
    })
    this.setData({
      showModal: false,
      examineRemark: ''
    })
  },
  close() {
    this.setData({
      showModal: false,
      examineRemark: ''
    })
  },
  getLicense(e) {
    this.setData({
      examineRemark: e.currentTarget.dataset.remark
    })
  },
  // 下拉刷新
  async onPullDownRefresh(e) {
    this.data.pageNo = 1;
    this.data.pageSize = 10;
    wx.showLoading({
      title: '加载中...',
    })
    await this.getList();
    setTimeout(()=> {
      wx.stopPullDownRefresh();
      wx.hideLoading();
    },500)
  },
  // 上拉加载更多
  async onReachBottom() {
    wx.showLoading({
      title: '加载更多中...',
    })
    this.data.pageSize = this.data.pageSize + 10;
    await this.getList();
    setTimeout(()=> {
      wx.hideLoading();
      wx.showToast({
        title: '加载完毕',
        icon: 'success'
      })
    },500)
  },
})