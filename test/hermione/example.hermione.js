const { assert } = require('chai');

let bug_id = 0;
let base_url = 'http://localhost:3000/hw/store';
let api_url = 'http://localhost:3000/hw/store/api/products';
let bug_url = `http://localhost:3000/hw/store?bug_id=${bug_id}`;
let main_url = base_url;

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

    it('4. На ширине меньше 576px навигационное меню должно скрываться за гамбургер', async ({ browser }) => {
        await browser.setWindowSize(575, 500);
        await browser.url(main_url);

        const page = await browser.$('.Application');
        await page.waitForExist();

        const appToggler = await browser.$('.Application-Toggler');
        const appMenu = await browser.$('.Application-Menu');

        assert.equal(await appToggler.isDisplayed(), true, 'Гамбургер должен появиться');
        assert.equal(await appMenu.isDisplayed(), false, 'Навигационное меню должно скрыться');
    });

    it('5. При выборе элемента из меню "гамбургера", меню должно закрываться', async ({ browser }) => {
        await browser.setWindowSize(575, 500);
        await browser.url(main_url);

        const page = await browser.$('.Application');
        await page.waitForExist();

        const appToggler = await browser.$('.Application-Toggler');
        const appMenu = await browser.$('.Application-Menu');

        assert.equal(await appToggler.isDisplayed(), true, 'Гамбургер должен появиться');

        await appToggler.click();
        assert.equal(await appMenu.isDisplayed(), true, 'Меню должно открыться при клике на гамбургер');

        await appMenu.click();
        assert.equal(await appMenu.isDisplayed(), false, 'Меню должно закрыться при выборе элемента');
    });

    it('6. в шапке отображаются ссылки на страницы магазина, а также ссылка на корзину', async ({ browser }) => {
        const pages = [
            'catalog',
            'delivery',
            'contacts',
            'cart'
        ]
        for(const page of pages) {
            it(`в шапке отображается ссылка на ${page}`, async ({ browser }) => {
                await browser.url(main_url);
                const app = await browser.$('.Application');
                await app.waitForExist();
                const link = await browser.$(`.nav-link[href*="/hw/store/${page}"]`);
                assert.equal(await link.isDisplayed(), true, `видна ссылка на ${page}`);
            })
        }
    });

    it('7. название магазина в шапке должно быть ссылкой на главную страницу', async ({ browser }) => {
        const pages = [
            'catalog',
            'catalog/0',
            'delivery',
            'contacts',
            'cart'
        ]
        for(const page of pages) {
            it(`название магазина в шапке на странице ${page} ведет на глвную`, async ({ browser }) => {
                await browser.url(main_url + `/${page}`);
                const app = await browser.$('.Application');
                await app.waitForExist();
                const link = await browser.$(`.Application-Brand`);
                assert.equal(await link.getAttribute('href'), '/hw/store', `ведет на глвную со страници ${page}`);
            })
        }
    });
});

describe('Страницы:', async () => {
    const capitalize = (s) => (s[0].toUpperCase() + s.slice(1));
    it('1. в магазине должны быть страницы: главная, каталог, условия доставки, контакты', async ({ browser }) => {
        const pages = [
            'catalog',
            'delivery',
            'contacts',
            ''
        ]
        for(const page of pages) {
            it(`в магазине есть страница ${page === '' ? 'main' : page}`, async ({ browser }) => {
                await browser.url(main_url + `/${page}`);
                const app = await browser.$('.Application');
                await app.waitForExist();
                const title = await browser.$(`.${capitalize(`${page === '' ? 'main' : page}`)}`);
                assert.equal(await title.isDisplayed(), true, `есть страница ${page === '' ? 'main' : page}`);
            })
        }
    })
    
    it('2. страницы главная, условия доставки, контакты должны иметь статическое содержимое', async ({ browser }) => {
        const pages = [
            'delivery',
            'contacts',
            ''
        ]

        pages.forEach(page => isStatic(page))
        
        function isStatic(page) {
            it(`Страница ${page} имеет статическое содержимое`, async ({ browser }) => {
                await browser.url(main_url + `/${page}`);
                const app = await browser.$('.Application');
                await app.waitForExist();
                await browser.assertView(`plain${page}`, '.Application', {
                    screenshotDelay: 1000,
                    compositeImage: true,
                });
            })
        }
    })
})

describe('Каталог:', async () => {
    it('1. в каталоге должны отображаться товары, список которых приходит с сервера', async ({ browser }) => {
        const puppeteer = await browser.getPuppeteer();
        const [page] = await puppeteer.pages();
        await page.goto(api_url);
        await page.content();
        products = await page.evaluate(() => {
            return JSON.parse(document.querySelector('body').innerText)
        })
        let index = 0
        for(const product of products) {
            await browser.url(main_url + `/catalog`);
            const app = await browser.$('.Application');
            await app.waitForExist();
            const productElement = await browser.$(`.ProductItem[data-testid="${index}"]`);
            assert.equal(await productElement.isDisplayed(), true, `${index} должен отоброжается`);
            index++;
        }
    })
})