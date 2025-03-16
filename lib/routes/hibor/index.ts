import { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';

export const route: Route = {
    path: '/hot/today',
    categories: ['finance', 'popular'],
    example: '/eastmoney/guba/hot',
    name: '慧博投研资讯',
    maintainers: ['syzq'],
    handler,
    description: '慧博投研资讯热点与研报',
};

// 获取今日热点 HTML
async function fetchHotTopics() {
    const res = await ofetch('https://www.hibor.com.cn/hiborweb/HotPage/PageInfo', {
        method: 'POST',
        headers: {
            Accept: '*/*',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            Connection: 'keep-alive',
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            DNT: '1',
            Origin: 'https://www.hibor.com.cn',
            Referer: 'https://www.hibor.com.cn/hytop.html',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
            'X-Requested-With': 'XMLHttpRequest',
            'sec-ch-ua': '"Chromium";v="134", "Not:A-Brand";v="24", "Google Chrome";v="134"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"macOS"',
            Cookie: 'did=67A671BFE; c=; MBname=HW462915835; MBpermission=0; robih=VTHTqMtNmOwPnMmRxPsRmR; safedog-flow-item=773D9AF0CB3030736E0A18313741D94B; Hm_lvt_d554f0f6d738d9e505c72769d450253d=1741935090,1742026531,1742105629; HMACCOUNT=C6DFD85DF78EB513; ASPSESSIONIDSEDBDDCT=LLIEMADDEMBKHMLPNMKFCHIJ; ASPSESSIONIDAQDDAAAT=GPOEMHDDNNFOKAEBJIKHLHHO; Hm_lpvt_d554f0f6d738d9e505c72769d450253d=1742109785; ASPSESSIONIDAUDDAAAT=BAACNHDDBDEAGNLPDIFMHPNP',
        },
        body: new URLSearchParams({
            docType: '2',
            industryName: '',
            dateName: '今日热点',
        }).toString(),
    });
    return res;
}

async function searchReport(title: string) {
    return await cache.tryGet(`hibor_report_${title}`, async () => {
        const formData = new URLSearchParams();
        formData.append('ybfl1', '2');
        formData.append('ybfl2', 'all');
        formData.append('sjfw', '12');
        formData.append('ssfw', '0');
        formData.append('gjz', title);

        const res = await ofetch('http://sys.hibor.com.cn/gaojisousuo/gaojisousuo/search?tabindex=2&abc=WUAZmQrPtRwPnMnQxPpMqN&def=oMrRsQsPeRpPpMfQoPsM7NnMtPwMoPpQvPmRtP&vidd=5&keyy=TYUGUIYUI&xyz=pMtRrQmPrRsPsM&op=0%5C', {
            method: 'POST',
            headers: {
                Cookie: 'safedog-flow-item=7EB5CBE05B9C57FAFEFE436E13346D56',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData.toString(),
        });
        return res;
    });
}

function extractReportLink(html: string | any) {
    const $ = load(html);
    const downloadLink = $('td a')
        .filter((_, el) => $(el).text().trim() === '下载')
        .attr('href');
    return downloadLink;
}

async function handler() {
    const hotTopicsHtml = await fetchHotTopics();
    const $ = load(hotTopicsHtml);

    // 解析 HTML，提取热点列表
    // eslint-disable-next-line no-restricted-syntax
    const hotTopics = $('tr')
        .slice(1) // 跳过表头
        .map((_, element) => {
            const title = $(element).find('td').eq(0).find('a').attr('title')?.trim();
            const date = $(element).find('td').eq(4).text().trim();
            return title ? { title, date } : null;
        })
        .get();

    // 遍历热点列表，获取研报链接
    const items = await Promise.all(
        hotTopics.map(async ({ title, date }) => {
            const searchHtml = await searchReport(title);
            const reportLink = extractReportLink(searchHtml); // 解析研报下载链接

            return {
                title,
                link: reportLink || '未找到研报',
                pubDate: date,
            };
        })
    );

    return {
        title: '慧博投研资讯',
        link: 'https://www.hibor.com.cn/hytop.html',
        item: items,
    };
}
