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
        wx_id: 0,
        person_info: {
          name: '',
          class_id: 0,
          is_student: false,
          is_teacher: false,
          subjects: [],
        },
        has_person_info: false,

        subjects_detail: [{
            name: '',
            score_node: [{
                date: 0,
                score: 0,
            }],
            mean3: 99,
            mean5: 80,
            mean10: 89,
            mean20: 92,
        },
        ],
        has_subjects_detail: false,
        ec: {
            onInit: initChart,
        },
        chart: null,
        show_chart: false,
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
        this.get_wx_id();
        this.get_person_info();
        this.get_all_score();
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
        console.log('onReady');
        //setTimeout(function () {
        //    // 获取 chart 实例的方式
            console.log(chart)
          //}, 2000);
    },

    goto_index: function () {
        console.log('goto_index');
        wx.navigateTo({
            url: '../index/index',
        })
    },
    get_all_score: function () {
        console.info('get_all_score');
        var tmp_all_subjects_detail = [{
                name: '英语',
                score_node: [{
                        date: (new Date("2018/07/02")),
                        score: 75,
                    },
                    {
                        date: (new Date("2018/08/02")),
                        score: 78,
                    },
                    {
                        date: (new Date("2018/09/02")),
                        score: 75,
                    },
                    {
                        date: (new Date("2018/10/02")),
                        score: 79,
                    },
                    {
                        date: (new Date("2018/11/02")),
                        score: 79,
                    },
                    {
                        date: (new Date("2018/12/02")),
                        score: 83,
                    },
                    {
                        date: (new Date("2019/01/02")),
                        score: 85,
                    },
                    {
                        date: (new Date("2019/02/02")),
                        score: 83,
                    },
                    {
                        date: (new Date("2019/03/02")),
                        score: 88,
                    },
                    {
                        date: (new Date("2019/04/02")),
                        score: 91,
                    }]
                },{
                name: '数学',
                score_node: [{
                    date: (new Date("2018/07/02")),
                    score: 80,
                },
                {
                    date: (new Date("2018/08/02")),
                    score: 82,
                },
                {
                    date: (new Date("2018/09/02")),
                    score: 89,
                },
                {
                    date: (new Date("2018/10/02")),
                    score: 87,
                },
                {
                    date: (new Date("2018/11/02")),
                    score: 93,
                },
                {
                    date: (new Date("2018/12/02")),
                    score: 86,
                },
                {
                    date: (new Date("2019/01/02")),
                    score: 93,
                },
                {
                    date: (new Date("2019/02/02")),
                    score: 95,
                },
                {
                    date: (new Date("2019/03/02")),
                    score: 93,
                },
                {
                    date: (new Date("2019/04/02")),
                    score: 97,

                }],
            },
        ];
        var tmp_subjects_detail = {
            name: '语文',
            score_node: [],
        };
        tmp_subjects_detail.score_node.push({
            
           
            date: (new Date("2019/04/02")),
            score: 94,
            dateString: "2019/04/02",
        },
        {
            date: (new Date("2019/03/02")),
            score: 92,
            dateString: "2019/03/02",
        },
        {
            date: (new Date("2019/01/02")),
            score: 92,
            dateString: "2019/01/02",
        },
        {
            date: (new Date("2018/12/22")),
            score: 89,
            dateString: "2018/12/22",
        },
        {
            date: (new Date("2018/12/02")),
            score: 91,
            dateString: "2018/12/02",
        },
        {
            date: (new Date("2018/11/02")),
            score: 90,
            dateString: "2018/11/02",
        },
        {
            date: (new Date("2018/08/22")),
            score: 91,
            dateString: "2018/08/22",
        },
        {
            date: (new Date("2018/07/22")),
            score: 89,
            dateString: "2018/07/22",
        },
        {
            date: (new Date("2018/07/02")),
            dateString: "2018/07/02",
            score: 87,
        });
        tmp_all_subjects_detail.unshift(tmp_subjects_detail);
        
        this.setData({
            subjects_detail: tmp_all_subjects_detail,
            has_subjects_detail: true,
        });
    },
    tap_trend: function () {
        console.info('tap_trend');
        this.setData({
            show_chart: true,
        });
        if (!(this.view_trend())) {
            this.view_trend();
        };
        return true;
    },
    view_trend: function () {
        console.info('view_trand');
        if (this.data.has_subjects_detail){
            console.info('ss');
        }
        else {
            this.get_all_score();
        }
        var series = [];
        var j = 0;
        var len = this.data.subjects_detail.length;
        console.log(this.data.subjects_detail);
        for (j=0; j<len; j++) {
            var series_data =
            this.score_node_2_series_data(this.data.subjects_detail[j].score_node);
            series.push({
                data: series_data,
                type: 'line',
            });
        };

        var option = {
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
            var point_date = score_node[j].date;
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