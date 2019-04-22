"use strict"
const app = getApp();
import * as echarts from '../../ec-canvas/echarts';

let chart = null;

function initChart(canvas, width, height) {
    chart = echarts.init(canvas, null, {
        width: width,
        height: height
    });
    canvas.setChart(chart);
    //chart.showLoading();
    console.log('initChart finish.');
    return chart;
}
// pages/score/score.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        name: '',
        current: 'list',
        wx_id: 0,
        person_info: {
          name: '',
          class_id: 0,
          is_student: false,
          is_teacher: false,
          subject: [],
        },
        has_person_info: false,

        subject_detail: {},
        //{{
        //    name: '',
        //    score_node: [{
        //        date: {},
        //        score: 0,
        //        dateString: "",
        //    }],
        //    mean3: 99,
        //    mean5: 80,
        //    mean10: 89,
        //    mean20: 92,
        //},},
        has_subject_detail: false,
        ec: {
            onInit: initChart,
        },
        chart: null,
        show_chart: false,
    },

    handleChange ({ detail }) {
        this.setData({
            current: detail.key
        });
        if ('trand'==detail.key) {
            this.tap_trend();
        }
        else if ('radar'==detail.key) {
            this.tap_radar();
        }
        else {
            this.clear_chart();
        }
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
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
        console.log('onReady');
        //this.get_wx_id();
        if (!this.data.has_person_info) {
            if (app.globalData.has_person_info) {
                this.get_person_info();
            }
        }
        if (this.data.has_person_info) {
            this.get_all_score();
        }
        else {
            console.log ("no person_info");
            return false;
        }
        setTimeout(function () {
            // 获取 chart 实例的方式
            console.log(chart)
        }, 200);
    },

    goto_index: function () {
        console.log('goto_index');
        wx.navigateTo({
            url: '../index/index',
        })
    },
    get_all_score: function () {
        console.info('get_all_score');
		if (!this.data.has_person_info) {
            this.get_person_info();
        }
        var that = this;
        wx.request({
            url: 'http://192.168.1.75:5000/score',
            method: "POST",
            header: {
                'content-type': 'application/json',
                'chartset': 'utf-8',
            },
            data: {
                person_info: this.data.person_info,
            },
            success: function (res) {
                    console.log("receive all score");
                    console.log(res.data);
                    that.setData({
                        subject_detail: res.data,
                        has_subject_detail: true,
                    });
            },
        });
    },
    clear_chart: function() {
        var option = {};
        if (chart) {
            chart.clear();
            chart.hideLoading();
            chart.setOption(option);
            return(true);
        }
    },
    tap_trend: function () {
        console.info('tap_trend');
        if (!this.data.has_subject_detail) {
            this.get_all_score();
        }
        if (this.data.has_subject_detail) {
            this.setData({
                show_chart: true,
            });
            chart.showLoading();
            this.view_trend();
            return true;
        }
        else {
            return false;
        }
    },
    view_trend: function () {
        console.info('view_trand');
        if (this.data.has_subject_detail) {
            console.info('ss');
        }
        else {
            this.get_all_score();
        }
        var series = [];
        var legend_data = [];
        console.log(this.data.subject_detail);
        if (this.data.has_subject_detail) {
            for (var a_subject in this.data.subject_detail) {
                console.log(a_subject);
                var a_subject_obj = this.data.subject_detail[a_subject];
                var series_data = this.score_node_2_series_data(a_subject_obj.node);
                series.push({
                    name: a_subject_obj.name,
                    data: series_data,
                    type: 'line',
                });
                legend_data.push(a_subject);
            };
        }

        var option = {
            legend: {
                data: legend_data,
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: {
                type: 'time',
            },
            yAxis: {
                type: 'value',
                scale: true,
            },
            series: series,
        }; 
        console.log(option);
        var timeout_count = 0;
        while ((null==chart) && (timeout_count<100)) {
            setTimeout(
                function(){
                    console.log('wait for chart');
                },10000,
            );
            timeout_count++;
        };
        console.log(timeout_count);
        console.info(chart);
        if (chart) {
            chart.clear();
            chart.hideLoading();
            chart.setOption(option);
            return(true);
        }
        else {
            console.warn('timeout, please try again.');
            return(false);
        }

    },
    tap_radar: function () {
        console.info('tap_radar');
        if (!this.data.has_subject_detail) {
            this.get_all_score();
        }
        if (this.data.has_subject_detail) {
            this.setData({
                show_chart: true,
            });
            this.view_radar();
            return true;
        }
        else {
            return false;
        }
    },
    view_radar: function () {
        console.info('view_radar');

        var option = {
            title: {
                text: '基础雷达图'
            },
            //tooltip: {},
            legend: {
                data: ['预算分配（Allocated Budget）', '实际开销（Actual Spending）']
            },
            radar: {
                // shape: 'circle',
                name: {
                    textStyle: {
                        color: '#fff',
                        backgroundColor: '#999',
                        borderRadius: 3,
                        padding: [3, 5]
                   }
                },
                indicator: [
                   { name: '销售（sales）', max: 6500},
                   { name: '管理（Administration）', max: 16000},
                   { name: '信息技术（Information Techology）', max: 30000},
                   { name: '客服（Customer Support）', max: 38000},
                   { name: '研发（Development）', max: 52000},
                   { name: '市场（Marketing）', max: 25000}
                ]
            },
            series: [{
                name: '预算 vs 开销（Budget vs spending）',
                type: 'radar',
                // areaStyle: {normal: {}},
                data : [
                    {
                        value : [4300, 10000, 28000, 35000, 50000, 19000],
                        name : '预算分配（Allocated Budget）'
                    },
                     {
                        value : [5000, 14000, 28000, 31000, 42000, 21000],
                        name : '实际开销（Actual Spending）'
                    }
                ]
            }]
        };
        console.log(option);
        var timeout_count = 0;
        while ((null==chart) && (timeout_count<100)) {
            setTimeout(
                function(){
                    console.log('wait for chart');
                },1000,
            );
            timeout_count++;
        };
        console.log(timeout_count);
        console.info(chart);
        if (chart) {
            chart.clear();
            chart.hideLoading();
            chart.setOption(option);
            return(true);
        }
        else {
            console.warn('timeout, please try again.');
            return(false);
        }

    },
    score_node_2_series_data: function(score_node) {
        console.log('score_node_2_series_data');
        var series_data = [];
        var j = 0;
        var len = 0;
        for (j=0, len=score_node.length; j<len; j++) {
            var point_date = new Date(score_node[j].date);
            var data_point = {
                name: point_date.toString(),
                value: [
                    [
                        point_date.getFullYear(),
                        point_date.getMonth()+1,
                        point_date.getDate(),
                    ].join('/'),
                    score_node[j].score,
                ],
            };
            series_data.push(data_point);
        };
        return series_data;
    }
});

//function initChart(cannvas, width, height) {
//    const chart = echarts.init(canvas, null, {
//        width: width,
//        height: height
//    });
//    canvas.setChart(chart);
//
//    var option = {
//        title: {
//            text: 'stached line',
//        },
//        tooltip: {
//            trigger: 'axis'
//        },
//        legend: {
//            data: ['yuwen','shuxhue',],
//        },
//        grid: {
//            left: '3%',
//            right: '4%',
//            bottom: '3%',
//            containLabel: true,
//        },
//        toolbox: {
//            feature: {
//                saveAsImage: {},
//            },
//        },
//        xAxis: {
//            type: 'category',
//            boundaryGap: false,
//            data: ['1','2',],
//        },
//        yAxis: {
//            type: 'value',
//        },
//        series: [{
//            name: 'yuwen',
//            type: 'line',
//            data: [90,91,92],
//        },
//        {
//            name: 'shuxue',
//            type: 'line',
//            data: [100,80,90],
//        },],
//    };
//    chart.setOption(option);
//    return chart;
//};
