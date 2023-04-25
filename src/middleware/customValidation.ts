import { HttpException, HttpStatus } from '@nestjs/common';

/**
 *
 * @param request
 * @param response
 * @param next
 */
export function customInputValidation(request, response, next) {
  try {
    const requestMethod: any = request.method;

    let error: any = {};

    /* check any sql injection found in the url or not */
    validateRequestUrl(request);

    /* start validating the request params */
    if (requestMethod == 'GET') {
      error = processGetRequest(request);
    } else if (
      requestMethod == 'POST' ||
      requestMethod == 'PUT' ||
      requestMethod == 'PATCH'
    ) {
      error = processPostRequest(request);
    }

    /* check is injection is found */
    if (error && Object.keys(error).length && error['errorStatus'])
      rejectRequest(error);

    next();
  } catch (e) {
    throw new HttpException(e.message, HttpStatus.FORBIDDEN);
  }
}

/**
 *
 * @param request
 * @returns
 */
function validateRequestUrl(request: any) {
  const requestUrl = `${request.protocol}://${request.get('host')}${
    request.originalUrl
  }`;
  if (requestUrl !== null && requestUrl !== undefined) {
    const validatedUrlRes = findInjection({ request_url: requestUrl });
    if (
      validatedUrlRes &&
      Object.keys(validatedUrlRes).length &&
      validatedUrlRes['errorStatus']
    )
      rejectRequest(validatedUrlRes);
  }
  return;
}

/**
 *
 * @param error
 */
function rejectRequest(error: any) {
  /* check is injection is found */
  const errMessage = `Invalid content passed on ${error['requestKey']}`;
  throw new HttpException(errMessage, HttpStatus.FORBIDDEN);
}

/**
 *
 * @param request input request params on get request
 * @returns object
 */
function processGetRequest(request: any) {
  let error: any = {};
  const request_query = request.query;
  if (request_query && Object.keys(request_query).length) {
    error = findInjection(request_query);
    request.query = error['sanitizedObject'];
  }
  return error;
}

/**
 *
 * @param request api request
 * @returns
 */
function processPostRequest(request: any) {
  let error: any = {};
  const bodyParams = request.body;

  if (
    bodyParams &&
    Object.keys(bodyParams).length &&
    !Array.isArray(bodyParams)
  ) {
    error = findInjection(bodyParams);
    request.body = error['sanitizedObject'];
  }

  if (bodyParams && Array.isArray(bodyParams) && bodyParams.length) {
    for (let i = 0; i < request.body.length; i++) {
      error = findInjection(request.body[i]);
      request.body[i] = error['sanitizedObject'];
      if (error && Object.keys(error).length && error['errorStatus'] === true)
        break;
    }
  }
  return error;
}

/**
 *
 * @param input_params input request params on get request
 * @returns object
 */
function findInjection(input_params: any) {
  let error: any = {};
  let isInjectionFound = false;
  for (const key in input_params) {
    if (input_params[key] || typeof input_params[key] === 'boolean') {
      let keyValue =
        typeof input_params[key] === 'string'
          ? input_params[key].replace(/%20/g, ' ')
          : input_params[key];

      if (typeof input_params[key] === 'string') {
        keyValue = sanitizeUrl(keyValue); /* sanitize this if its invalid url */
        const noHtmlString =
          stripeHtmlScriptTags(
            keyValue,
          ); /* stripping out html and script tags */
        input_params[key] = noHtmlString;
        isInjectionFound =
          applyInjectionRule(
            noHtmlString,
          ); /* applying the injection rules xss and sql */
      }
      error = {
        requestKey: key,
        errorStatus: isInjectionFound,
        sanitizedObject: input_params,
      };
      if (isInjectionFound) break;
    }
  }

  return error;
}

/**
 *
 * @param input string
 * @returns returns the string without html and script tags
 */
function stripeHtmlScriptTags(input: string) {
  const htmlRegex = /<([^>]+?)([^>]*?)>(.*?)<\/\1>/gi;
  input = input.replace(htmlRegex, '');
  return input;
}

/**
 *
 * @param input => input value
 * @returns => true or false
 */
function applyInjectionRule(input: string) {
  /* sql injection validation */
  const sql = new RegExp("w*((%27)|('))((%6F)|o|(%4F))((%72)|r|(%52))", 'i');
  const sqlMeta = new RegExp("(%27)|(')|(--)|(%23)|(#)", 'i');
  const sqlMetaVersion2 = new RegExp(
    "((%3D)|(=))[^\n]*((%27)|(')|(--)|(%3B)|(;))",
    'i',
  );
  const sqlUnion = new RegExp("((%27)|('))union", 'i');
  /* sql injection validation */

  /* cross site scripting validation */
  const xssSimple = new RegExp('((%3C)|<)((%2F)|/)*[a-z0-9%]+((%3E)|>)', 'i');
  const xssImgSrc = new RegExp(
    '((%3C)|<)((%69)|i|(%49))((%6D)|m|(%4D))((%67)|g|(%47))[^\n]+((%3E)|>)',
    'i',
  );
  /* cross site scripting validation */

  return (
    sql.test(input) ||
    sqlMeta.test(input) ||
    sqlMetaVersion2.test(input) ||
    sqlUnion.test(input) ||
    xssSimple.test(input) ||
    xssImgSrc.test(input)
  );
}

/**
 *
 * @param url
 * @returns
 */
function isRelativeUrlWithoutProtocol(url: string): boolean {
  const relativeFirstCharacters = ['.', '/'];
  return relativeFirstCharacters.indexOf(url[0]) > -1;
}

/**
 *
 * @param url
 * @returns sanitized url
 */
function sanitizeUrl(url?: string): string {
  const invalidProtocolRegex = /^([^\w]*)(javascript|data|vbscript)/im;
  const ctrlCharactersRegex =
    /[\u0000-\u001F\u007F-\u009F\u2000-\u200D\uFEFF]/gim;
  const urlSchemeRegex = /^([^:]+):/gm;
  if (!url) {
    return 'about:blank';
  }

  const sanitizedUrl = url.replace(ctrlCharactersRegex, '').trim();

  if (isRelativeUrlWithoutProtocol(sanitizedUrl)) {
    return sanitizedUrl;
  }

  const urlSchemeParseResults = sanitizedUrl.match(urlSchemeRegex);

  if (!urlSchemeParseResults) {
    return sanitizedUrl;
  }

  const urlScheme = urlSchemeParseResults[0];

  if (invalidProtocolRegex.test(urlScheme)) {
    return 'about:blank';
  }

  return sanitizedUrl;
}
