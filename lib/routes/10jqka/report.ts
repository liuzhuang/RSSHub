import { Route } from '@/types';
import { load } from 'cheerio';
import ofetch from '@/utils/ofetch';
import iconv from 'iconv-lite';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/report',
    categories: ['finance'],
    example: '/10jqka/report',
    parameters: {},
    name: 'report',
    maintainers: ['report'],
    description: `report`,
    handler,
};

async function handler() {
    const baseUrl = 'https://data.10jqka.com.cn';
    // const listUrl = `${baseUrl}/market/ggsd/ggtype/2/board/2/order/asc/page/1/ajax/1/free/1/`;
    const listUrl = `${baseUrl}/market/ggsd/ggtype/2/`;
    const response = await ofetch(listUrl, { responseType: 'arrayBuffer' });
    const $ = load(iconv.decode(Buffer.from(response), 'gbk'));

    // eslint-disable-next-line no-restricted-syntax
    const list = $('.m-table.J-ajax-table tbody tr')
        .map((_, element) => {
            const el = $(element);
            const date = el.find('td.tc').first().text().trim(); // 获取日期
            const pdfEl = el.find('td.tl a[target="_blank"]'); // 获取PDF名称和链接
            if (!date) {
                return [];
            }

            // eslint-disable-next-line no-restricted-syntax
            const pdfs = pdfEl
                .map((_, link) => ({
                    title: $(link).text().trim(),
                    description: '',
                    pubDate: parseDate(date),
                    link: $(link).attr('href'),
                }))
                .get();
            return pdfs;
        })
        .get()
        .flat(); // 由于 `map` 返回的是数组的数组，这里 `flat()` 用于展平

    return {
        title: '同花顺-最新公告',
        link: String(listUrl),
        item: list,
    };
}
