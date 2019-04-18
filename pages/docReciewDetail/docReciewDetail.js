import api from '../../requests/api.js'
import utils from '../../utils/util.js'
import moment from '../../utils/moment.js'
import WxValidate from '../../plugins/wx-validate/WxValidate';
import regeneratorRuntime from '../../utils/regenerator-runtime/runtime.js';

const app = getApp()
const request = app.WxRequest;

Page({
  data: {
    waybillId:'',
    list:[],
    showModal: false,
    id: '',
    examineStatus: '',
    remark: '',
    examineMoney: '',
    pageNo: 1,
    pageSize: 10,
    unit: '',
    money: '',
    disabled: false,
    waybillStatus: ''
  },
  initValidate() {
    // 验证字段的规则
    const rules = {
      examineMoney: {
        required: true,
        number: true,
        maxlength: 8
      },
      remark: {
        // required: true,
        maxlength: 100
      }
    }
    // 验证字段的提示信息，若不传则调用默认的信息
    const messages = {
      examineMoney: {
        required: '审批数量不能为空',
        digits: '审批数量只能输入数字',
        maxlength: '审批数量最多可以输入8位'
      },
      remark: {
        // required: '审批备注不能为空',
        maxlength: '审批备注最多可以输入100位'
      }
    }
    // 创建实例对象
    this.WxValidate = new WxValidate(rules, messages)
  },
  onLoad: function (options) {
    this.setData({
      waybillId: options.waybillId,
      waybillStatus: options.wayStatus
    })
    console.log(this.data.waybillStatus)
    this.getdetails()
    this.initValidate()
  },
  getdetails(){
    wx.showLoading({
      title: '数据加载中',
      mask: true
    })
    setTimeout(function(){
      wx.hideLoading()
    },6000)
    let params = {
      waybillId: this.data.waybillId,
      examineStatus: '1,2,3',
      cancel: false,
      pageNo: this.data.pageNo,
      pageSzie: this.data.pageSize
    }
    request.getRequest(api.docreExamineList,{
      data: params,
      header: {
        'Accept': 'application/json, text/plain, */*'
      }
    }).then(res => {
      console.log(res)
      res.data.forEach(item => {
        switch (item.examineStatus) {
          case 0:
            item.examineStatus = '待提交';
            item.color = '#888888'
            break;
          case 1:
            item.examineStatus = '待审核';
            item.color = '#FF9900'
            break;
          case 2:
            item.examineStatus = '已通过';
            item.color = '#39c782'
            break;
          case 3:
            item.examineStatus = '已驳回';
            item.color = '#ed5b38'
            break;
          default:
            item.examineStatus = null;
            break;
        }
        item.createTime = item.createTime.slice(5,16)
      })
      this.setData({
        list: res.data
      });
      setTimeout(function(){
        wx.hideLoading()
      },500)
    })
  },
  showM: function (e) {
    console.log(e)
    if (e.target.dataset.examinestatus === '2') {
      if (e.target.dataset.unit === '元') {
        this.setData({
          examineMoney: e.target.dataset.money / 100
        })
      } else {
        this.setData({
          examineMoney: e.target.dataset.money
        })
      }
    } else if (e.target.dataset.examinestatus === '3') {
      this.setData({
        examineMoney: 0
      })
    }
    this.setData({
      examineStatus: e.target.dataset.examinestatus,
      id: e.target.dataset.id,
      showModal: true,
      unit: e.target.dataset.unit,
      disabled: false,
      money: e.target.dataset.money
    })
  },
  examine(e) {
    console.log(e,this.data.unit)
    if (!this.WxValidate.checkForm(e)) {
      const error = this.WxValidate.errorList[0]
      wx.showModal({
        confirmColor: '#666',
        content: error.msg,
        showCancel: false,
      })
      return false
    }
    if (this.data.examineStatus == 3 && !e.detail.value.remark) {
      wx.showModal({
        content: '请填写审批备注',
        showCancel: false,
        confirmColor: '#000000',
      })
      return false
    }
    if (this.data.unit !== '元') {
      if (Math.round(e.detail.value.examineMoney) !== Number(e.detail.value.examineMoney)) {
        wx.showModal({
          confirmColor: '#666',
          content: '里程或燃油类的审批数量请输入整数',
          showCancel: false,
        })
        return false;
      }
    }
    this.setData({
      disabled: true
    })
    const params = {
      examineMoney: this.data.unit === '元'?e.detail.value.examineMoney * 100:e.detail.value.examineMoney,
      remark: e.detail.value.remark,
      examineStatus: Number(this.data.examineStatus),
      id: this.data.id
    }
    request.postRequest(api.docreviewEXamine, {
      data: params,
      header: {
        'Accept': 'application/json, text/plain, */*'
      },
    }).then(res => {
      console.log(res)
      if (res.result) {
        this.getdetails();
        var pages = getCurrentPages();
        var Page = pages[pages.length - 1];//当前页
        var prevPage = pages[pages.length - 2];  //上一个页面
        prevPage.getLoanList();
        wx.showToast({
          title: '审核成功',
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
      remark: '',
      examineMoney: '',
    })
  },
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
  // 单据审核的回退
  backReport (e) {
    var that = this;
    wx.showModal({
      title: '提示',
      content: '确认回退审核状态？',
      showCancel: true,
      cancelText: '取消',
      cancelColor: '#000000',
      confirmText: '确定',
      confirmColor: '#3CC51F',
      success: async (res)=> {
        if(res.confirm){
          const id = e.currentTarget.dataset.id;
          const res = await request.getRequest(api.backReport,{data:{id:id}})
          console.log(res)
          if (res.result) {
            that.getdetails();
            var pages = getCurrentPages();
            var Page = pages[pages.length - 1];//当前页
            var prevPage = pages[pages.length - 2];  //上一个页面
            prevPage.getLoanList();
            wx.showToast({
              title: '回退审核成功',
              icon: 'success'
            })
          } else {
            wx.showModal({
              title: '提示',
              content: res.message,
              showCancel: false,
              confirmColor: '#000000',
            })
          }
        }
      }
    })
  },
  // 下拉刷新
  async onPullDownRefresh(e) {
    this.data.pageNo = 1;
    this.data.pageSize = 10;
    wx.showLoading({
      title: '加载中...',
    })
    await this.getdetails();
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
    await this.getdetails();
    setTimeout(()=> {
      wx.hideLoading();
      wx.showToast({
        title: '加载完毕',
        icon: 'success'
      })
    },500)
  },
})