import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import puppeteer from '@/utils/puppeteer';
import { load } from 'cheerio';

export const route: Route = {
    path: '/guba/hot',
    categories: ['finance', 'popular'],
    example: '/eastmoney/guba/hot',
    name: '股吧精选',
    maintainers: ['syzq'],
    handler,
    description: '抓取东方财富股吧的精选文章',
};

const baseUrl = 'https://guba.eastmoney.com';
const apiUrl = `${baseUrl}/api/getData?path=/hotpost/api/Selection/Articlelist`;

async function fetchWithPuppeteer() {
    const browser = await puppeteer();
    const page = await browser.newPage();
    try {
        await page.goto(baseUrl, { waitUntil: 'networkidle2' });
        const cookies = await page.cookies();
        const cookieHeader = cookies.map((cookie) => `${cookie.name}=${cookie.value}`).join('; ');
        if (!cookieHeader) {
            throw new Error('无法获取 Cookie');
        }
        return cookieHeader;
    } catch {
        return '';
    } finally {
        await browser.close();
    }
}

async function handler() {
    const cookie = await fetchWithPuppeteer();
    // console.log('cookie:', cookie);

    const res = await got.post(apiUrl, {
        headers: {
            Cookie: cookie,
        },
        form: {
            param: 'ps=20&p=1&lastTime=&pageOffset=0&uid=&euid=not_logged_in_euid',
            plat: 'Web',
            path: '/hotpost/api/Selection/Articlelist',
            env: '2',
            origin: '',
            version: '2022',
            product: 'Guba',
        },
    });

    const data = res.data.re || [];

    const list = data.map((item) => ({
        title: item.post_title,
        link: `https://caifuhao.eastmoney.com/news/${item.post_source_id}`,
        pubDate: parseDate(item.post_display_time),
        author: item.post_user?.user_nickname || '未知',
        originItem: item,
    }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                try {
                    const { data: response } = await got(item.link, {
                        headers: {
                            Cookie: cookie,
                        },
                    });
                    const $ = load(response);
                    item.description = $('.article-body').html() || '内容获取失败';
                    return item;
                } catch {
                    return item;
                }
            })
        )
    );

    return {
        title: '东方财富股吧 - 精选',
        link: 'https://guba.eastmoney.com/',
        item: items,
    };
}
