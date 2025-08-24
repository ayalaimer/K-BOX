
export function wazeSearchUrl(address: string): string {
  const base = "https://waze.com/ul";
  const q = encodeURIComponent(address);
  return `${base}?q=${q}&navigate=yes`;
}
