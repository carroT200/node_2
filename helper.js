function parseBody(req, cb) {
  let body = [];

  req
    .on('data', (chunk) => {
      body.push(chunk);
    })
    .on('end', () => {
      body = Buffer.concat(body).toString();
      body = JSON.parse(body);
      cb(null, body);
    });
}

function parseUrl(url) {
  const [parsedUrl, paramsString] = url.split('?');
  let parsedParams = null;

  if (paramsString) {
    const params = paramsString.split('&');
    parsedParams = params.reduce((acc, curr) => {
      const [key, value] = curr.split('=');
      acc[key] = value;

      return acc;
    }, {});
  }

  return {
    url: parsedUrl,
    params: parsedParams,
  };
}

module.exports = {
  parseBody,
  parseUrl,
};
