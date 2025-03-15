import { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { art } from '@/utils/render';
import { parseDate } from '@/utils/parse-date';
import { getCurrentPath } from '@/utils/helpers';
import path from 'node:path';
const __dirname = getCurrentPath(import.meta.url);

const baseUrl = 'https://seekingalpha.com';

export const route: Route = {
    path: '/articles',
    categories: ['finance'],
    example: '/seekingalpha/TSM/transcripts',
    parameters: {},
    features: {
        antiCrawler: true,
    },
    name: 'Summary',
    maintainers: ['TonyRL'],
    handler,
    description: `| Analysis | News | Transcripts | Press Releases | Related Analysis |
| -------- | ---- | ----------- | -------------- | ---------------- |
| analysis | news | transcripts | press-releases | related-analysis |`,
};

// const getMachineCookie = () =>
//     cache.tryGet('seekingalpha:machine_cookie', async () => {
//         const response = await ofetch.raw(baseUrl);
//         return response.headers.getSetCookie().map((c) => c.split(';')[0]);
//     });

const apiParams = {
    article: {
        slug: '/articles',
        include: 'author,primaryTickers,secondaryTickers,otherTags,presentations,presentations.slides,author.authorResearch,author.userBioTags,co_authors,promotedService,sentiments',
    },
    news: {
        slug: '/news',
        include: 'author,primaryTickers,secondaryTickers,otherTags',
    },
    pr: {
        slug: '/press_releases',
        include: 'acquireService,primaryTickers',
    },
};

async function handler() {
    const pageUrl = `${baseUrl}/articles`;

    // const machineCookie = await getMachineCookie();
    const response = await ofetch(`${baseUrl}/api/v3/articles`, {
        headers: {
            Cookie: 'machine_cookie=0676101019441; _gcl_au=1.1.153172977.1741408518; _ga=GA1.1.1585885034.1741408519; _fbp=fb.1.1741408519989.950457281972635038; _pxvid=be925a40-fbd6-11ef-8e1f-313355e99023; hubspotutk=19dcac0ac8f301ef3438d53a43655fce; user_id=62046868; user_nick=; user_devices=; u_voc=; sapu=101; user_remember_token=b3054b93060367443fb3e227d237d96a6f660497; sailthru_hid=cd1198d504360454c1e7e31f9e76cb9f67cc4fb7937b5045a508d88b2d22feb3cbfad66dcda1cc362a9f9949; __stripe_mid=dd8b04ec-a927-41a3-90ce-ea2ddcc33790c9aeae; session_id=fe46f88a-ddf1-4ec5-8985-aa6139cc0e53; _sasource=; pxcts=e51032d0-fdac-11ef-9b0d-f4c6121a0cb5; __hstc=234155329.19dcac0ac8f301ef3438d53a43655fce.1741408523545.1741445400407.1741610451209.4; __hssrc=1; user_cookie_key=133ww9y; gk_user_access=1**1741610989; gk_user_access_sign=48ac731997cd8d94312b7803243708d141f4610e; _ig=62046868; sailthru_pageviews=5; _uetsid=e6d18390fdac11efb447e5c4c5106900|dqsj0x|2|fu3|0|1895; sailthru_content=1f746bf3e10f882ee8e67b39698b887f66711ec31aef970068c83a163c4d2ea2b10936f2653b835f8464002e46ce6c650024a75f302d6af06d1d7e50162cf1c7ad614ef07a645bb2ee969e8d4f6c5f4a13741877443965e34ffe5c6c9be5b0a2d336ff2bdab2770099e746360c3b2e4a3b37a8b460de7950d1015c283a43ecd4b6f09daf178879a54eed98528b6242aaf0251524d6c5bdfecb6f06af6381eace2498a20fe1ec452385a53b25c38f73448ff82e044a354d897a7977f734d25c688d200bedc93b4d36eadde76518215b3ce67f8b4d190b3570417226bc3c2c450f3c5f57e561d9315a8a9a86be8720511e79c038359a3609b76383ffdf99b331b4; sailthru_visitor=638e7bd9-24cb-4211-8c94-5accbd47a1b4; _uetvid=bde19220fbd611efb52775d01a012540|1pvd7yo|1741611326679|22|1|bat.bing.com/p/insights/c/r; __hssc=234155329.5.1741610451209; _px3=449ee0833f7de71d4642d39bc6b75bef925504de01e97df761581eadf6e4e8fe:2H3gtzR/8Im0qnLriKZKGBcDATmGEaMN1VR8S+BRJkXMhkuMpmNbCems59swA7ILkqEyZ3c1I1KhP2Ctdk0UJQ==:1000:S3Rt4qxfMlErSdxK4iREsjOP6b/UpGgB7glqMOfgfqYKfd3N0vDFTqqPsk1s3Wz0zwPsQyAxjLd7Yr/9evRnaFubI6BsbWyivpwZrYcM4Tze2hx1GJHq+PoZdPejl+s+ZVjJR0EuqURd60zqNAJOim6jpPK4Z8p4Fjf0HPaNhcbZWJj4tSUbntNItkfpTiG2CxrzTRoVQLYBnMdi1spL2K+nL5c7KlhvfWBeoIwn9+U=; _pxde=116ef097d07980372a1d399bb06d205c8a63b340eb455f787e0edc0795b4b0e8:eyJ0aW1lc3RhbXAiOjE3NDE2MTEzMjg2MDQsImZfa2IiOjB9; _ga_KGRFF2R2C5=GS1.1.1741610448.4.1.1741611350.60.0.0; LAST_VISITED_PAGE=%7B%22pathname%22%3A%22https%3A%2F%2Fseekingalpha.com%2Fsymbol%2FPDFS%22%2C%22pageKey%22%3A%22cb177f85-da09-4468-b861-5d1db507660d%22%7D; userLocalData_mone_session_lastSession=%7B%22machineCookie%22%3A%220676101019441%22%2C%22machineCookieSessionId%22%3A%220676101019441%261741610445208%22%2C%22sessionStart%22%3A1741610445208%2C%22sessionEnd%22%3A1741613151603%2C%22firstSessionPageKey%22%3A%224d7e45f0-50eb-4962-98ee-ec0633b217fc%22%2C%22isSessionStart%22%3Afalse%2C%22lastEvent%22%3A%7B%22event_type%22%3A%22mousemove%22%2C%22timestamp%22%3A1741611351603%7D%7D',
            'sec-fetch-mode': 'cors',
            Accept: '*/*',
            'Accept-Encoding': 'gzip, deflate, br',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
            Referer: 'https://seekingalpha.com',
            Origin: 'https://seekingalpha.com',
            Host: 'https://seekingalpha.com',
        },
        query: {
            'filter[category]': 'latest-articles',
            'filter[since]': 0,
            'filter[until]': 0,
            include: 'author,primaryTickers,secondaryTickers',
            isMounting: true,
            'page[size]': 40,
            'page[number]': 1,
        },
    });

    const list = response.data?.map((item) => ({
        title: item.attributes.title,
        link: new URL(item.links.self, baseUrl).href,
        pubDate: parseDate(item.attributes.publishOn),
        author: response.included.find((i) => i.id === item.relationships.author.data.id).attributes.nick,
        id: item.id,
        articleType: item.links.self.split('/')[1],
    }));
    // console.log('', list);

    const items = list
        ? await Promise.all(
              list.map((item) =>
                  cache.tryGet(item.link, async () => {
                      const response = await ofetch(`${baseUrl}/api/v3/articles/${item.id}`, {
                          headers: {
                              //   cookie: machineCookie.join('; '),
                              Cookie: 'machine_cookie=0676101019441; _gcl_au=1.1.153172977.1741408518; _ga=GA1.1.1585885034.1741408519; _fbp=fb.1.1741408519989.950457281972635038; _pxvid=be925a40-fbd6-11ef-8e1f-313355e99023; hubspotutk=19dcac0ac8f301ef3438d53a43655fce; user_id=62046868; user_nick=; user_devices=; u_voc=; sapu=101; user_remember_token=b3054b93060367443fb3e227d237d96a6f660497; sailthru_hid=cd1198d504360454c1e7e31f9e76cb9f67cc4fb7937b5045a508d88b2d22feb3cbfad66dcda1cc362a9f9949; __stripe_mid=dd8b04ec-a927-41a3-90ce-ea2ddcc33790c9aeae; session_id=fe46f88a-ddf1-4ec5-8985-aa6139cc0e53; _sasource=; pxcts=e51032d0-fdac-11ef-9b0d-f4c6121a0cb5; __hstc=234155329.19dcac0ac8f301ef3438d53a43655fce.1741408523545.1741445400407.1741610451209.4; __hssrc=1; user_cookie_key=133ww9y; gk_user_access=1**1741610989; gk_user_access_sign=48ac731997cd8d94312b7803243708d141f4610e; _ig=62046868; sailthru_pageviews=5; _uetsid=e6d18390fdac11efb447e5c4c5106900|dqsj0x|2|fu3|0|1895; sailthru_content=1f746bf3e10f882ee8e67b39698b887f66711ec31aef970068c83a163c4d2ea2b10936f2653b835f8464002e46ce6c650024a75f302d6af06d1d7e50162cf1c7ad614ef07a645bb2ee969e8d4f6c5f4a13741877443965e34ffe5c6c9be5b0a2d336ff2bdab2770099e746360c3b2e4a3b37a8b460de7950d1015c283a43ecd4b6f09daf178879a54eed98528b6242aaf0251524d6c5bdfecb6f06af6381eace2498a20fe1ec452385a53b25c38f73448ff82e044a354d897a7977f734d25c688d200bedc93b4d36eadde76518215b3ce67f8b4d190b3570417226bc3c2c450f3c5f57e561d9315a8a9a86be8720511e79c038359a3609b76383ffdf99b331b4; sailthru_visitor=638e7bd9-24cb-4211-8c94-5accbd47a1b4; _uetvid=bde19220fbd611efb52775d01a012540|1pvd7yo|1741611326679|22|1|bat.bing.com/p/insights/c/r; __hssc=234155329.5.1741610451209; _px3=449ee0833f7de71d4642d39bc6b75bef925504de01e97df761581eadf6e4e8fe:2H3gtzR/8Im0qnLriKZKGBcDATmGEaMN1VR8S+BRJkXMhkuMpmNbCems59swA7ILkqEyZ3c1I1KhP2Ctdk0UJQ==:1000:S3Rt4qxfMlErSdxK4iREsjOP6b/UpGgB7glqMOfgfqYKfd3N0vDFTqqPsk1s3Wz0zwPsQyAxjLd7Yr/9evRnaFubI6BsbWyivpwZrYcM4Tze2hx1GJHq+PoZdPejl+s+ZVjJR0EuqURd60zqNAJOim6jpPK4Z8p4Fjf0HPaNhcbZWJj4tSUbntNItkfpTiG2CxrzTRoVQLYBnMdi1spL2K+nL5c7KlhvfWBeoIwn9+U=; _pxde=116ef097d07980372a1d399bb06d205c8a63b340eb455f787e0edc0795b4b0e8:eyJ0aW1lc3RhbXAiOjE3NDE2MTEzMjg2MDQsImZfa2IiOjB9; _ga_KGRFF2R2C5=GS1.1.1741610448.4.1.1741611350.60.0.0; LAST_VISITED_PAGE=%7B%22pathname%22%3A%22https%3A%2F%2Fseekingalpha.com%2Fsymbol%2FPDFS%22%2C%22pageKey%22%3A%22cb177f85-da09-4468-b861-5d1db507660d%22%7D; userLocalData_mone_session_lastSession=%7B%22machineCookie%22%3A%220676101019441%22%2C%22machineCookieSessionId%22%3A%220676101019441%261741610445208%22%2C%22sessionStart%22%3A1741610445208%2C%22sessionEnd%22%3A1741613151603%2C%22firstSessionPageKey%22%3A%224d7e45f0-50eb-4962-98ee-ec0633b217fc%22%2C%22isSessionStart%22%3Afalse%2C%22lastEvent%22%3A%7B%22event_type%22%3A%22mousemove%22%2C%22timestamp%22%3A1741611351603%7D%7D',
                              'sec-fetch-mode': 'cors',
                              Accept: '*/*',
                              'Accept-Encoding': 'gzip, deflate, br',
                              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
                              Referer: 'https://seekingalpha.com',
                              Origin: 'https://seekingalpha.com',
                              Host: 'https://seekingalpha.com',
                          },
                          query: {
                              include: apiParams[item.articleType].include,
                          },
                      });

                      item.category = response.included.filter((i) => i.type === 'tag').map((i) => (i.attributes.company ? `${i.attributes.company} (${i.attributes.name})` : i.attributes.name));
                      item.description =
                          (response.data.attributes.summary?.length
                              ? art(path.join(__dirname, 'templates/summary.art'), {
                                    summary: response.data.attributes.summary,
                                })
                              : '') + response.data.attributes.content;
                      item.updated = parseDate(response.data.attributes.lastModified);

                      return item;
                  })
              )
          )
        : [];

    return {
        title: response.meta.page.title,
        description: response.meta.page.description,
        link: pageUrl,
        image: 'https://seekingalpha.com/samw/static/images/favicon.svg',
        item: items,
        allowEmpty: true,
        language: 'en-US',
    };
}
