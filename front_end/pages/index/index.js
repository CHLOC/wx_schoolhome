//index.js
//获取应用实例
const app = getApp()

Page({
    data: {
        motto: '您好',
        wx_id:0,
        person_info: {
        },
        student_info: {

            current_class_id: 0,
            
        },
        has_person_info: false,
        
        userInfo: {},
        hasUserInfo: false,
        canIUse: wx.canIUse('button.open-type.getUserInfo')
    },
    //事件处理函数
    bindViewTap: function() {
        wx.navigateTo({
            url: '../logs/logs',
        })
    },
    goto_homework: function() {
        console.log ("goto_homework");
        wx.navigateTo({
            url: '../homework/homework',
        });
    },
    goto_score: function () {
        wx.navigateTo({
            url: '../score/score',
        })
    },
    goto_bbs: function () {
        wx.navigateTo({
            url: '../bbs/bbs',
        })
    },
    next_page: function() {
        wx.navigateTo({
            url: '../first_page/first_page',
        })
    },
    onLoad: function() {
        this.get_person_info();
    },
    getUserInfo: function(e) {
        console.log(e)
        app.globalData.userInfo = e.detail.userInfo
        this.setData({
            userInfo: e.detail.userInfo,
            hasUserInfo: true
        });
        this.get_person_info();
    },
    get_wx_id: function () {
        console.info('get_wx_id');
        this.setData({
            wx_id: app.globalData.wx_id,
        })
    },
    get_person_info: function () {
        console.info('get_person_info');
        this.setData({
            person_info: app.globalData.person_info,
            has_person_info: app.globalData.has_person_info,
        });
    },
    wx_login: function (){
        var that = this;
        wx.login({
            success(res) {
                console.log(res);
                if (res.code) {
                    wx.request({
                        url: 'http://192.168.1.75:5000/login',
                        method: "POST",
                        header: {
                            'content-type': 'application/json',
                            'chartset': 'utf-8',
                        },
                        data: {
                            code: res.code
                        },
						success: function (res) {
								console.log("receive person_info");
								console.log(res.data);
								if (res.data.person_id > 0) {
            						app.globalData.person_info = res.data;
									app.globalData.has_person_info = true;
                                    if (res.data.is_teacher) {
                                        that.setData({
                                            motto: '老师您好',
                                        });
                                    } 
                                    else {
                                        that.setData({
                                            motto: '家长您好',
                                        });
                                    }
                                    that.setData({
                                        person_info: res.data,
                                        has_person_info: true,
                                    });
								}
						},
                    });
                } else {
                    console.log('login fail: '+res.errMsg);
                }
            },
        })
    }
})
