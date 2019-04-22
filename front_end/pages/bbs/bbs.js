const app = getApp();
// pages/bbs/bbs.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        person_info: {
          name: '',
          class_id: 0,
          is_teacher: false,
        },
        has_person_info: false,
        article_list: {},

    },

    get_person_info: function () {
        console.info('get_person_info');
        this.setData({
            person_info: app.globalData.person_info,
            has_person_info: app.globalData.has_person_info,
        });
    },

    get_article_list: function() {
        if (!this.data.has_person_info) {
            this.get_person_info();
        }
        if (this.data.has_person_info) {
            var that = this;
            wx.request({
                url: 'http://192.168.1.75:5000/bbs',
                method: "POST",
                header: {
                    'content-type': 'application/json',
                    'chartset': 'utf-8',
                },
                data: {
                    person_info: this.data.person_info,
                },
                success: function (res) {
                    console.log(res.data);
                    var res_data = res.data;
                    that.setData({
                        article_list: res_data,
                    });
                    wx.showToast({
                        title: "ok",
                        icon: 'success',
                        duration: 1000,
                    });
                }
            });
        }
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
        this.get_person_info();
        this.get_article_list();
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})
