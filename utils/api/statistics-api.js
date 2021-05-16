import request from '../request'
// request 做了自动向params中添加uid的操作，因此可以不带入uid

// 按小时统计:查询具体的设备，最近7天的状态统计，返回当天中每个小时的统计
export const getStatiHours = (device_id, start_hour, end_hour) => {
  return request({
    name: 'ty-service',
    data: {
      action: 'statistics.hours',
      params: {
        "device_id":device_id,
        "code":"add_ele",
        "start_hour":start_hour,
        "end_hour":end_hour
      }
    }
  })
}

// 按天统计:按天统计累计值
export const getStatiDays = (device_id, start_day, end_day) => {
  return request({
    name: 'ty-service',
    data: {
      action: 'statistics.days',
      params: {
        "device_id":device_id,
        "code":"add_ele",
        "start_day":start_day,
        "end_day":end_day
      }
    }
  })
}

// 按月统计:按月统计累计值
export const getStatiMonths = (device_id, start_month, end_month) => {
  return request({
    name: 'ty-service',
    data: {
      action: 'statistics.months',
      params: {
        "device_id":device_id,
        "code":"add_ele",
        "start_month":start_month,
        "end_month":end_month
      }
    }
  })
}

// 获取目标功能点的统计结果累加值
export const getStatiAll = (device_id) => {
  return request({
    name: 'ty-service',
    data: {
      action: 'statistics.all',
      params: {
        "device_id":device_id,
        "code":"add_ele"
      }
    }
  })
}

// 查询具体的设备当前可支持的统计类型
export const getStatiType = (device_id) => {
  return request({
    name: 'ty-service',
    data: {
      action: 'statistics.allType',
      params: {
        "device_id":device_id
      }
    }
  })
}