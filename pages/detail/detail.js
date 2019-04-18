import api from '../../requests/api.js'
import regeneratorRuntime from '../../utils/regenerator-runtime/runtime.js';
import WxValidate from '../../plugins/wx-validate/WxValidate';
import utils from '../../utils/util.js'
const app = getApp()
const request = app.WxRequest;

Page({
  data: {
    waybillId: null,
    detail: {},
    orderList: [],
    vinList: [],
    baseList: []
  },
  onLoad: async function (options) {
    this.setData({
      waybillId: options.waybillId
    })
    await this.getBase();
    await this._getDetail();
  },
  async _getDetail() {
    wx.showLoading({
      title: '加载数据中...',
      mask: true
    })
    setTimeout(()=> {
      wx.hideLoading();
    }, 6000)
    const url = utils.apiFormat(api.waybillDetailL, {id:this.data.waybillId});
    const res = (await request.getRequest(url)).data;
    const detail = Object.assign({}, res);
    let pac1 = this.data.baseList.find(p => p.id === res.baseId);
    detail.baseId = pac1 ? pac1.name : '';
    let pac2 = this.data.baseList.find(p => p.id === res.toBaseId);
    detail.toBaseId = pac2 ? pac2.name : '';
    let pac3 = this.data.baseList.find(p => p.id === res.initToBaseId);
    detail.initToBaseId = pac3 ? pac3.name : '';
    detail.createFrom = detail.createFrom?'微信端':'PC端'
    if (detail.status === 0) {
      detail.status = '待下发';
      detail.background = '#808080';
    } else if (detail.status === 1) {
      detail.status = '待接受';
      detail.background = '#f77528';
    } else if (detail.status === 2) {
      detail.status = '待发车';
      detail.background = '#f8b551';
    } else if (detail.status === 3) {
      detail.status = '运输中';
      detail.background = '#4a9cf2';
    } else if (detail.status === 4) {
      detail.status = '已送达';
      detail.background = '#5dc873';
    } else if (detail.status === 5) {
      detail.status = '已完成';
      detail.background = '#19be6b';
    } else if (detail.status === 6) {
      detail.status = '已作废';
      detail.background = '#919293';
    }
    detail.taskDetails.forEach(item=> {
      if (item.arriveTime) { item.arriveTime = this.etDateStr(item.arriveTime.replace(/\-/g, '/'));}
      if (item.scheduleTime) { item.scheduleTime = this.etDateStr(item.scheduleTime.replace(/\-/g, '/')); }
    })
    const orderList = [];
    const vinList = [];
    detail.cargoDetails.forEach(item=> {
      orderList.push(...item.orderNums);
      vinList.push(...item.vins);
    })
    this.setData({
      detail: detail,
      orderList: orderList,
      vinList: vinList
    })
    setTimeout(()=> {
      wx.hideLoading()
    },700)
  },
  // 获取基地列表
  async getBase () {
    const payload = {pageNo: 1, pageSize: 500};
    const res = await request.getRequest(api.searchBase,{data:payload})
    console.log(res);
    this.setData({
      baseList: res.data
    })
  },
  // 时间格式转换
  etDateStr(day) {
    const dd = new Date(day);
    dd.setDate(dd.getDate());
    const m = dd.getMonth() + 1 > 9 ? dd.getMonth() + 1 : '0' + (dd.getMonth() + 1);
    const d = dd.getDate() > 9 ? dd.getDate() : '0' + dd.getDate();
    const hh = dd.getHours() > 9 ? dd.getHours() : '0' + dd.getHours();
    const mm = dd.getMinutes() > 9 ? dd.getMinutes() : '0' + dd.getMinutes();
    return m + '-' + d + ' ' + hh + ':' + mm;
  },
})