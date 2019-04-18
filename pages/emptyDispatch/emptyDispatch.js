var sliderWidth = 96; // 需要设置slider的宽度，用于计算中间位置
import api from '../../requests/api.js'
import utils from '../../utils/util.js'
import moment from '../../utils/moment.js'
import WxValidate from '../../plugins/wx-validate/WxValidate';

const app = getApp()
const request = app.WxRequest;

Page({
  data: {
    waybillId:'',
    driver:'',
    date: moment().format('YYYY-MM-DD'),
    time: "12:00:00",
    license: '',
    phone:'',
    startName:'',
    route: [],
    routeIndex: 0,
    routeId:'',
    pzTime: '',
    fcTime: '',
    fcDate: '',
    fcdateTime: '',
    overloadFcTime: '',
    overloadDdTime: '',
    fcPzTime: -3
  },
  onLoad(option) {
    console.log(option)
    var routeName = option.routeName.split('-');
    var startSite = routeName[routeName.length-1]
    var startName = ''
    if (startSite.includes('(空)')) {
      startName = startSite.split('(')[0]
    } else {
      startName = startSite
    }
    this.setData({
      driver: option.driverName,
      phone: option.driverPhone,
      license: option.truckLicense,
      startName: startName,
      waybillId: option.waybillId,
      fcTime: option.actualArriveTime !== 'null' ? option.actualArriveTime : option.planArriveTime,
      fcDate: (option.actualArriveTime !== 'null' ? option.actualArriveTime : option.planArriveTime).split(' ')[0],
      fcdateTime: (option.actualArriveTime !== 'null' ? option.actualArriveTime : option.planArriveTime).split(' ')[1],
      overloadFcTime: (option.actualDepartureTime !== 'null' ? option.actualDepartureTime : option.planDepartureTime).slice(5,16),
      overloadDdTime: (option.actualArriveTime !== 'null' ? option.actualArriveTime : option.planArriveTime).slice(5,16)
    })
    this.getRoutes(startName)
    // this._getTime();
  },
  bindrouteChange: function (e) {
    var index = e.detail.value;
    var routeId = this.data.route.length>0?this.data.route[index].id:null; // 这个id就是选中项的id
    console.log(this.data.route.length,routeId)
    this.setData({
      routeIndex: e.detail.value,
      routeId: routeId
    })
  },
  bindDateChange(e) {
    this.setData({
      date: e.detail.value
    })
  },
  bindTimeChange(e) {
    console.log(e)
    this.setData({
      time: e.detail.value + ':00'
    })
  },
  fcbindDate(e) {
    this.setData({
      fcDate: e.detail.value
    })
  },
  fcbindTime(e) {
    console.log(e)
    this.setData({
      fcdateTime: e.detail.value + ':00'
    })
  },
  addEmptyFun(){
    const fcTime = new Date((this.data.fcDate + ' ' + this.data.fcdateTime).replace(/\-/g, '/'));
    // 三天前的日期时间
    const threeDateAgo = moment().add(this.data.fcPzTime,'day').startOf('day').toDate();
    const threeDate = moment().add(this.data.fcPzTime,'day').startOf('day').format('YYYY-MM-DD');
    if (fcTime.getTime()-threeDateAgo.getTime()<0) {
      wx.showModal({
        confirmColor: '#666',
        content: '发车时间不可早于' + threeDate + ' 00:00:00',
        showCancel: false,
      })
      return false
    }
    wx.showLoading({
      title: '正在创建下发...',
      mask: true
    })
    let schedule = [];
    let startTime = this.data.fcDate + ' ' + this.data.fcdateTime;
    schedule[0] = startTime;
    let endtime = this.data.date +' '+ this.data.time
    schedule[1] = endtime;


    // 空载的时间
    // this.data.route.forEach((item, index) => {
    //   if (index === 0) {
    //     schedule[index] = startTime;
    //   } else if (index === this.data.route.length-1) {
    //     schedule[index] = endtime;
    //   } else {
    //     schedule[index] = startTime;
    //   }
    // })

    if (new Date(schedule[0].replace(/-/g, '/')).getTime()>new Date(schedule[1].replace(/-/g, '/')).getTime()) {
      wx.showToast({
        title: '到达时间不能早于出发时间',
        icon: 'none',
        duration: 1000
      });
      return false
    }
    
    let opt = {
      remark: 'remark',
      routeId: this.data.routeId, // 线路id
      schedule: schedule,
      waybillId: this.data.waybillId, // 调度单id
      issue: true,
      createFrom: 1
    };
    console.log(opt)
    request.postRequest(api.addEmptyFunWaybill, {
      data: opt,
      header: {
        'Accept': 'application/json, text/plain, */*'
      },
    }).then(res => {
      if (res.result) {
        setTimeout(function () {
          wx.navigateTo({ url: '../empty_success/empty_success?num=' + res.data.num + '&routeName=' + res.data.routeName + '&driverName=' + res.data.driverName + '&truckLicense=' + res.data.truckLicense + '&driverPhone=' + res.data.driverPhone })
          wx.hideLoading()
        }, 200)
      } else {
        wx.hideLoading()
        wx.showModal({
          confirmColor: '#666',
          content: res.message,
          showCancel: false,
        })
      }
    })
  },
  getRoutes(startName) {
    console.log(startName, this.data.startName)
    request.getRequest(api.routeListApi, { data: { pageNo: 1, pageSize: 100, namePre: startName, dispatchType: 1, enabled: false}}).then(res => {
      const routeList = res.data;
      routeList.forEach(item=>{
        item.siteNames = item.siteNames[item.siteNames.length - 1];
      })
      console.log(routeList)
      if (routeList.length===0) {
        routeList.push({siteNames:'无站点信息'})
      }
      this.setData({
        route: routeList,
        routeId: routeList.length > 0 ? routeList[this.data.routeIndex].id : null
      });
    });
  },
  // 获取配置时间得到发车时间和到达时间
  // _getTime() {
  //   request.getRequest(api.pzTime,{data:{sysGroup: 'interval_task', sysKey: 'intervalTime'}}).then(res=> {
  //     console.log(res);
  //     const sysInfo = res.data;
  //     this.setData({
  //       pzTime: sysInfo.intervalTime,
  //       // fcTime: moment().add(sysInfo.intervalTime,'hour').format('YYYY-MM-DD HH:mm:ss')
  //       fcTime: moment().format('YYYY-MM-DD HH:mm:ss')
  //     })
  //   })
  // },
  // 返回
  back () {
    wx.navigateBack({
      delta: 1,
    })
  }
});