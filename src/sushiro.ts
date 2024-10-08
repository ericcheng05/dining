import { Hono } from 'hono';

import { html, raw } from 'hono/html';

import { getI18nString } from 'i18n';
import { getHtmlHead, getHtmlHeader, getHtmlBox } from 'htmlContents';

// Start a Hono app
const app = new Hono();

type Bindings = 
{
	diningDB: D1Database
};

const STORE_ENDPOINT = "https://sushipass.sushiro.com.hk/api/2.0/info/store?region=HK&storeid=";
const STORE_QUEUE_ENDPOINT = "https://sushipass.sushiro.com.hk/api/2.0/remote/groupqueues?region=HK&storeid=";
const REGIONS = [1, 2, 3];

app.get('/', async (c) => 
	{
		const headData =
		{
			title: getI18nString("site.title"),
			iconPath: "https://asset.hlcheng.cf/dining/sushiro/logo.png"
		}
		const headHtmlContent = html(getHtmlHead(headData));

		const headerData = 
		{
			title: getI18nString("brand.sushiro.header.title"),
			subtitle: getI18nString("brand.sushiro.header.subtitle"),
			iconPath: "https://asset.hlcheng.cf/dining/sushiro/logo.png",
    		iconAltText: "Sushiro"
		};
		const headerHtmlContent = html(getHtmlHeader(headerData));

		const regionPromises = REGIONS.map(region => createRegionSection(c, region, 6));
		const settledResults = await Promise.allSettled(regionPromises);

		let regionsHtmlString: string[] = new Array();
		for (const result of settledResults)
		{
			if (result.status === 'fulfilled')
			{
				regionsHtmlString.push(result.value);
			}
			else
			{
				console.error(result.reason);
			}
		}
		
		const allRegionsHtmlContent = html(regionsHtmlString.join(''));
		
		const htmlContent = html`
	  		<!doctype html>
		    		${headHtmlContent}
				<body>
	   				${headerHtmlContent}
					<div class="card-container">
     						${allRegionsHtmlContent}
					</div>
	   			</body>
       			</html>
       		`;
		
		return c.html(htmlContent);
	}
);

app.get('/:region', async (c) =>
	{
		const headData =
		{
			title: getI18nString("site.title"),
			iconPath: "https://asset.hlcheng.cf/dining/sushiro/logo.png"
		}
		const headHtmlContent = html(getHtmlHead(headData));

		const headerData = 
		{
			title: getI18nString("brand.sushiro.header.title"),
			subtitle: getI18nString("brand.sushiro.header.subtitle"),
			iconPath: "https://asset.hlcheng.cf/dining/sushiro/logo.png",
    		iconAltText: "Sushiro"
		};
		const headerHtmlContent = html(getHtmlHeader(headerData));

		const region: number = c.req.param('region');
		const regionHtmlContent = html(await createRegionSection(c, region));

		const htmlContent = html`
	  		<!doctype html>
		    		${headHtmlContent}
				<body>
	   				${headerHtmlContent}
					<div class="card-container">
     						${regionHtmlContent}
					</div>
	   			</body>
       			</html>
       		`;
		
		return c.html(htmlContent);
	}
);

// Export the Hono app
export default app;

async function createRegionSection(c, region: number, limit?: number)
{
	let regionHtmlString: string[] = new Array();
	const queryRegionName = 'SELECT name_key FROM regions WHERE region_id = ?';
	const regionNameKey = await c.env.diningDB.prepare(queryRegionName).bind(region).first("name_key");
	regionHtmlString.push("<h2 class='region'>" + getI18nString(regionNameKey) + "</h2>");
	
	let queryStoreIdList = "SELECT store_id from stores_sushiro ss LEFT JOIN areas a ON ss.area_id = a.area_id WHERE a.region_id = ? ORDER BY store_id ASC";
	let resultStoreIdList;
	if (limit != null)
	{
		queryStoreIdList = queryStoreIdList + " LIMIT ?";
		resultStoreIdList = (await c.env.diningDB.prepare(queryStoreIdList).bind(region, limit).all()).results;
	}
	else
	{
		resultStoreIdList = (await c.env.diningDB.prepare(queryStoreIdList).bind(region).all()).results;
	}	
	
	const storePromises = resultStoreIdList.map(store => createStoreSection(store.store_id));
	const settledResults = await Promise.allSettled(storePromises);

	regionHtmlString.push("<div class='box'>");
	for (const result of settledResults)
	{
		if (result.status === 'fulfilled')
		{
			regionHtmlString.push(result.value);
		}
		else
		{
			console.error(result.reason);
		}
	}
	regionHtmlString.push("</div>");
	
	let footerHtmlString: string[] = new Array();
	if (limit != null)
	{
		footerHtmlString.push("<a href='" + c.req.path + "/" + region + "'><h4>" + getI18nString("button.showMore") + "</h4></a>");		
	}
	else
	{
		let path = c.req.path;
		path = path.substring(0, path.lastIndexOf('/'));
		footerHtmlString.push("<a href='" + path + "'><h4>" + getI18nString("button.back") + "</h4></a>");		
	}	
	regionHtmlString.push(footerHtmlString.join(''));
	
	return regionHtmlString.join('');
}


async function createStoreSection(storeId: number)
{
	const storeUrl = STORE_ENDPOINT + storeId;
	const storeQueueUrl = STORE_QUEUE_ENDPOINT + storeId;
	const displayData = 
	{
		url: "#",
		title: "",
		titleBackground: false,
		contentTitle: new Array(),
		contentValue: new Array()
	};

	try
	{
		const [storePromise, queuePromise] = await Promise.all([fetch(storeUrl), fetch(storeQueueUrl)]);
		
		const storeJson = await storePromise.json();
		const queueJson = await queuePromise.json();
		
		if (storePromise.status == 200 && queuePromise.status == 200)
		{
			displayData.title = getI18nString("brand.sushiro.stores.store" + storeId + ".name");
			displayData.contentTitle.push(getI18nString("store.opening.status"));
			switch (storeJson.storeStatus)
			{
				case 'OPEN':
					displayData.contentValue.push(getI18nString("store.opening.open"));
					displayData.contentTitle.push(getI18nString("store.queue.status"));
					if (storeJson.localTicketingStatus == "ON")
					{
						displayData.contentValue.push(getI18nString("store.queue.ticketing"));						
					}
					else
					{
						displayData.contentValue.push(getI18nString("store.queue.stopped"));
					}
					break;
				case 'CLOSED':
					displayData.contentValue.push(getI18nString("store.opening.closed"));
					break;					
			}
			displayData.contentTitle.push(getI18nString("store.waitingGroupCount"));
			displayData.contentValue.push(storeJson.waitingGroup);
			
			let queue = "";
			for (let i = 0; i < queueJson.storeQueue.length; i++)
			{
				queue += queueJson.storeQueue[i];
				if (i + 1 < queueJson.storeQueue.length)
				{
					queue += " , ";
				}
			}
			displayData.contentTitle.push(getI18nString("store.queue.currentTicket"));
			displayData.contentValue.push(queue);			
		}		
		else
		{
			displayData.title = getI18nString("status.error");
			displayData.contentTitle = [getI18nString("status.info")];
			displayData.contentValue = [getI18nString("message.notAbleCommServer")];
		}
	}
	catch(err)
	{
		displayData.title = getI18nString("status.error");
	}
	return getHtmlBox(displayData);
}
