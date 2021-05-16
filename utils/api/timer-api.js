import request from '../request'
// request 做了自动向params中添加uid的操作，因此可以不带入uid

// 设备添加定时任务
//instruct示例：
// [
//   {
//       "functions":[
//           {
//               "code":"switch",
//               "value":true
//           },
//           {
//             "code":"switch_vertical",
//               "value":true
//           }
//       ],
//       "date":"20200320",
//       "time":"17:41"
//   }
// ]
export const timerAdd = (device_id, loops, category, instruct) => {
  return request({
    name: 'ty-service',
    data: {
      "action": "timer.add",
      "params": {
        "device_id":device_id,
        "loops":loops,
        "category":category,
        "timezone_id":"Asia/Shanghai",
        "time_zone":"+8:00",
        "instruct":instruct
      }
    }
  })
}

//修改定时任务
export const timerEdit = (device_id, group_id, loops, category, instruct) => {
  return request({
    name: 'ty-service',
    data: {
      "action": "timer.edit",
      "params": {
        "device_id":device_id,
        "group_id":group_id,
        "loops":loops,
        "category":category,
        "timezone_id":"Asia/Shanghai",  //时区固定为上海
        "time_zone":"+8:00",
        "instruct":instruct
      }
    }
  })
}

//更新定时任务状态
export const timerStatus = (device_id, category, group_id, status) => {
  return request({
    name: 'ty-service',
    data: {
      "action": "timer.status",
      "params": {
        "device_id":device_id,
        "category":category,
        "group_id":group_id,
        "status":status
      }
    }
  })
}

// 查询设备下的定时任务列表
export const timerList = (device_id) => {
  return request({
    name: 'ty-service',
    data: {
      action: 'timer.list',
      params: {
        device_id
      }
    }
  })
}

// 删除某个分类下面的某个定时组的定时任务
export const timerDelete = (device_id, category, group_id) => {
  return request({
    name: 'ty-service',
    data: {
      action: 'timer.deleteByGroup',
      params: {
        "device_id": device_id,
        "category": category,
        "group_id": group_id
      }
    }
  })
}