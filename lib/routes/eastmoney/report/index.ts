import { Route, ViewType } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/report/:category',
    categories: ['finance', 'popular'],
    view: ViewType.Articles,
    example: '/eastmoney/report/strategyreport',
    parameters: {
        category: {
            description: '研报类型',
            options: [
                { value: 'strategyreport', label: '策略报告' },
                { value: 'macresearch', label: '宏观研究' },
                { value: 'brokerreport', label: '券商晨报' },
                { value: 'industry', label: '行业研报' },
                { value: 'stock', label: '个股研报' },
            ],
        },
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['data.eastmoney.com/report/:category'],
        },
    ],
    name: '研究报告',
    maintainers: ['syzq'],
    handler,
    description: `| 策略报告       | 宏观研究    | 券商晨报     | 行业研究 | 个股研报 |
| -------------- | ----------- | ------------ | -------- | -------- |
| strategyreport | macresearch | brokerreport | industry | stock    |`,
};

async function handler(ctx) {
    const baseUrl = 'https://data.eastmoney.com';
    const { category = 'strategyreport' } = ctx.req.param();

    const reportType = {
        brokerreport: '券商晨报',
        industry: '行业研报',
        macresearch: '宏观研究',
        strategyreport: '策略报告',
        stock: '个股研报',
    };
    const linkType = {
        brokerreport: 'zw_brokerreport',
        industry: 'zw_industry',
        macresearch: 'zw_macresearch',
        strategyreport: 'zw_strategy',
        stock: 'info',
    };

    const res = await got(`${baseUrl}/report/${category}`);
    const $ = load(res.data);

    const initData = JSON.parse(
        $('script')
            .text()
            .match(/var initdata(.=?)(.*?);/)[2]
    );

    const list = initData.data.map((item) => {
        const stockName = category === 'stock' ? `[${item.stockName}]` : '';
        return {
            title: `[${item.orgSName}]${stockName}${item.title}`,
            link: `${baseUrl}/report/${linkType[category]}` + (category === 'stock' ? `/${item.infoCode}.html` : `.jshtml?encodeUrl=${item.encodeUrl}`),
            pubDate: parseDate(item.publishDate),
            author: item.researcher,
            originItem: item, // temp use
        };
    });

    const items = await Promise.all(
        list.map((item) => {
            delete item.originItem; // temp use

            return cache.tryGet(item.link, async () => {
                try {
                    const { data: response } = await got(item.link);
                    const $ = load(response);
                    item.link = $('.pdf-link').attr('href');
                    item.description = $('.ctx-content').text();
                    return item;
                } catch {
                    return item;
                }
            });
        })
    );

    return {
        title: `东方财富网-${reportType[category]}`,
        link: baseUrl,
        item: items,
    };
}
