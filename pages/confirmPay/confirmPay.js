import api from '../../requests/api.js'
import utils from '../../utils/util.js'
import moment from '../../utils/moment.js'
import WxValidate from '../../plugins/wx-validate/WxValidate';
import regeneratorRuntime from '../../utils/regenerator-runtime/runtime.js';

const app = getApp()
const request = app.WxRequest;
var sliderWidth = 96; // 需要设置slider的宽度，用于计算中间位置
Page({
  data: {
    loanList:[],
    tabs: ["借款打款", "油款打款"],
    pageNo: 1,
    pageSize: 10,
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,
    loanPosition: 'absolute',
    oilPosition: 'fixed'
  },
  onLoad: function (options) {
    this.getLoanList();
    this.getIolList();
    wx.getSystemInfo({
      success: (res) => {
        this.setData({
          sliderLeft: (res.windowWidth / this.data.tabs.length - sliderWidth) / 2,
          sliderOffset: res.windowWidth / this.data.tabs.length * this.data.activeIndex,
        });
      }
    });
  },
  // 获取借款列表
  getLoanList() {
    wx.showLoading({
      title: '数据加载中',
      mask: true
    })
    setTimeout(function(){
      wx.hideLoading()
    },6000)
    request.getRequest(api.loanListApi,{data:{pageNo:this.data.pageNo,pageSize:this.data.pageSize,typeIn: '1,3,4,6'}}).then(res => {
      res.data.forEach(function (item, i) {
        item.routesite = item.routeName.split('-');
        if (item.examineStatus === 0) {
          item.examineStatus = '待审核';
          item.color = '#FF9900 '
        } else if (item.examineStatus === 2) {
          item.examineStatus = '已审批';
          item.color = '#19be6b'
        } else if (item.examineStatus === 3) {
          item.examineStatus = '已驳回';
          item.color = '#FF6600'
        } else if (item.examineStatus === 4) {
          item.examineStatus = '已打款';
          item.color = '#09BB07'
        } else if (item.examineStatus === 5) {
          item.examineStatus = '已还款';
          item.color = '#2F9833'
        } else if (item.examineStatus === 6) {
          item.examineStatus = '已作废';
          item.color = '#B4B4B4'
        }
        if (item.cancel) {
          item.color = '#888888'
        }
      });
      setTimeout(()=> {
        wx.hideLoading();
      },600)
      this.setData({
        loanList: res.data
      });
    })
  },
  // 获取油款列表
  getIolList() {
    wx.showLoading({
      title: '数据加载中',
      mask: true
    })
    setTimeout(function(){
      wx.hideLoading()
    },600)
    request.getRequest(api.loanListApi,{data:{pageNo:this.data.pageNo,pageSize:this.data.pageSize,typeIn: '2,5'}}).then(res => {
      res.data.forEach(function (item, i) {
        item.routesite = item.routeName.split('-');
        if (item.examineStatus === 0) {
          item.examineStatus = '待审核';
          item.color = '#FF9900 '
        } else if (item.examineStatus === 2) {
          item.examineStatus = '已审批';
          item.color = '#19be6b'
        } else if (item.examineStatus === 3) {
          item.examineStatus = '已驳回';
          item.color = '#FF6600'
        } else if (item.examineStatus === 4) {
          item.examineStatus = '已打款';
          item.color = '#09BB07'
        } else if (item.examineStatus === 5) {
          item.examineStatus = '已还款';
          item.color = '#2F9833'
        } else if (item.examineStatus === 6) {
          item.examineStatus = '已作废';
          item.color = '#B4B4B4'
        }
        if (item.cancel) {
          item.color = '#888888'
        }
      });
      this.setData({
        iolList: res.data
      });
    })
  },
  // 下拉刷新
  async onPullDownRefresh(e) {
    this.data.pageNo = 1;
    this.data.pageSize = 10;
    wx.showLoading({
      title: '加载中...',
    })
    await this.getLoanList();
    await this.getIolList();
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
    await this.getLoanList();
    await this.getIolList();
    setTimeout(()=> {
      wx.hideLoading();
      wx.showToast({
        title: '加载完毕',
        icon: 'success',
        duration: 700
      })
    },500)
  },
  // tab兰切换
  tabClick: function (e) {
    console.log(e);

    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id,
      oilTop: 0
    });
    if (e.currentTarget.id === '1') {
      this.setData({
        oilPosition: 'absolute',
        loanPosition: 'fixed',
        pageNo: 1,
        pageSize: 10
      })
      this.getIolList();
    } else if (e.currentTarget.id === '0') {
      this.setData({
        oilPosition: 'fixed',
        loanPosition: 'absolute',
        pageNo: 1,
        pageSize: 10
      })
      this.getLoanList();
    }
    // wx.pageScrollTo({
    //   scrollTop:0
    // })
  }
})