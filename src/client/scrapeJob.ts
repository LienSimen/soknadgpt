import { scrapeJob as scrapeJobAction } from 'wasp/client/operations';

export async function scrapeJob(url: string): Promise<any> {
  console.log(`Scraping job from: ${url}`);
  return await scrapeJobAction(url);
}
