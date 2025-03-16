import { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const BASE_URL = 'https://gw.datayes.com/rrp_adventure/web';
const HEADERS = {
    Accept: 'application/json, text/plain, */*',
    'Accept-Language': 'zh-cn',
    Connection: 'keep-alive',
    DNT: '1',
    Origin: 'https://robo.datayes.com',
    Referer: 'https://robo.datayes.com/',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-site',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
    'sec-ch-ua': '"Chromium";v="134", "Not:A-Brand";v="24", "Google Chrome";v="134"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"',
    Cookie: 'gr_user_id=d0c9ab6f-6381-4f5a-9129-a155d78633f2; cloud-anonymous-token=17566fb1b5f74946bc5a4cc5b966bc12; cloud-sso-token=263129F1D83B70DA53670C81BAE279C2;',
};

export const route: Route = {
    path: '/report',
    categories: ['finance'],
    example: '/datayes/report',
    parameters: {},
    name: 'Summary',
    maintainers: ['TonyRL'],
    description: ``,
    handler,
};

async function fetchReportPDF(reportId: number) {
    try {
        const response = await ofetch(`${BASE_URL}/externalReport/${reportId}/pdf`, {
            headers: HEADERS,
        });
        // console.log('获取 PDF:', response);

        if (response.code !== 1) {
            throw new Error(`Error fetching report PDF: ${response.message}`);
        }

        return response.data;
    } catch {
        // console.error(`Failed to fetch PDF for report ${reportId}:`, error);
        return null;
    }
}

function getTodayDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');

    return `${year}${month}${day}`;
}

async function handler() {
    const today = getTodayDate();
    const response = await ofetch(
        `https://gw.datayes.com/rrp_adventure/web/search?pageNow=1&authorId=&isOptional=false&orgName=&reportType=MACRO&secCodeList=&reportSubType=&industry=&ratingType=&pubTimeStart=${today}&pubTimeEnd=${today}&type=EXTERNAL_REPORT&pageSize=40&sortOrder=desc&query=&minPageCount=&maxPageCount=`,
        {
            headers: HEADERS,
        }
    );
    if (response.code !== 1) {
        throw new Error(`Error fetching reports: ${response.message}`);
    }

    const reports = response.data.list.map((item: any) => ({
        id: item.data.id,
        title: item.data.title,
        pubDate: parseDate(item.data.publishTime),
    }));

    const items = await Promise.all(
        reports.map(
            async (report) =>
                await cache.tryGet(String(report.id), async () => {
                    const reportPDF = await fetchReportPDF(report.id);
                    return {
                        ...report,
                        pdfUrl: reportPDF?.downloadUrl,
                    };
                })
        )
    );

    return {
        title: '萝卜投研',
        description: '萝卜投研',
        link: 'https://gw.datayes.com/rrp_adventure/web',
        item: items,
    };
}
