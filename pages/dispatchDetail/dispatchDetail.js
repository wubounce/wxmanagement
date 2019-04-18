// pages/dispatchDetail/dispatchDetail.js
// export const updateFun = (opt, payload) => fetch.post(apiFormat(updateApi, opt), payload);
import api from '../../requests/api.js'
import utils from '../../utils/util.js'
import moment from '../../utils/moment.js'
import WxValidate from '../../plugins/wx-validate/WxValidate';

const app = getApp()
const request = app.WxRequest;

Page({
  data: {
    id:'',
    detail:{}
  },
  onLoad(options) {
    this.setData({
      id: options.id
    })
    this.getWaybillDetial();
  },
  getWaybillDetial() {
    let url = utils.apiFormat(api.waybillDetailL, {id:this.data.id})
    request.getRequest(url).then(res => {
      res.data.taskDetails.forEach(item=>{
        item.scheduleTime = moment(item.scheduleTime).format("MM-DD hh:mm")
      })
      this.setData({
        detail: res.data
      });
    })
  }
})