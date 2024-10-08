interface HeadData
{
    title: string;
    iconPath?: string;
}

interface HeaderData
{
    title: string;
    subtitle: string;
    iconPath?: string;
    iconAltText?: string;
}

interface BoxData
{
    url: string;
    title: string;
    titleBackground: boolean;
    titleBackgroundId?: string;
    contentTitle?: string[];
    contentValue?: string[];
}

export function getHtmlHead(data: HeadData): string
{
    let htmlContent = [];

    htmlContent.push("<head>");
    htmlContent.push("<title>" + data.title + "</title>");
    if (data.iconPath != null)
    {
        htmlContent.push("<link rel='icon' type='image/x-icon' href='" + data.iconPath + "'>");
    }
    htmlContent.push("<link rel='stylesheet' href='https://asset.hlcheng.cf/dining/styles.css' type='text/css'>");
    htmlContent.push("<link rel='stylesheet' href='https://fonts.googleapis.com/css?family=Noto+Sans'>");
    htmlContent.push("<meta name='viewport' content='width=device-width, initial-scale=1.0'>");
    htmlContent.push("</head>");

    return htmlContent.join('');
}

export function getHtmlHeader(data: HeaderData): string
{
    let htmlContent = [];

    htmlContent.push("<div class='center'>");
    if (data.iconPath != null && data.iconAltText != null)
    {
        htmlContent.push("<img src='" + data.iconPath + "' alt='" + data.iconAltText + "' class='logo'>");
    }
    htmlContent.push("<h1>" + data.title + "</h1>");
    htmlContent.push("<h3>" + data.subtitle + "</h3>");
    htmlContent.push("</div>");

    return htmlContent.join('');
}

export function getHtmlBox(data: BoxData): string
{
    let htmlContent = [];

    htmlContent.push("<div class='item'>");
    htmlContent.push("<a href='" + data.url + "' class='item-link'>");
    htmlContent.push("<div class='item-background'></div>");
    if (data.titleBackground)
    {
        htmlContent.push("<div class='item-title item-background-image' id='" + data.titleBackgroundId + "'>" + data.title + "</div>");
    }
    else
    {
        htmlContent.push("<div class='item-title'>" + data.title + "</div>");
    }
    for (let i in data.contentTitle)
    {
        htmlContent.push("<div class='item-content'>" + data.contentTitle[i] + ": <span class='item-content-value'>" + data.contentValue[i] + "</span></div>");
    }    
    htmlContent.push("</a></div>");
    
    return htmlContent.join('');
}