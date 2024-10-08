import { Hono } from 'hono';

const app = new Hono();

export default app;

let KV_I18N: KVNamespace;
let LANGUAGE: string;
let dictionary;

export function setNamespace(kv: KVNamespace)
{
    KV_I18N = kv;
}

export async function setLanguage(acceptLanguage: string)
{
    LANGUAGE = acceptLanguage;
    const translation = JSON.parse(await KV_I18N.get(LANGUAGE));
    dictionary = translation;
}

export function getI18nString(key: string): string
{
    if (LANGUAGE != null)
    {
        const keys = key.split(".");
        let value = dictionary;
        for (let i = 0; i < keys.length; i++)
        {
            value = value[keys[i]];
            if (value === undefined)
            {
                break;
            }
        }
        return value;
    }
    else
    {
        return "No Value";
    }
}