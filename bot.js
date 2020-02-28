const cheerio = require('cheerio');
const jsonframe = require('jsonframe-cheerio');
const axios = require('axios');
const dotenv = require('dotenv');
const { IncomingWebhook } = require('@slack/webhook');

const frame = {
    'name': "[class*='_Descripcion'] > a",
    'discount': '.boxDesctoPor2',
    'normal_price': "[class*='_Precios'] > [class*='_PrecioNormal']",
    'offer_price': "[class*='_Precios'] > span[class*='_Precio']:first-child",
    'availability': "[class*='_Disponibilidad']"
}

dotenv.config();

setInterval(() => {
    console.log('=> Obteniendo página web')
    axios.get('https://www.zmart.cl/Relampagos')
    .then((page) => {
        console.log('=> Respuesta obtenida, procesando data.')
        const $ = cheerio.load(page.data);
        jsonframe($);

        let items = [];
        $('div.ProdDisplayType5 > div > div').map((i, e) => {
            let item = $(e).scrape(frame);
            if (item.name == undefined) {
                return;
            }
            try {
                if (item.name.search(process.env.FILTER_TOPIC) >= 0) {
                    items.push(item);
                }
            } catch(e){}
        });

        console.log(`=> Se encontraron ${items.length} productos.`);

        let message = ':zap::zap::zap::zap::zap::zap::zap::zap::zap::zap::zap::zap::zap::zap::zap::zap::zap::zap::zap::zap::zap:\r\n'
        + ':zap::zap::zap: *Estas son las ofertas relámpago de hoy en Zmart* :zap::zap::zap:\r\n'
        + ':zap::zap::zap::zap::zap::zap::zap::zap::zap::zap::zap::zap::zap::zap::zap::zap::zap::zap::zap::zap::zap:\r\n\r\n\r\n';

        for (let item of items) {
            message += formatItemForSlack(item);
        }

        const url = process.env.SLACK_WEBHOOK_URL;
        const webhook = new IncomingWebhook(url, {
            icon_emoji: ':money_with_wings:',
            username: 'Zmart Bot - Ofertas Relámpago'
          });
        
        (async () => {
            await webhook.send({
                text: message,
            });
        })();
    });
}, process.env.TIMEOUT_INTERVAL);

app.listen(process.env.PORT, () => {
    console.log(`App is running on port ${ PORT }, though it's useless right now.`);
});

function formatItemForSlack(item) {
    return `:zap: ${item.name} (${item.availability})\r\n:tada: ${item.discount} descuento - :moneybag: ${item.normal_price} :arrow_lower_right: ${item.offer_price}\r\n\r\n\r\n\r\n`;
}
