import api from '../../requests/api.js'
import utils from '../../utils/util.js'
import moment from '../../utils/moment.js'
import qs from '../../plugins/qs.js';
import regeneratorRuntime from '../../utils/regenerator-runtime/runtime.js';

const app = getApp()
const request = app.WxRequest;

var sliderWidth = 96; // 需要设置slider的宽度，用于计算中间位置

Page({
  data: {
    tabs: ["手工调度", "空载列表"],
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,
    date: moment().format('YYYY-MM-DD'),
    time: moment().format('YYYY-MM-DD HH:mm:ss').slice(11,19),
    license:'',
    liceniseid:'',
    routeid:'',
    startSite: '',
    startSiteId:'',
    baseId:'',
    waySitindex: 0,
    driverName: '',
    waySitItems: [
      {
        name: '',
        id: 0
      }
    ],
    endSite: '',
    endSiteId: '',
    waybillList:[],
    pzTime: '',
    fcPzTime: -3,
    pageNo: 1,
    pageSize: 10,
    radioItems: [
      { name: '重载', value: '', checked: true },
      { name: '水路', value: '(水)' }
    ],
    routeType: '',
    payload: {},
    tjList: [
      {name: '待接受', value: 1},
      { name: '运输中', value: 3 },
      { name: '已送达', value: 4 },
      { name: '全部', value: '0,1,2,3,4,5,6' },
      { name: '更多' }
    ],
    currentTab: 0,
    payloadVal: 1,
    searchForm: {},
    searchMore: false,
    lastModal: false,
    okText: 3,
    menuList: []
  },
  onLoad(option) {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 2,
          sliderOffset: res.windowWidth / that.data.tabs.length * that.data.activeIndex,
          date: moment().format('YYYY-MM-DD'),
          time: moment().format('YYYY-MM-DD HH:mm:ss').slice(11,19)
        });
      }
    });
    this.getWaybillList();
    this._getTime();
  },
  tabClick: function (e) {
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id
    });
  },
  handleAdd() {
    this.setData({
      waySitindex: ++this.data.waySitindex
    })
    var items = this.data.waySitItems;
    items.push({
      name: '',
      id: this.data.waySitindex
    });
    this.setData({
      waySitItems: items
    });
  },
  handleReduce(e) {
    // this.data.waySitindex--;
    var items = this.data.waySitItems;
    items.splice(e.currentTarget.dataset.index, 1);
    this.setData({
      waySitItems: items
    });
  },
  // 上一单不是空载弹框按钮的事件
  // 取消事件
  cancel () {
    this.setData({
      lastModal: false
    })
  },
  creatbill(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({
      type: type
    })
    if (!this.data.startSite) {
      wx.showModal({
        confirmColor: '#666',
        content: '开始站点不可为空',
        showCancel: false,
      })
      return false
    }
    if (!this.data.endSite) {
      wx.showModal({
        confirmColor: '#666',
        content: '到达站点不可为空',
        showCancel: false,
      })
      return false
    }
    if (!this.data.liceniseid) {
      wx.showModal({
        confirmColor: '#666',
        content: '车牌号不可为空',
        showCancel: false,
      })
      return false
    }
    const fcTime = new Date((this.data.date + ' ' + this.data.time).replace(/\-/g, '/'));
    // 三天前的日期时间
    const threeDateAgo = moment().add(this.data.fcPzTime,'day').startOf('day').toDate();
    const threeDate = moment().add(this.data.fcPzTime,'day').startOf('day').format('YYYY-MM-DD');
    console.log(fcTime,threeDateAgo,threeDate)
    if (fcTime.getTime()-threeDateAgo.getTime()<0) {
      wx.showModal({
        confirmColor: '#666',
        content: '发车时间不可早于' + threeDate + ' 00:00:00',
        showCancel: false,
      })
      return false
    }
    // 检查上一趟任务是否为空载任务
    const truckId = this.data.liceniseid || null;
    request.getRequest(api.lastWay,{data: {truckId: truckId}}).then(res=> {
      if (res.result) {
        // 如果上一趟不是空载
        if (!res.data) {
          this.setData({
            lastModal: true,
            okText: 3
          })
          var timer = setInterval(()=> {
            this.data.okText--
            if (this.data.okText === 0) {
              this.data.okText = '确定'
              clearInterval(timer)
            }
            this.setData({
              okText: this.data.okText
            })
          },1000)
        } else {
          // 如果上一趟是空载
          this.checkRoute();
        }
      } else {
        wx.showModal({
          confirmColor: '#666',
          content: res.message,
          showCancel: false,
        })
      }
    })
  },
  // 上一趟不是空载弹框的确定按钮事件
  beOk () {
    this.setData({
      lastModal: false
    })
    this.checkRoute();
  },
  // 检测线路
  checkRoute () {
    let siteName = '';
    let siteArr = [];
    let params = {};
    siteArr.push({
      name: this.data.startSite,
      id: this.data.startSiteId
    },{
        name: this.data.endSite,
        id: this.data.startSiteId
      }
    )
    this.data.waySitItems.forEach((item, i) => {
      if (item.name) {
        siteArr.splice((i+1), 0, item); 
      }
    }); 
    siteArr.forEach((item, i) => {
      if (item.name) {
          siteName += item.name + '-';
      }
    });
    request.getRequest(api.routeDetailApi,{
      data: {
        routeName: siteName.substring(0, siteName.length - 1) + this.data.routeType
      }
    }).then(res => {
      if (res.result) {
        let schedule=[];
        // 每个途径点的时间
        res.data.routeSites.forEach((item, index)=> {
          if (index === 0) {
            schedule[index] = this.data.date + ' ' + this.data.time;
          } else {
            schedule[index] = this.DateFormat((new Date((new Date(schedule[index - 1].replace(/\-/g, '/')).getTime() + (item.driveTime * 60 * 60 * 1000) + (item.restTime * 60 * 60 * 1000)))), 'yyyy-MM-dd hh:mm:ss');
          }
        })
        params = {
          baseId: this.data.baseId, // 基地ID 必填
          dispatchType: 0, // 调度类型 必填
          issueType: this.data.type, // 下发类型 必填
          routeId: res.data.id, // 线路ID 必填
          schedule: schedule, // 每个站点计划时间
          truckId: this.data.liceniseid, // 车辆ID
          remark: '',
          createFrom: 1
        };
        console.log(params)
        wx.showModal({
          title: this.data.type==='1'?'是否创建调度单':'是否创建并下发调度单',
          content: '线路名称：' + res.data.name + '\r\n\r\n发车时间：' + schedule[0] + '\r\n\r\n到达时间：' + schedule[schedule.length-1],
          showCancel: true,
          cancelText: '取消',
          cancelColor: '#000000',
          confirmText: '确定',
          confirmColor: '#3CC51F',
          success: res => {
            if(res.confirm){
              this.todocreateDispatch(params)
            }
          }
        });
      } else {
        wx.showModal({
          confirmColor: '#666',
          content: res.message,
          showCancel: false,
        })
        return false;
      }
    })
  },
  // 创建调度单
  todocreateDispatch(params){
    wx.showLoading({
      title: '正在创建单据...',
      mask: true
    })
    request.postRequest(api.movewaybill, {
      data: params,
      header: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json;charset=UTF-8',
      },

    }).then(res => {
      wx.hideLoading()
      if (res.result) {
        wx.navigateTo({ url: '../dispatch_success/dispatch_success?wayNum='+res.data.num+'&license='+res.data.truckLicense+'&driverName='+res.data.driverName+'&planDepartureTime='+res.data.planDepartureTime+'&driverPhone='+res.data.driverPhone })
      } else {
        wx.showModal({
          confirmColor: '#666',
          content: res.message,
          showCancel: false,
        })
      }
    })
  },
  // 获取配置时间得到发车时间和到达时间
  _getTime() {
    request.getRequest(api.pzTime,{data:{sysGroup: 'interval_task', sysKey: 'intervalTime'}}).then(res=> {
      const sysInfo = res.data;
      this.setData({
        pzTime: sysInfo.intervalTime
      })
    })
  },
  async getWaybillList(params){
    var payload = {}
    if (!this.data.searchMore) {
      if (params) {
        payload = { pageNo: this.data.pageNo, pageSize: this.data.pageSize, statusIn: params }
      } else {
        payload = { pageNo: this.data.pageNo, pageSize: this.data.pageSize, statusIn: 1 }
      }
    } else {
      payload = Object.assign({ pageNo: 1, pageSize: 10 }, params )
      this.setData({
        searchForm: params
      })
    }
    wx.getStorage({
      key: 'username',
      success: async (res)=> {
        const id = res.data.id;
        var role = res.data.role;
        // 获取用户的详情
        const url = utils.apiFormat(api.userDetail, {id:id});
        const baseRes = await request.getRequest(url);
        var hasBaseList = baseRes.data.authBaseIds.split(',');
        const menuRes = await request.getRequest(api.menuList);
        var resData = menuRes.data;
        const wayRes = await request.getRequest(api.waybillList, { data: payload});
        wayRes.data.forEach(function (item, i) {
          if (hasBaseList.includes(item.toBaseId+'')) {
            item.hasBase = true;
          } else {
            item.hasBase = false;
          }
          if (role === 'admin') {
            item.hasBase = true;
          }
          for (let n of resData) {
            if (n.id === 400307) {
              item.autBtn = true;
              break
            } else {
              item.autBtn = false;
            }
          }
          if (item.status === 0) {
            item.status = '待下发';
            item.background = '#808080';
          } else if (item.status === 1) {
            item.status = '待接受';
            item.background = '#f77528';
          } else if (item.status === 2) {
            item.status = '待发车';
            item.background = '#f8b551';
          } else if (item.status === 3) {
            item.status = '运输中';
            item.background = '#4a9cf2';
          } else if (item.status === 4) {
            item.status = '已送达';
            item.background = '#5dc873';
          } else if (item.status === 5) {
            item.status = '已完成';
            item.background = '#19be6b';
          } else if (item.status === 6) {
            item.status = '已作废';
            item.background = '#919293';
          }
          item.createTime = item.createTime.slice(0,16)
        });
        this.setData({
          waybillList:wayRes.data
        });
      }
    })
    
    // await request.getRequest(api.waybillList, { data: payload}).then(res => {
    //   res.data.forEach(function (item, i) {
    //     if (item.status === 0) {
    //       item.status = '待下发';
    //       item.background = '#808080';
    //     } else if (item.status === 1) {
    //       item.status = '待接受';
    //       item.background = '#f77528';
    //     } else if (item.status === 2) {
    //       item.status = '待发车';
    //       item.background = '#f8b551';
    //     } else if (item.status === 3) {
    //       item.status = '运输中';
    //       item.background = '#4a9cf2';
    //     } else if (item.status === 4) {
    //       item.status = '已送达';
    //       item.background = '#5dc873';
    //     } else if (item.status === 5) {
    //       item.status = '已完成';
    //       item.background = '#19be6b';
    //     } else if (item.status === 6) {
    //       item.status = '已作废';
    //       item.background = '#919293';
    //     }
    //   });
    //   this.setData({
    //     waybillList:res.data
    //   });
    // })
  },
  callDriver: function(e) {
    const driverPhone = e.currentTarget.dataset.driver;
    wx.makePhoneCall({
      phoneNumber: driverPhone,
      success: function () {
        console.log("拨打电话成功！")
      },
      fail: function () {
        console.log("拨打电话失败！")
      }
    })
  },
  // 选择重载还是水路
  radioChange: function (e) {
    var radioItems = this.data.radioItems;
    for (var i = 0, len = radioItems.length; i < len; ++i) {
      radioItems[i].checked = radioItems[i].value == e.detail.value;
    }
    this.setData({
      radioItems: radioItems,
      routeType: e.detail.value
    });
  },
  // 点击选择查询条件
  async chooseClick (e) {
    if (e.currentTarget.dataset.index !== 4) {
      this.setData({
        currentTab: e.currentTarget.dataset.index,
        payloadVal: e.currentTarget.dataset.statusval,
        searchMore: false,
        pageNo: 1,
        pageSize: 10
      })
      wx.showLoading({
        title: '加载数据中...',
        mask: true
      })
      await this.getWaybillList(this.data.payloadVal);
      setTimeout(() => {
        wx.hideLoading()
      }, 200)
    } else {
      wx.navigateTo({
        url: '../waySearch/waySearch',
      })
      this.setData({
        currentTab: e.currentTarget.dataset.index,
      })
    }
    
  },
  // 下拉刷新
  async onPullDownRefresh(e) {
    this.data.payload = {};
    this.data.pageNo = 1;
    this.data.pageSize = 10;
    wx.showLoading({
      title: '加载中...',
    })
    if (!this.data.searchMore) {
      await this.getWaybillList(this.data.payloadVal);
    } else {
      const payload = Object.assign({pageNo: 1, pageSize: 10}, this.data.searchForm)
      await this.getWaybillList(payload);
    }
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
    this.data.payload.pageNo = 1;
    this.data.payload.pageSize = this.data.pageSize;
    if (!this.data.searchMore) {
      await this.getWaybillList(this.data.payloadVal);
    } else {
      let pageSize = this.data.pageSize;
      const payload = Object.assign(this.data.searchForm, { pageNo: 1, pageSize: pageSize })
      await this.getWaybillList(payload);
    }
    setTimeout(()=> {
      wx.hideLoading();
      wx.showToast({
        title: '加载完毕',
        icon: 'success'
      })
    },500)
  },
  // 下发任务
  async xfEvent (e) {
    const wayId = e.currentTarget.dataset.id;
    const res = await request.postRequest(api.xfWaybill,{data: {id: wayId}});
    if (res.result) {
      wx.showToast({
        title: '下发任务成功',
        icon: 'success'
      })
      this.getWaybillList();
    }
  },
  // 确认完成
  async beFinish (e) {
    const wayId = e.currentTarget.dataset.id;
    const res = await request.postRequest(api.finishWay, { data: { id: wayId } });
    if (res.result) {
      wx.showToast({
        title: '已确认完成',
        icon: 'success'
      })
      this.getWaybillList();
    }
  },
  // 发车时间
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
  DateFormat (str, fmt) {
    let o = {
      'M+': str.getMonth() + 1,
      'd+': str.getDate(),
      'h+': str.getHours(),
      'm+': str.getMinutes(),
      's+': str.getSeconds(),
      'q+': Math.floor((str.getMonth() + 3) / 3),
      'S': str.getMilliseconds()
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (str.getFullYear() + '').substr(4 - RegExp.$1.length));
    for (let k in o) {
      if (new RegExp('(' + k + ')').test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
      }
    }
    return fmt;
  }
});
