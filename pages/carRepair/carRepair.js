import api from '../../requests/api.js'
import utils from '../../utils/util.js'
import moment from '../../utils/moment.js'
import WxValidate from '../../plugins/wx-validate/WxValidate';

const app = getApp()
const request = app.WxRequest;

Page({
  data: {
    driver:'',
    phone:'',
    license:'',
    liceniseid:'',
    availableStatus :'0',
    mShow: false,
    current: 0,
    isRepair: null,
    isCare: null,
    repairName: '',
    maintainName: '',
    repairDate: moment().format('YYYY-MM-DD'),
    maintainDate: moment().format('YYYY-MM-DD'),
    radioItems: [
      { name: '可用', value: '0', checked: true },
      { name: '不可用', value: '3' }
    ],
    repair:{ name: '需要维修', value: '0', pmName: '维修厂名', planTime: '预计完工'},
    maintain:{ name: '需要保养', value: '1', pmName: '保养站名', planTime: '预计完工'},
    driverList:[]
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
    this.getDriverList()
    this.initValidate()
  },
  /**
   *  监听页面显示，
   *    当从当前页面调转到另一个页面
   *    另一个页面销毁时会再次执行
   */
  onShow: function () {
    let pac = this.data.driverList.find((item) => item.truckLicense === this.data.license)
    if(pac){
      this.setData({
        driver: pac.realName,
        phone: pac.phone,
      });
    }
  },
  clickCheck:function (e) {
    this.setData({
      current : e.currentTarget.dataset.index
    })
  },
  getDriverList(){
    request.getRequest(api.driverList,{
      data:{
        bind:false,
        pageNo: 1,
        pageSize: 500
      }
    }).then(res => {
      this.setData({
        driverList: res.data
      });
    })
  },
  getPacd(){
    
  },
  openAlert: function() {
    wx.showModal({
      content: '设置车辆状态成功',
      showCancel: false,
      confirmColor:'#666',
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定')
        }
      }
    });
  },
  radioChange: function (e) {
    var radioItems = this.data.radioItems;
    for (var i = 0, len = radioItems.length; i < len; ++i) {
      radioItems[i].checked = radioItems[i].value == e.detail.value;
    }
    if (e.detail.value === '0') {
      this.setData({
        mShow: false
      })
    } else if(e.detail.value === '3') {
      this.setData({
        mShow: true
      })
    }
    this.setData({
      radioItems: radioItems,
      availableStatus : e.detail.value
    });
  },
  checkboxChange: function (e) {
    const arr = e.detail.value;
    if (arr.indexOf('0') !== -1 && arr.indexOf('1') !== -1) {
      this.setData({
        isRepair: '1',
        isCare: '1'
      })
    } if (arr.indexOf('0') !== -1 && !(arr.indexOf('1') !== -1))  {
      this.setData({
        isRepair: '1',
        isCare: '0'
      })
    } if (!(arr.indexOf('0') !== -1) && arr.indexOf('1') !== -1) {
      this.setData({
        isRepair: '0',
        isCare: '1'
      })
    } if (!(arr.indexOf('0') !== -1) && !(arr.indexOf('1') !== -1)) {
      this.setData({
        isRepair: '0',
        isCare: '0'
      })
    }
  },
  repairDate(e) {
    this.setData({
      repairDate :e.detail.value
    })
  },
  maintainDate(e) {
    this.setData({
      maintainDate :e.detail.value
    })
  },
  torepair(e){
    if (!this.WxValidate.checkForm(e)) {
      const error = this.WxValidate.errorList[0]
      wx.showModal({
        confirmColor: '#666',
        content: error.msg,
        showCancel: false,
      })
      return false
    }
    // 可用的情况
    if (!this.data.mShow) {
      const params = {license: this.data.license, availableStatus: 0}
      request.putRequest(api.repairStatus, {
        data: params,
        header: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })
      .then(res => {
        if (res.result) {
          wx.navigateTo({ url: '../carRepair_success/carRepair_success?issuccess=可用' })
        } else {
          wx.showModal({
            confirmColor: '#666',
            content: res.message,
            showCancel: false,
          })
        }
      })
    } else {
      // 不可用情况
      const license = this.data.license;
      const isRepair =this.data.isRepair;
      const contractorShortNameRepair = this.data.repairName;
      const overTimeRepair = this.data.repairDate;
      const isCare = this.data.isCare;
      const contractorShortNameCare = this.data.maintainName;
      const overTimeCare = this.data.maintainDate;
      const payload ={};
      payload.license = license?license:null
      payload.availableStatus = 3
      if (parseInt(this.data.isRepair)){
        payload.contractorShortNameRepair = contractorShortNameRepair?contractorShortNameRepair:null
        payload.overTimeRepair = overTimeRepair?overTimeRepair:null
        payload.isRepair = isRepair?isRepair:null
      } else {
        delete payload.contractorShortNameRepair;
        delete payload.overTimeRepair;
      }
      if (parseInt(this.data.isCare)) {
        payload.contractorShortNameCare = contractorShortNameCare?contractorShortNameCare:null
        payload.isCare = isCare?isCare:null
        payload.overTimeCare = overTimeCare?overTimeCare:null
      } else {
        delete payload.contractorShortNameCare;
        delete payload.overTimeCare;
      }
      if (!parseInt(this.data.isCare) && !parseInt(this.data.isRepair)) {
        wx.showModal({
          confirmColor: '#666',
          content: '请选择维修厂或保养站',
          showCancel: false,
        })
        return false;
      }
      request.putRequest(api.repairStatus, {
        data: payload,
        header: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })
      .then(res => {
        if (res.result) {
          wx.navigateTo({ url: '../carRepair_success/carRepair_success?issuccess=不可用' })
        } else {
          wx.showModal({
            confirmColor: '#666',
            content: res.message,
            showCancel: false,
          })
        }
      })
    }
  }
})