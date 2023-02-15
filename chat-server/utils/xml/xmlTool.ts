import xml2js from 'xml2js';

export default {
  xmlToJson: (str) => {
     return new Promise((resolve, reject) => {
        const parseString = xml2js.parseString
        parseString(str, (err, result) => {
            if (err) {
                reject(err)
            } else {
                resolve(result)
            }
        })
     })
  },
  jsonToXml: (obj) => {
    const builder = new xml2js.Builder()
    return builder.buildObject(obj)
  }
}