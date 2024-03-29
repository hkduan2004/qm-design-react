/*
 * @Author: 焦质晔
 * @Date: 2021-06-19 08:45:54
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-05-17 15:44:31
 */
export default {
  name: 'zh-cn',
  qm: {
    button: {
      confirmPrompt: '提示',
      confirmTitle: '确认执行删除吗？',
    },
    divider: {
      collect: '收起',
      spread: '展开',
    },
    dialog: {
      fullScreen: '全屏',
      cancelFullScreen: '取消全屏',
      close: '关 闭',
      confirm: '确 定',
    },
    form: {
      search: '搜 索',
      reset: '重 置',
      save: '保 存',
      spread: '展开',
      collect: '收起',
      trueText: '是',
      falseText: '否',
      draggable: '拖动排序',
      requiredTips: '不能为空',
      inputPlaceholder: '请输入...',
      selectPlaceholder: '请选择...',
      treePlaceholder: '树节点过滤',
      rangeInputNumberPlaceholder: ['开始值', '结束值'],
      datePlaceholder: '选择日期',
      timePlaceholder: '选择时间',
      weekPlaceholder: '选择周',
      monthPlaceholder: '选择月',
      yearPlaceholder: '选择年',
      daterangePlaceholder: ['开始日期', '结束日期'],
      timerangePlaceholder: ['开始时间', '结束时间'],
      monthrangePlaceholder: ['开始月份', '结束月份'],
      yearrangePlaceholder: ['开始年份', '结束年份'],
      datePickers: ['今天', '昨天', '一周前', '一个月前'],
      dateRangePickers: ['最近一周', '最近一个月', '最近三个月', '最近六个月'],
      citySelectType: ['按省份', '按城市'],
      regionSelectLabel: ['省', '市', '区', '街道'],
    },
    clipboard: {
      success: '复制成功',
      error: '复制失败',
    },
    download: {
      text: '下载',
      success: '文件下载成功',
      error: '文件下载失败！',
    },
    upload: {
      tooltip: '只能上传 {type} 格式',
      notType: '不支持的文件类型 {type}',
      sizeLimit: '大小不能超过 {size}M',
      uploadError: '文件上传失败！',
      downError: '文件下载失败！',
      text: '点击上传',
    },
    uploadCropper: {
      dragableText: '拖放或点击',
      tooltip: '只能上传 {type} 格式的图片',
      preview: '图片预览',
      cropper: '图片裁剪',
      uploadError: '图片上传失败！',
      downError: '图片下载失败！',
      text: '上传图片',
      zoomIn: '放大',
      zoomOut: '缩小',
      rotatePlus: '顺时针',
      rotateSubtract: '逆时针',
    },
    print: {
      preview: '打印预览',
      pageSetting: '页面设置',
      printError: '打印失败！',
      exportError: '导出失败！',
      defaultPrinter: '默认打印机',
      laserPrinter: '激光打印机',
      stylusPrinter: '针式打印机',
      printer: '打印机',
      type: '类型',
      copies: '份数',
      printPage: ['打印第', '几页'],
      setting: '设置',
      export: '导出',
      print: '打印',
      scale: '缩放',
      paper: '纸张',
      pageNumber: '页码',
      pagination: '第{currentPage}页 / 共{totalPage}页',
      setPanel: {
        printParameter: '打印参数',
        pagerType: '纸张类型',
        carbonPaper: '三联复写纸(针式)',
        printDirection: '打印方向',
        vertical: '纵向',
        horizontal: '横向',
        doublePrint: '双面打印',
        autoDoublePrint: '自动双面打印',
        manualDoublePrint: '手动双面打印',
        fixedLogo: '固定Logo',
        printMargin: '打印边距',
        leftMargin: '左边距',
        rightMargin: '右边距',
        topMargin: '上边距',
        bottomMargin: '下边距',
        sizeUnit: '厘米',
        noEmpty: '不能为空',
      },
    },
    split: {
      resize: '拖动改变大小',
    },
    searchHelper: {
      text: '搜索帮助',
      orderIndex: '序号',
    },
    table: {
      config: {
        selectionText: '选择',
        summaryText: '合计',
        copyText: '复制',
        emptyText: '暂无数据...',
      },
      alert: {
        total: '共 {total} 条',
        selected: '已选择 {total} 项',
        clear: '清空',
      },
      selection: {
        all: '全选所有',
        invert: '反选所有',
        clear: '清空所有',
        currentPage: '当前页全选',
      },
      columnFilter: {
        text: '列定义',
        reset: '重置',
        draggable: '拖动排序',
        fixedLeft: '固定左侧',
        fixedRight: '固定右侧',
        cancelFixed: '取消固定',
      },
      editable: {
        inputPlaceholder: '请输入',
        selectPlaceholder: '请选择',
        datePlaceholder: '选择日期',
        datetimePlaceholder: '选择时间',
      },
      sorter: {
        text: '排序',
        asc: '升序',
        desc: '降序',
      },
      filter: {
        search: '搜 索',
        reset: '重 置',
        searchText: '搜索{text}',
        searchAreaText: '搜索{text}，用逗号隔开',
        gtPlaceholder: '大于',
        ltPlaceholder: '小于',
        eqPlaceholder: '等于',
        neqPlaceholder: '不等于',
        text: '筛选',
      },
      screen: {
        full: '全屏',
        cancelFull: '取消全屏',
      },
      import: {
        text: '导 入',
        success: '成功导入 {total} 条记录',
        error: '导入失败，请检查字段名和数据格式是否正确',
        settingTitle: '导入设置',
        importType: '导入模式',
        insertPos: '插入位置',
        fillText: '新增',
        addText: '追加',
        insertText: '插入',
      },
      export: {
        text: '导 出',
        closeButton: '关 闭',
        settingTitle: '导出设置',
        fileName: '文件名',
        fileType: '文件类型',
        sheetName: '标题',
        all: '全部',
        selected: '选中',
        custom: '自定义',
        footSummation: '底部合计',
        useStyle: '使用样式',
      },
      clipboard: {
        text: '粘 贴',
        settingTitle: '粘贴设置',
        rowIndex: '粘贴起始行',
        colIndex: '粘贴起始列',
        content: '粘贴内容',
        placeholder: '请在此处 ctrl+v 粘贴数据',
        supportText: '说明：只支持粘贴 Excel 数据',
      },
      print: {
        text: '打印',
      },
      refresh: {
        text: '刷新',
      },
      selectCollection: {
        text: '行选集合',
        settingTitle: '行选列表',
        closeButton: '关 闭',
      },
      groupSummary: {
        text: '汇总',
        settingTitle: '汇总设置',
        savedSetting: '保存的汇总设置',
        saveButton: '保 存',
        closeButton: '关 闭',
        confirmButton: '显示汇总',
        removeText: '移除',
        configText: '配置名称',
        resultText: '汇总结果',
        sumText: '列值汇总',
        maxText: '列最大值',
        minText: '列最小值',
        avgText: '列平均值',
        countText: '条数汇总',
        operation: '操作',
        index: '序号',
        groupItem: '分组项',
        summaryColumn: '汇总列',
        calcFormula: '计算公式',
      },
      highSearch: {
        text: '高级检索',
        settingTitle: '高级检索设置',
        searchButton: '开始检索',
        closeButton: '关 闭',
        removeText: '移除',
        andText: '并且',
        orText: '或者',
        gtText: '大于',
        ltText: '小于',
        gteText: '大于等于',
        lteText: '小于等于',
        eqText: '等于',
        neqText: '不等于',
        inText: '包含',
        ninText: '不包含',
        likeText: '模糊匹配',
        configText: '配置名称',
        saveButton: '保 存',
        savedSetting: '保存的高级检索设置',
        operation: '操作',
        bracket: '括号',
        fieldName: '字段名',
        fieldType: '字段类型',
        expression: '运算',
        condition: '条件值',
        logic: '逻辑',
        noEmpty: '字段名不能为空',
      },
      fastSearch: {
        text: '数据定位查找',
        settingTitle: '数据定位查找设置',
        closeButton: '关 闭',
        savedSetting: '保存的数据查找设置',
        queryCondition: '请输入查询条件',
        notMatch: '没有符合条件的记录！',
        toTheEnd: '已查找到表格末尾，是否从头开始查找？',
        toStart: '已查找到表格开始，是否从末尾开始查找',
        tabPanes: ['查找条件', '更多条件'],
        matchCase: '大小写匹配',
        matchFullchar: '全字符匹配',
        clear: '清空条件',
        queryPrev: '查找上一个',
        queryNext: '查找下一个',
      },
    },
  },
};
