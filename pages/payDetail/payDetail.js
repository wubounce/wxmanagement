import api from '../../requests/api.js'
import utils from '../../utils/util.js'
import moment from '../../utils/moment.js'
import WxValidate from '../../plugins/wx-validate/WxValidate';
import regeneratorRuntime from '../../utils/regenerator-runtime/runtime.js';

const app = getApp()
const request = app.WxRequest;

Page({
  data: {
      id:'',
      status:'',
      details:{},
      examineStatus:'',
      examineRemark:'',
      examineMoney:'',
      disabled: false,
      payList: [],
      loanRes: [],
      oilRes: [],
      payModal: false,
      loantype: null,
      statusLabel: '',
      loanid: '',
  },
  onLoad: function (options) {
    this.setData({
      id: options.id,
      status: options.status
    });
    this.getDetails();
    this.getPayList();
  },
  getDetails(){
    request.getRequest(api.loanListApi, {
        data: {
          id: this.data.id,
        }
      }).then(res=>{
        const details = res.data[0]
        if (details.examineStatus === 0) {
          details.examineStatus = '待审核';
          details.color = '#FF9900 '
        } else if (details.examineStatus === 2) {
          details.examineStatus = '已审批';
          details.color = '#19be6b'
        } else if (details.examineStatus === 3) {
          details.examineStatus = '已驳回';
          details.color = '#FF6600'
        } else if (details.examineStatus === 4) {
          details.examineStatus = '已打款';
          details.color = '#09BB07'
        } else if (details.examineStatus === 5) {
          details.examineStatus = '已还款';
          details.color = '#2F9833'
        } else if (details.examineStatus === 6) {
          details.examineStatus = '已作废';
          details.color = '#B4B4B4'
        }
        this.setData({
          details:res.data[0],
          examineMoney: res.data[0].money * 0.01,
      })
    })
  },
  // 点出确认打款弹框
  showPay(e) {
    console.log(e.currentTarget.dataset.loantype)
    if (e.currentTarget.dataset.loantype == 2 || e.currentTarget.dataset.loantype == 5) {
      this.setData({
        payList: this.data.oilRes
      })
    } else {
      this.setData({
        payList: this.data.loanRes
      })
    }
    this.setData({
      payModal: true,
      loantype: e.currentTarget.dataset.loantype,
      loanid: e.currentTarget.dataset.loanid,
      disabled: false
    })
  },
  // 关闭模态框
  payClose() {
    this.setData({
      payModal: false
    })
  },
  // 选择打款方式
  bindPickerChange (e) {
    console.log(e,this.data.loanRes)
    if (this.data.loantype == 2 || this.data.loantype == 5) {
      if (e.detail.value == 0) {
        this.setData({
          statusLabel: this.data.oilRes[0].label
        })
      } else if (e.detail.value == 1) {
        this.setData({
          statusLabel: this.data.oilRes[1].label
        })
      } else if (e.detail.value == 2) {
        this.setData({
          statusLabel: this.data.oilRes[2].label
        })
      }
    } else {
      if (e.detail.value == 0) {
        this.setData({
          statusLabel: this.data.loanRes[0].label
        })
      } else if (e.detail.value == 1) {
        this.setData({
          statusLabel: this.data.loanRes[1].label
        })
      }
    }
  },
  //  确认打款
  async conPay (e) {
    if (!this.data.statusLabel) {
      wx.showModal({
        confirmColor: '#666',
        content: '打款方式不能为空',
        showCancel: false,
      })
      return false
    }
    console.log(e)
    const payload = {};
    payload.ids = [this.data.loanid];
    payload.payType = this.data.statusLabel;
    console.log(payload)
    this.setData({
      disabled: true
    })
    const res = await request.postRequest(api.conPay,{
      data:payload,
      header: {
      'Content-Type': 'application/json;charset=UTF-8',
      }
    })
    this.setData({
      payModal: false
    })
    if (res.result) {
      this.getDetails();
      var pages = getCurrentPages();
      var Page = pages[pages.length - 1];//当前页
      var prevPage = pages[pages.length - 2];  //上一个页面
      prevPage.getLoanList();
      prevPage.getIolList();
      wx.showToast({
        title: '打款成功！',
        icon: 'success',
        mask: true
      })
    } else {
      wx.showModal({
        confirmColor: '#666',
        content: '打款失败',
        showCancel: false,
      })
    }
    console.log(res);
  },
  // 回退打款
  backPay (e) {
    wx.showModal({
      title: '提示',
      content: '确认回退打款状态？',
      showCancel: true,
      cancelText: '取消',
      cancelColor: '#000000',
      confirmText: '确定',
      confirmColor: '#3CC51F',
      success: async (res)=> {
        if(res.confirm){
          console.log(e.currentTarget.dataset.loanid)
          const loanid = e.currentTarget.dataset.loanid;
          const res = await request.postRequest(api.backPay,{data:{id:loanid}})
          console.log(res)
          if (res.result) {
            this.getDetails();
            var pages = getCurrentPages();
            var Page = pages[pages.length - 1];//当前页
            var prevPage = pages[pages.length - 2];  //上一个页面
            prevPage.getLoanList();
            prevPage.getIolList();
            wx.showToast({
              title: '回退打款成功',
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
  // 获取打款方式字典
  async getPayList () {
    const loanRes = ( await request.getRequest(api.dictApi, {
      data: { key: 'loan_pay_type' }
    })).data
    const oilRes = ( await request.getRequest(api.dictApi, {
      data: { key: 'loan_gas_pay_type' }
    })).data
    console.log(oilRes)
    this.setData({
      loanRes: loanRes,
      oilRes: oilRes
    })
  }
})