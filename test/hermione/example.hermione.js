const { assert } = require('chai');

let bug_id = 0;
let base_url = 'http://localhost:3000/hw/store';
let bug_url = `http://localhost:3000/hw/store?bug_id=${bug_id}`;
let main_url = base_url; // можно изменить тестовый url

if (process.env.BUG_ID !== undefined) {
    bug_id = process.env.BUG_ID;
}

describe('Общие требования:', async () => {
    const windowSizes = [1280, 1140, 960, 720, 575];
    windowSizes.forEach((w) => adaptivePage(w));

    function adaptivePage(width) {
        it(`1. вёрстка должна адаптироваться под ширину экрана ${width + 1}`, async ({ browser }) => {
            await browser.setWindowSize(width, 1080);
            await browser.url(main_url);

            const page = await browser.$('.Application');
            await page.waitForExist();

            await browser.assertView(`plain${width + 1}`, '.Application', {
                screenshotDelay: 1000,
                compositeImage: true,
            });
        });
    }
});