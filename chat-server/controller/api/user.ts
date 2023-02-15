import { Context } from 'koa';
import { ChatGPTAPI } from 'chatgpt';
// const importDynamic = new Function( 'modulePath', 'return import(modulePath)', );
// const { ChatGPTAPI } = await importDynamic("chatgpt"); 
// this.gptApi = new ChatGPTAPI({ 
//       apiKey: process.env.OPENAI_API_KEY as string,
// });

const api = new ChatGPTAPI({ apiKey: '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'})

export default {
  getUser: async(ctx: Context):Promise<void> =>  {
    const { q='who are you?' } = ctx.query
    try {
      const res = await api.sendMessage(q as string)
      ctx.body = res.text;
    } catch (error) {
      ctx.body = error;
    }
  },
};
