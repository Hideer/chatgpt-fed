import request from '@/axios/axios'
import api from '@/axios/apiNames'


// 获取chatgpt消息
export const getChatGptMessage = (data:any) => { 
    let params = {
      url: api.chatgpt,
      data
    }
  return request.get(params)
}