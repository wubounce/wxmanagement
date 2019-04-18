module.exports = {
  login: '/api/pub/tms/login', //租户登录 method 'post'
  wechatlogin: '/api/pub/tms/loginWechat', //小程序租户登录 method 'post'
  siteapi: "/api/tms/site",   //站点列表 method 'get'
  driverList: "/api/tms/driver",   //司机列表 method 'get'
  frontList: "/api/tms/truck",   //车辆列表 method 'get'
  waybillList: "/api/tms/waybill",   //调度单列表 method 'get'
  movewaybill: "/api/tms/waybill",   //调度单列表 method 'post'
  waybillDetailL: "/api/tms/waybill/{id}",   //调度单详情 method 'get'
  addEmptyFunWaybill: "/api/tms/waybill/createDryRun",   //新增空载 method 'post'
  examineApi: "/api/tms/loan/examine",   //借款审批 method 'post'
  routeListApi : '/api/tms/route', // 查询线路列表 method 'get'
  loanListApi : '/api/tms/loan', //借款列表 method 'get'
  leavenoteListApi : '/api/tms/leavenote/list', //请假列表 method 'get'
  examineLeave : '/api/tms/leavenote/examine', //请假审批 method 'post'
  waybillCount: '/api/tms/waybill/count', //查询调度单数量 method 'get'
  docreviewList: '/api/tms/waybillaccount/list', //单据列表 method 'get'
  docreExamineList: 'api/tms/orderreport/examinelist', //审批单据 method 'get'
  docreviewCount: '/api/tms/waybillaccount/listcount', //查询单据数量 method 'get'
  docreviewEXamine: '/api/tms/orderreport/examine', //审批单据 method 'post'
  repairEXamine: '/api/tms/eventreport/examine', //在途维修审批 method 'post'
  changePassword: '/api/tms/password', //修改密码 method 'post'
  logout: '/api/pub/logout', //退出登录 method 'post'
  onthewayRepair: '/api/tms/eventreport/list', //在途维修列表 method 'post'
  acrRepair: '/api/tms/truck/update/status', //车辆检测更新运力状态 method 'post'
  routeDetailApi: '/api/tms/route/detail', //通过线路名查询线路详情 method 'GET'
  supplierList: '/api/tms/contractor',// 获取供方列表
  repairStatus: '/api/tms/truck/repairStatus', // 可用不可用的维修状态
  xfWaybill: '/api/tms/waybill/issue', // 下发任务
  pzTime: '/api/tms/monovalence/sys', // 获取配置时间
  finishWay: '/api/tms/waybill/confirmArrival', // 确认完成
  canUseCar: '/api/tms/truck/available/truck', // 查询可用的车头
  searchBase: '/api/tms/base',    // 查询基地列表
  upLogin: '/api/wechatUser/updateUserLogTime',    // 更新用户登录时间
  userDetail: '/api/tms/user/{id}',    // 获取用户详情
  lastWay: '/api/tms/waybill/last/status',    // 车辆最后一趟是否为空载
  filterMethod: '/api/tms/query/util',    // 黄红莲模糊搜索接口
  changeStatus: '/api/tms/waybill/update/status',    // 修改调度单状态（慎用）
  menuList: '/api/tms/webMenu/current',    // 获取当前用户的菜单权限
  dictApi: '/api/pub/dict',// 获取字典表
  conPay: '/api/tms/loan/pay',// 确认打款
  backPay: '/api/tms/loan/revert/pay',// 打款回退
  backAudit: '/api/tms/loan/examine/cancel',// 借款审核回退
  backReport: '/api/tms/orderreport/examine/regresses',// 单据审核回退
}