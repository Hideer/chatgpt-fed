import Router from 'koa-router';
import crypto from 'crypto';
import signController from '../controller/api/signin.js';
import { ChatGPTAPI, ChatGPTUnofficialProxyAPI } from 'chatgpt';
import { Context } from 'koa';
import xml from "./../utils/xml/xmlTool.js";

const router = new Router();
const api = new ChatGPTAPI({ apiKey: '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'})
// @ts-ignore
// const api = new ChatGPTAPI({ sessionToken: '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'})
// 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
// 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
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

router.get('/ai', async(ctx: Context):Promise<void> =>  {
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

  try {
    const res = await api.sendMessage(q as string, {
      // print the partial response as the AI is "typing"
      onProgress: (partialResponse) => {
        // console.log(partialResponse.text)
        return partialResponse.text
      },
      timeoutMs: 2 * 60 * 1000
    })
    console.log(res);
    ctx.body = res.text;
  } catch (error) {
    const api = new ChatGPTUnofficialProxyAPI({
      accessToken: 'eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..1a40KVlyl_IuVZZK.oZCfWazJxi7sqdONHPqeojZihy3aDRBQ59ScvFCBbqE4aSRghbem7LuH5PIqdNUcr_41co7dnVHIFxZZCVnT42AEKZGqzHf8-KdBb7MqT-BEyAF3wj8Q5y0rpBHVyzWFlOTlOl7do-MDSqaHl7w1MpgFjgss4qBkwX7m5xw7XEM9YZVFG8KeJfWTrQ5Kp_WVTtOVAcfRafOZkyY9DPCZ7fTp21E2OA4DQb7XPjvDce-fq6L4EA3GGeCNPfRNGg75lmE0qHbukqJYSqI_kZnvrbjil0MMD6MSgqDx_y9wGyrYLxMAbMo_x4FEnB2P8runYd_v-jikAkREcB8fm9DPTlo76290u3x2CPsizQcFrN6Ob-zjzxdGblENBn0Ufrspg4kRsS0Z0YUwz48pXH46XN5nggir_D8R4hQ0ajomObENkjqzNHAxni4N_qQT9xRhM7zpfkeuykdeBwPjw0aAjq9JjLitN88a0B4DllM5R8MR-LnYTQbTPF2HGKIGB8-RPFFhQJqHmsZBOscyUpykHnQmKn-krgCAJZHoHlXt7-8U_bsMRaeFlKTfaOH8gfb7NteBcEl2Yx-x03oNQXiMNRh2zHaOW1byDWaTsKxFj0PfOy_BUrdDLxfJFMY_rWFkUsu2OB5goAiMerwOBpDeB4UhOXEZOnAlM46IGsyD-YIINewe9tr_4SftH3ujdKMSbx8-Dfajocdh6GHpszbNUEyXgbWZOS_w8h89g1JBIPEH7xsE26p93NO68_Smxu__DCPqT3Z4-UN37I_E_7h4ywjCrDSizibZNxwfeK_BSxDYADxdJHEk-BX4CGbLGunrbu4iNr5tgpLhVGKPeTljbpTTmZ74_9bQov8PYABw7B01kucy5SO-y5j9KnFrBcAtjROm1iANCMGW3ooNyHyXf94ZatQi8Sd_W6K-6WJyp6bwrd00cwlKK7_IfovbldCJ-y-S4OOa7wB_nsB8VUJSieAjefs_c4M6EVqH2SJrnh1JNqs4giXT5s6rEO7mfp1M3hIGggGXbulbwPrmkeGx3TiYt242dSFk1rS3nOfypXE9djJan23shWIKLsdX2sefaRb514id2UYMsmdoq6qiMGbs5qG-t07vAAhm6bsyZcxR8hm_p0cvjlxt3-WESXBsTbOFAGYTAoYY6RyDP9ziIdPEEwRqONcYMnmmbfC-pUv7UTrsEjucdPoglc1cgqYE6VYYr_FMPDNkukkKM67kffThZ2xqwCf2794xyzD3QoAwOtFrDHNFR1hktgURPkG3j5Cvj6Ojri9nWohnkiv5t0eftONPn95daaM7bWxbvup3TnDAKZq7dfQ9XmDAZsTYdGNE2w5G6s9_WBcovuSpLHORzPo-w7Y3csE59KQP3jTjAWgiTWWSrTy2vaSmbTkPdarlG7VmY874DKZjwBITYJQCjgcJECReZdpLuBCzVpSMTn38XMIpry_-_EiOfg5DKCjY4LRdbkp35mbKOKA094ofY-niT1Nbl0-HvHm9cROCx6gqSoBhVIjsUPsjwzdxYSi9DTmeX7hkP9T5Nk5uBLpgvSBBvClQFJSS2gDXToYFYnYZcSHkp737J-pQNX4qlrfoCBHAg21_iY6_dGPTYdQvFA9EKbRqufSdgMxjC2cz61dU4YHIzvLnCYVFzdYnOPZXa16vUOuUdyBkUm4dmz6XPGE4nH1ECE35HEA78CZx3hT-y5vtSgznxaJ4thp2QoryK0dggqKBVpUXVHEvknoYuXcEqv9O4HSHLxfgVsKpWrragsLavgpVsGG0jOVHSbOXzCdaELrmEp1pYINUJt2A49jcDYO2XdCmeBDqVBSGX3bz-6arCV8-FnjGbRxv-WS6xdeJvKG3Yb7BQSmg3wOtqO5LuGbuRwftIyJtV6VyIhWa6Xzfjxd4kifehlGK80G6gKH9Wcr6vEgrmsGLJa2gwfhQjxIVYk0vl18cKsq861W9RV63oH-ac99PrSJ-BUC9EwvCizQ3xI6K0IFFi4SfcF0dnHXkZWudJc1dgD-52UkE_yV5pVmA5DbPkzZObRy4fllmx5WSDuW1BflU0rMOAArvP5VRaSaRfZwKnDFPrkjDqq-6LjDHIaFR9ttd1qCVa9lx0hfHs1xCcuohMzxjHksnGqB6NltlDLw69uid5gJqwzRkiRlgRQ3B7mI2iCPboDd-kG0e_qdtyELckTAbtyUniYsRptNkt5U_W6LzVvodXhK7rwBKg3ErYnBB0N7gZYKePX9ENs3uej-Amk8LshwybTvqPIDbUdvPaKpcPCi3uJe7zPkLDxyVRIKDCtIPNGY66GNFdF96hUE7j39vMnYoW1-tZU5ziVK-700JvpgUZJO9dOURCfBDkmtkZ-_prLfMTYL4WGdzPhfKYnfS6zURSFQFD0scFx49v08MJ2s1YqpKhNuTB7fcIRYPAlaRD-7w9OuNT_0AhlfjOV_j0sBld-KuNpsWWi_MDxuOfIi2FVxyCD0FLdYG7DKVflb7dQhFZg.8V4qMEbhEbH_QglVcIGlwg'
    })
    const res = await api.sendMessage('Hello World!')
    console.log(res.text)
    console.log(error);
    ctx.body = error;
  }
});

router.post('/signin', signController.postSignIn);

export default router;
