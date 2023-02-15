import Router from 'koa-router';
import crypto from 'crypto';
import signController from '../controller/api/signin.js';
import { ChatGPTAPI } from 'chatgpt';
import { Context } from 'koa';
import xml from "./../utils/xml/xmlTool.js";

const router = new Router();
const api = new ChatGPTAPI({ apiKey: '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',debug: true})
// @ts-ignore
// const api = new ChatGPTAPI({ sessionToken: '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'})


const encryption = {
  md5: (str: crypto.BinaryLike) => {
    return crypto.createHash('md5').update(str).digest('hex')
  },
  sha1: (str: crypto.BinaryLike) => {
    return crypto.createHash('sha1').update(str).digest('hex')
  }
}

const resultMsg = async (msg, content)=> {
  const { text } = await api.sendMessage(content as string,{
    onProgress: (partialResponse) => partialResponse.text,
    timeoutMs: 5 * 1000
  })
  return wxXmlImc(msg, text)
}

const wxXmlImc = (msg, content) => {
  return xml.jsonToXml({
      xml: {
          ToUserName: msg.FromUserName,
          FromUserName: msg.ToUserName,
          CreateTime: Date.now(),
          MsgType: msg.MsgType,
          Content: content
      }
  })
}

// 鉴权
router.get('/', async(ctx)=>{
  const {signature = '', timestamp = '', nonce = '', echostr = ''} = ctx.query
  const token = "123987"
  // token: 123987
  // EncodingAESKey: paUsXgrPXTibI73MobwPJufJUK8dk5SqdmeiGfaVwrj
  // 验证token
  const str = [token, timestamp, nonce].sort().join('')
  const sha1 = encryption.sha1(str)
  if (sha1 !== signature) {
    ctx.body = 'token验证失败'
    return
  } else {
    ctx.body = echostr
  }
});
// 消息接收
router.post('/', async(ctx)=>{
  const body:{xml?:string} = await xml.xmlToJson(ctx.request.body);
  let msg,
        MsgType,
        result

  try {
    msg = body ? body.xml : ''

    if (!msg) {
        ctx.body = wxXmlImc(msg, 'error request.')
        return;
    }

    MsgType = msg.MsgType[0]

    switch (MsgType) {
        case 'text':
            result = await resultMsg(msg, msg.Content)
            break;
        default: 
            result = wxXmlImc(msg, '此类消息还在学习中！')
    }

    console.log("msg:", MsgType, body, result);

    ctx.res.setHeader('Content-Type', 'application/xml')
    // ctx.res.end(result)
    ctx.body = result;

  } catch (error) {
    ctx.body = wxXmlImc(msg, '麻了,cpu炸了,等一等！');
  }
});

router.get('/chatgpt', async(ctx: Context):Promise<void> =>  {
  const { q='who are you?' } = ctx.query
  // try {
  //   const res = await api.sendMessage(q as string)
  //   ctx.body = res.text;
  // } catch (error) {
  //   ctx.body = error;
  // }

  // let res = await api.sendMessage('What is OpenAI?')
  // console.log(res.text)

  // // send a follow-up
  // res = await api.sendMessage('Can you expand on that?', {
  //   conversationId: res.conversationId,
  //   parentMessageId: res.id
  // })
  // console.log(res.text)

  // // send another follow-up
  // res = await api.sendMessage('What were we talking about?', {
  //   conversationId: res.conversationId,
  //   parentMessageId: res.id
  // })
  // console.log(res.text)

  const res = await api.sendMessage(q as string, {
    // print the partial response as the AI is "typing"
    onProgress: (partialResponse) => {
      // console.log(partialResponse.text)
      return partialResponse.text
    },
    timeoutMs: 2 * 60 * 1000
  })
  ctx.body = res.text;
});

router.post('/signin', signController.postSignIn);

export default router;
