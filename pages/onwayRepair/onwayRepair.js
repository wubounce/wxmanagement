import api from '../../requests/api.js'
import utils from '../../utils/util.js'
import moment from '../../utils/moment.js'
import WxValidate from '../../plugins/wx-validate/WxValidate';
import regeneratorRuntime from '../../utils/regenerator-runtime/runtime.js';

const app = getApp()
const request = app.WxRequest;

Page({
  data: {
    list: [],
    status: '',
    id: '',
    imgList: [],
    pageNo: 1,
    pageSize: 10,
    showModal: false,
    disagreeArr: ['该维修暂不能通过', '该维修有异议', '无法同意，请配合工作'],
    agreeArr: ['同意在途维修', '同意申请', '路上注意安全', '谢谢'],
    examineStatus: '',
    remark: '',
    disabled: false
  },
  initValidate() {
    // 验证字段的规则
    const rules = {
      remark: {
        required: true,
        maxlength: 100
      }
    }
    // 验证字段的提示信息，若不传则调用默认的信息
    const messages = {
      remark: {
        required: '审批备注不能为空',
        maxlength: '审批备注最多可以输入100位'
      }
    }
    // 创建实例对象
    this.WxValidate = new WxValidate(rules, messages)
  },
  onLoad: function (options) {
    this.getRepairList()
    this.initValidate()
  },
  getRepairList() {
    wx.showLoading({
      title: '数据加载中...'
    })
    setTimeout(()=> {
      wx.hideLoading();
    }, 5000)
    request.getRequest(api.onthewayRepair, {
      data: {
        curStatus: 0,
        pageNo:this.data.pageNo,
        pageSize:this.data.pageSize
      }
    }).then(res => {
      setTimeout(() => {
        wx.hideLoading();
      }, 500);
      const result = res.data;
      result.forEach(item => {
        item.createTime = item.createTime.slice(5, 16);
        item.planDepartureTime = item.planDepartureTime.slice(5, 16);
        if (item.examineStatus === 1) {
          item.examineStatus = '已驳回'
          item.backColor = '#FF6600'
        } else if (item.examineStatus === 0) {
          item.examineStatus = '已通过'
          item.backColor = '#19be6b'
        }
      })
      this.setData({
        list: res.data
      });
    })
  },
  // examine(e) {
  //   this.setData({
  //     status: e.target.dataset.status,
  //     id: e.target.dataset.id,
  //   })
  //   wx.showModal({
  //     title: '提示',
  //     content: `确认${Number(this.data.status) === 1 ? '驳回审批' : '通过审批'}？`,
  //     success: (res) => {
  //       if (res.confirm) {
  //         this.confirmExamine()
  //       }
  //     }
  //   })
  // },
  // confirmExamine(e) {
  //   const params = {
  //     status: Number(this.data.status),
  //     id: this.data.id
  //   }
  //   request.postRequest(api.repairEXamine, {
  //     data: params,
  //   }).then(res => {
  //     console.log(res)
  //     if (res.result) {
  //       this.getRepairList()
  //       wx.showToast({
  //         title: '审核完成',
  //         icon: 'success'
  //       })
  //     } else {
  //       wx.showModal({
  //         confirmColor: '#666',
  //         content: res.message,
  //         showCancel: false,
  //       })
  //     }
  //   })
  // },
  // 显示模态框
  handleOpen(e) {
    console.log(e);
    const imgids = e.currentTarget.dataset.imgids.split(',');
    const urls = imgids.map((item) => item = 'http://118.25.119.212/api/pub/objurl/name?id=' + item + '&compress=true')
    // const urls = imgids.map((item) => item = 'http://boyu.cmal.com.cn/api/pub/objurl/name?id=' + item + '&compress=true')
    // const urls = imgids.map((item) => item = 'http://182.61.48.201:8080/api/pub/objurl/name?id=' + item + '&compress=true')
    console.log(urls);
    this.setData({
      visible: true,
      imgList: urls
    });
  },
  // 点击叉叉关闭模态框
  closeMadol() {
    this.setData({
      visible: false,
      imgList: []
    })
  },
  // 点击图片放大预览
  imgTap(e) {
    console.log(e);
    // 为压缩的图片列表
    const imgList = this.data.imgList.map(item => item = item.replace('true', 'false'))
    const current = e.currentTarget.dataset.current.replace('true', 'false')
    wx.previewImage({
      current: current,
      urls: imgList
    })
  },
  // 下拉刷新
  async onPullDownRefresh(e) {
    this.data.pageNo = 1;
    this.data.pageSize = 10;
    wx.showLoading({
      title: '加载中...',
    })
    await this.getRepairList();
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
    await this.getRepairList();
    setTimeout(()=> {
      wx.hideLoading();
      wx.showToast({
        title: '加载完毕',
        icon: 'success',
        duration: 700
      })
    },500)
  },


  showM: function (e) {
    this.setData({
      examineStatus: e.target.dataset.examinestatus,
      id: e.target.dataset.id,
      showModal: true,
      disabled: false,
    })
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
      remark: e.detail.value.remark,
      status: Number(this.data.examineStatus),
      id: this.data.id
    }
    console.log(params)
    request.postRequest(api.repairEXamine, {
      data: params,
    }).then(res => {
      console.log(res)
      if (res.result) {
        this.getRepairList()
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
      showModal: false
    })
  },
  close() {
    this.setData({
      showModal: false,
      remark: ''
    })
  },
  getLicense(e) {
    this.setData({
      remark: e.currentTarget.dataset.remark
    })
  },
})