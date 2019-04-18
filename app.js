import WxRequest from './plugins/wx-request/lib/index'
import utils from './utils/util.js'
App({
  onLaunch: function () {
    this.WxRequest()
  },
  
  globalData: {
    userInfo: {}
  },
  WxRequest() {
    this.WxRequest = new WxRequest({
      baseURL: 'https://boyu.cmal.com.cn',
      // baseURL: 'http://182.61.48.201:8080',
    })
    this.interceptors()
    return this.WxRequest;
  },
  interceptors() {
    var res = wx.getSystemInfoSync()
    console.log(res.model)
    // 是苹果
    if (res.model.indexOf('iPhone')>=0) {
      this.WxRequest.interceptors.use({
        request(request) {
          const token = wx.getStorageSync('token');
          if (token) {
            request.header['x-auth-token'] = token;
            // request.header['X-Auth-Token'] = token;
          }
          return request
        },
        requestError(requestError) {
          wx.hideLoading()
          return Promise.reject(requestError)
        },
        response(response) {
          const token = response.header['x-auth-token']
          // const token = response.header['X-Auth-Token']
          if (token) {
            response.data.token = token;
            wx.setStorageSync('token', token);
          }
          if (response.statusCode === 200) {
            return Promise.resolve(response.data);
          } else {
            console.log('请求错误' + response.data.message)
            return Promise.reject(response.data);
          }
          return response
        },
        responseError(responseError) {
          console.log(responseError)
          if (responseError.statusCode === 403) {
            console.log(122)
            wx.showToast({
              title: '登录失效，请先登录',
              icon: 'none',
              duration: 1000
            })
            setTimeout(() => {
              wx.redirectTo({
                url: '../login/login'
              })
            }, 1000);
          }
          return Promise.reject(responseError)
        },
      })
    } else {
      this.WxRequest.interceptors.use({
        request(request) {
          const token = wx.getStorageSync('token');
          if (token) {
            request.header['X-Auth-Token'] = token;
          }
          return request
        },
        requestError(requestError) {
          wx.hideLoading()
          return Promise.reject(requestError)
        },
        response(response) {
          const token = response.header['X-Auth-Token']
          if (token) {
            response.data.token = token;
            wx.setStorageSync('token', token);
          }
          if (response.statusCode === 200) {
            return Promise.resolve(response.data);
          } else {
            console.log('请求错误' + response.data.message)
            return Promise.reject(response.data);
          }
          return response
        },
        responseError(responseError) {
          console.log(responseError)
          if (responseError.statusCode === 403) {
            console.log(122)
            wx.showToast({
              title: '登录失效，请先登录',
              icon: 'none',
              duration: 1000
            })
            setTimeout(() => {
              wx.redirectTo({
                url: '../login/login'
              })
            }, 1000);
          }
          return Promise.reject(responseError)
        },
      })
    }
  }
})