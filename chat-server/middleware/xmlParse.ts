import xml from './../utils/xml/xmlTool.js';

export default () => {
    return async (ctx:any, next:any) => {
        console.log('xmlParse');
        if (ctx.method == 'POST' && ctx.is('text/xml')) {
            console.log('xmlParse2',ctx);
            const promise = new Promise(function (resolve, reject) {
                let buf = ''
                ctx.req.setEncoding('utf8')
                ctx.req.on('data', (chunk: string) => {
                    buf += chunk
                })
                ctx.req.on('end', () => {
                    xml.xmlToJson(buf)
                        .then(resolve)
                        .catch(reject)
                })
            })
            await promise.then((result) => {
                console.log('xmlParse3',result);
                    ctx.req.body = result
                })
                .catch((e) => {
                    console.log('xmlParse4-----------');
                    e.status = 400
                })

            // await next()
        } else {
            await next()
        }
    }
}

