// 配置
var apiDomain = 'http://127.0.0.1:8080'; // api域名
var apiUrl = {
  getUsers: apiDomain + '/movies/getUsers', // 获取用户api地址
  recommend: apiDomain + '/movies/getRecommendItems', // 推荐api地址
  search: apiDomain + '/movies/getSearchItems', // 搜索api地址
};

var pageSize = 10; // 每页显示多少部电影
var columns = 5; // 一列显示多少部电影

var algorithmList = [
  {
    name: 'MostPopular',
    value: 'MostPopular',
  },
  {
    name: 'ItemKNN',
    value: 'ItemKNN',
  },
  {
    name: 'UserKNN',
    value: 'UserKNN',
  }
];


var Status = {
  ready: 'ready', // 初始化
  loading: 'loading', // 加载中
  success: 'success', // 成功
  error: 'error', // 失败
};

var cacheData = []; // 缓存数据,用于前端分页

new Vue({
  el: '#container',
  data: {
    isInit: false, // 是否已初始化,防止一进来看到页面乱码
    type: 'search', // 类型(search:搜索 recommend:推荐)
    columns: columns, // 一列显示多少部电影
    users: {
      open: false,  // 是否显示用户下拉列表
      data: [],
      index: -1
    },
    algorithm: {
      open: false,  // 是否显示算法下拉列表
      data: algorithmList,
      index: -1
    },
    // 推荐
    keyword: '', // 搜索关键字
    // 搜索结果
    result: {
      page: 1, // 当前是第几页
      pageCount: 1, // 总共有多少页
      data: [], // 数据
      style: {},
      status: Status.ready
    }
  },
  mounted: function () {
    // 获取页面链接
    this.init();
  },
  methods: {
    // 初始化
    init: function () {
      // 获取链接参数
      var params = this.getParams(location.search);
      if (params && params.type) {
        this.type = params.type;
      }
      this.isInit = true;
      this.getUsers();
      // this.search();
      var me = this;
      document.addEventListener('click', function (e) {
        var className = e.target.getAttribute('class');
        if (className && className.indexOf('dropdown-toggle') !== -1) {

        } else {
          me.algorithm.open = false;
          me.users.open = false;
        }
      });
    },
    // 获取用户
    getUsers: function () {
      var me = this;
      // 请求参数
      var data = {};
      var query = {
        method: "GET",
        url: apiUrl.getUsers,
        dataType: "json",
        data: data
      };
      $.ajax(query).done(function (res) {
        me.users.data = res.content;
      }).fail(function () {
      });
    },
    // 获取推荐
    getRecommend: function () {
      // 判断是否选择了算法
      if (this.algorithm.index === -1) {
        alert('请先选择推荐算法');
        return;
      }
      this.search();
    },
    // 开始搜索
    search: function () {
      var result = this.result;
      result.status = Status.loading;
      result.page = 1;
      result.data = [];
      result.style = {};


      var me = this;

      // 请求参数
      var data;
      if (this.type === 'recommend') {
        // 推荐
        data = {
          recommendKey: this.algorithm.data[this.algorithm.index].value
        };
      } else {
        // 搜索
        data = {
          searchKey: this.keyword
        };
      }
      if (this.users.index !== -1) {
        data.userIndex = this.users.data[this.users.index].id;
      }
      var query = {
        method: "GET",
        url: this.type === 'search' ? apiUrl.search : apiUrl.recommend,
        dataType: "json",
        data: data
      };
      $.ajax(query).done(function (res) {
        cacheData = res.content;
        me.result.pageCount = Math.ceil(cacheData.length / pageSize);
        me.showPage(result.page);
        me.result.status = Status.success;
      }).fail(function () {
        me.result.status = Status.error;
      });
    },
    // 显示下拉框(算法)
    showAlgorithm: function () {
      this.algorithm.open = true;
    },
    // 选择(算法)
    selectAlgorithm: function (index) {
      this.algorithm.index = index;
    },
    // 显示下拉框(用户)
    showUser: function () {
      this.users.open = true;
    },
    // 选择(用户)
    selectUser: function (index) {
      this.users.index = index;
    },
    getParams: function (search) {
      if (search) {
        var index = 0;
        if (search.indexOf('?') !== -1) {
          index = 1;
        }
        var params = {};
        search.substr(index).split('&').forEach(item => {
          var pair = item.split('=');
          params[pair[0]] = pair[1];
        });
        return params;
      }
      return null;
    },
    // 显示对应的页数
    showPage: function (page) {
      // 取第几页显示
      var { length } = this.result.data;
      if (length < page) {
        var arr = cacheData.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);
        // this.result.data=this.result.data.concat(arr);
        this.result.data.push(arr);
      }
      this.result.page = page;
      // 计算位移
      var delta = -(page - 1) * 100;
      var translate = `translate(${delta}%,0)`;
      var style = {
        transform: translate,
        webkitTransform: translate,
      };
      this.result.style = style;
    },
    // 上一页
    prevPage: function () {
      if (this.result.page > 1) {
        this.showPage(this.result.page - 1);
      }
    },
    // 下一页
    nextPage: function () {
      if (this.result.page < this.result.pageCount) {
        this.showPage(this.result.page + 1);
      }
    }
  }
});