import React, {useEffect} from 'react'
import useCounterModel from '@/store/store'
import { withRouter, Link } from 'react-router-dom'
import Chat, { Bubble, useMessages, toast } from "@chatui/core";
import { getChatGptMessage } from './services'
import "@chatui/core/dist/index.css";


const initialMessages = [
  {
    type: 'text',
    content: { text: '主人好，我是您的专属AI助理，你的贴心小助手~' },
    user: { avatar: '//gw.alicdn.com/tfs/TB1DYHLwMHqK1RjSZFEXXcGMXXa-56-62.svg' },
  },
];

// 默认快捷短语，可选
const defaultQuickReplies = [
  {
    // icon: 'message',
    name: 'AI翻译',
    // isNew: true,
    isHighlight: true,
  },
  {
    name: 'AI解惑',
    isHighlight: true,
    // isNew: true,
  },
  // {
  //   name: '短语2',
  //   isHighlight: true,
  // },
  // {
  //   name: '短语3',
  // },
];

function Home(props: any) {
  const { messages, appendMsg, setTyping } = useMessages(initialMessages);

  // 快捷短语回调，可根据 item 数据做出不同的操作，这里以发送文本消息为例
  function handleQuickReplyClick(item: { name: string; }) {
    // handleSend('text', item.name);
    toast.show('工程师🚧中~',undefined);
  }

  function handleSend(type:string, val:string) {
    if (type === "text" && val.trim()) {
      appendMsg({
        type: "text",
        content: { text: val },
        position: "right",
        user: { avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ3zMOyZSgz-F311pvH8sMQB9G1HYks5eqFMA&usqp=CAU' },
      });

      setTyping(true);

      getChatGptMessage({q:val}).then((text:string)=>{
        appendMsg({
          type: "text",
          content: { text },
          user: { avatar: '//gw.alicdn.com/tfs/TB1DYHLwMHqK1RjSZFEXXcGMXXa-56-62.svg' },
        });
      }).catch(()=>{
        appendMsg({
          type: "text",
          content: { text:'系统超时，请重试!' },
          user: { avatar: '//gw.alicdn.com/tfs/TB1DYHLwMHqK1RjSZFEXXcGMXXa-56-62.svg' },
        });
      })
    }
  }

  function renderMessageContent(msg: any) {
    const { content } = msg;
    return <Bubble content={content.text} />;
  }

  return (
    <Chat
      navbar={{ title: "伍六七-AI" }}
      messages={messages}
      renderMessageContent={renderMessageContent}
      quickReplies={defaultQuickReplies}
      onQuickReplyClick={handleQuickReplyClick}
      onSend={handleSend}
    />
  );
}

export default withRouter(Home)