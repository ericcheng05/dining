import { Hono } from 'hono';
import { accepts } from 'hono/accepts';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';

import { html, raw } from 'hono/html';

import { setNamespace, getI18nString, setLanguage } from 'i18n';
import { getHtmlHead, getHtmlHeader, getHtmlBox } from 'htmlContents';

import sushiro from 'sushiro';

type Bindings = 
{
	i18n: KVNamespace
};

// Start a Hono app
const app = new Hono();

app.use(secureHeaders());
app.use(cors());
app.use(async (c, next) =>
	{
		setNamespace(c.env.i18n);
		const accept = accepts(c,
			{
				header: 'Accept-Language',
				supports: ['en', 'zh'],
				default: 'en'
			});
		await setLanguage(accept);
		await next();
	}
);

app.notFound(async (c) =>
	{
		const payload = {host:c.req.header('host'),reqId:c.req.header('cf-ray')};
		payload.status = getI18nString("status.error");
		payload.message = getI18nString("message.notFound");
		return c.json(payload, 404);
	}
);

app.get('/', async (c) => 
	{
		const headData =
		{
			title: getI18nString("site.title")
		}
		const headHtmlContent = html(getHtmlHead(headData));

		const headerData = 
		{
			title: getI18nString("site.header.title"),
			subtitle: getI18nString("site.header.subtitle")
		};
		const headerHtmlContent = html(getHtmlHeader(headerData));

		const sushiroData =
		{
			url: "sushiro",
			title: getI18nString("brand.sushiro.name"),
			titleBackground: true,
			titleBackgroundId: "sushiro"
		};
		const sushiroHtmlContent = html(getHtmlBox(sushiroData));
		
		const kfcData =
		{
			url: "kfc",
			title: getI18nString("brand.kfc.name"),
			titleBackground: true,
			titleBackgroundId: "kfc"
		};
		const kfcHtmlContent = html(getHtmlBox(kfcData));

		const htmlContent = html`
		  		<!doctype html>
			    		${headHtmlContent}
					<body>
		   				${headerHtmlContent}
						<div class="card-container">
	     						<div class="box">
	     							${sushiroHtmlContent}
	     							${kfcHtmlContent}
		    					</div>
						</div>
		   			</body>
	       			</html>
	       			`;
		
		return c.html(htmlContent);
	}
);

app.route('/sushiro', sushiro);

// Export the Hono app
export default app;
