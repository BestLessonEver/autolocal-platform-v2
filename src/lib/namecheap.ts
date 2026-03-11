/**
 * Namecheap API client for domain operations
 * Docs: https://www.namecheap.com/support/api/methods/
 */

const SANDBOX_URL = 'https://api.sandbox.namecheap.com/xml.response'
const PROD_URL = 'https://api.namecheap.com/xml.response'

function getBaseUrl(): string {
  return process.env.NAMECHEAP_SANDBOX === 'true' ? SANDBOX_URL : PROD_URL
}

function getBaseParams(): Record<string, string> {
  return {
    ApiUser: process.env.NAMECHEAP_API_USER || '',
    ApiKey: process.env.NAMECHEAP_API_KEY || '',
    UserName: process.env.NAMECHEAP_API_USER || '',
    ClientIp: process.env.NAMECHEAP_CLIENT_IP || '127.0.0.1',
  }
}

function buildUrl(command: string, params: Record<string, string> = {}): string {
  const all = { ...getBaseParams(), Command: command, ...params }
  const qs = Object.entries(all).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&')
  return `${getBaseUrl()}?${qs}`
}

/** Parse Namecheap XML response — simple key/value extraction */
function parseXmlAttr(xml: string, tag: string, attr: string): string | null {
  const regex = new RegExp(`<${tag}[^>]*${attr}="([^"]*)"`, 'i')
  const match = xml.match(regex)
  return match ? match[1] : null
}

function parseXmlAttrs(xml: string, tag: string): Record<string, string>[] {
  const regex = new RegExp(`<${tag}\\s+([^>]*)\\/?\\s*>`, 'gi')
  const results: Record<string, string>[] = []
  let match
  while ((match = regex.exec(xml)) !== null) {
    const attrs: Record<string, string> = {}
    const attrRegex = /(\w+)="([^"]*)"/g
    let attrMatch
    while ((attrMatch = attrRegex.exec(match[1])) !== null) {
      attrs[attrMatch[1]] = attrMatch[2]
    }
    results.push(attrs)
  }
  return results
}

function isApiError(xml: string): string | null {
  const status = parseXmlAttr(xml, 'ApiResponse', 'Status')
  if (status === 'ERROR') {
    const errMatch = xml.match(/<Error[^>]*>(.*?)<\/Error>/i)
    return errMatch ? errMatch[1] : 'Unknown Namecheap API error'
  }
  return null
}

export interface DomainAvailability {
  domain: string
  available: boolean
  price?: number
  currency?: string
  isPremium?: boolean
}

/** Check if one or more domains are available */
export async function checkAvailability(domains: string[]): Promise<DomainAvailability[]> {
  const domainList = domains.join(',')
  const url = buildUrl('namecheap.domains.check', { DomainList: domainList })
  
  const res = await fetch(url)
  const xml = await res.text()
  
  const err = isApiError(xml)
  if (err) throw new Error(`Namecheap API: ${err}`)
  
  const results = parseXmlAttrs(xml, 'DomainCheckResult')
  return results.map(r => ({
    domain: r.Domain || '',
    available: r.Available === 'true',
    isPremium: r.IsPremiumName === 'true',
  }))
}

/** Get pricing for domain TLDs */
export async function getPricing(tld: string = 'com'): Promise<{ register: number; renew: number }> {
  const url = buildUrl('namecheap.users.getPricing', {
    ProductType: 'DOMAIN',
    ProductCategory: 'REGISTER',
    ProductName: tld,
  })
  
  const res = await fetch(url)
  const xml = await res.text()
  
  const err = isApiError(xml)
  if (err) throw new Error(`Namecheap pricing: ${err}`)
  
  // Extract price from ProductType > ProductCategory > Product > Price
  const priceAttrs = parseXmlAttrs(xml, 'Price')
  const registerPrice = priceAttrs.find(p => p.Duration === '1')
  
  return {
    register: registerPrice ? parseFloat(registerPrice.Price || registerPrice.RegularPrice || '10.98') : 10.98,
    renew: registerPrice ? parseFloat(registerPrice.RegularPrice || '12.98') : 12.98,
  }
}

export interface DomainRegistration {
  domain: string
  firstName: string
  lastName: string
  address: string
  city: string
  state: string
  postalCode: string
  country: string
  phone: string
  email: string
}

/** Register a new domain */
export async function registerDomain(reg: DomainRegistration): Promise<{ success: boolean; domainId?: string; error?: string }> {
  const params: Record<string, string> = {
    DomainName: reg.domain,
    Years: '1',
    // Registrant contact
    RegistrantFirstName: reg.firstName,
    RegistrantLastName: reg.lastName,
    RegistrantAddress1: reg.address,
    RegistrantCity: reg.city,
    RegistrantStateProvince: reg.state,
    RegistrantPostalCode: reg.postalCode,
    RegistrantCountry: reg.country,
    RegistrantPhone: reg.phone,
    RegistrantEmailAddress: reg.email,
    // Tech contact (same as registrant)
    TechFirstName: reg.firstName,
    TechLastName: reg.lastName,
    TechAddress1: reg.address,
    TechCity: reg.city,
    TechStateProvince: reg.state,
    TechPostalCode: reg.postalCode,
    TechCountry: reg.country,
    TechPhone: reg.phone,
    TechEmailAddress: reg.email,
    // Admin contact (same)
    AdminFirstName: reg.firstName,
    AdminLastName: reg.lastName,
    AdminAddress1: reg.address,
    AdminCity: reg.city,
    AdminStateProvince: reg.state,
    AdminPostalCode: reg.postalCode,
    AdminCountry: reg.country,
    AdminPhone: reg.phone,
    AdminEmailAddress: reg.email,
    // AuxBilling (same)
    AuxBillingFirstName: reg.firstName,
    AuxBillingLastName: reg.lastName,
    AuxBillingAddress1: reg.address,
    AuxBillingCity: reg.city,
    AuxBillingStateProvince: reg.state,
    AuxBillingPostalCode: reg.postalCode,
    AuxBillingCountry: reg.country,
    AuxBillingPhone: reg.phone,
    AuxBillingEmailAddress: reg.email,
    // Privacy
    AddFreeWhoisguard: 'yes',
    WGEnabled: 'yes',
  }
  
  const url = buildUrl('namecheap.domains.create', params)
  const res = await fetch(url, { method: 'POST' })
  const xml = await res.text()
  
  const err = isApiError(xml)
  if (err) return { success: false, error: err }
  
  const result = parseXmlAttrs(xml, 'DomainCreateResult')
  if (result.length > 0 && result[0].Registered === 'true') {
    return { success: true, domainId: result[0].DomainID }
  }
  
  return { success: false, error: 'Registration returned unexpected result' }
}

/** Set DNS hosts (CNAME, A records) for a domain */
export async function setDnsRecords(domain: string, records: { type: string; host: string; value: string; ttl?: number }[]): Promise<boolean> {
  const [sld, tld] = domain.split('.')
  
  const params: Record<string, string> = {
    SLD: sld,
    TLD: tld,
  }
  
  records.forEach((r, i) => {
    const n = i + 1
    params[`HostName${n}`] = r.host
    params[`RecordType${n}`] = r.type
    params[`Address${n}`] = r.value
    params[`TTL${n}`] = String(r.ttl || 1800)
  })
  
  const url = buildUrl('namecheap.domains.dns.setHosts', params)
  const res = await fetch(url)
  const xml = await res.text()
  
  const err = isApiError(xml)
  if (err) throw new Error(`Namecheap DNS: ${err}`)
  
  return parseXmlAttr(xml, 'DomainDNSSetHostsResult', 'IsSuccess') === 'true'
}

/** Get list of domains in the account */
export async function listDomains(): Promise<{ domain: string; expires: string; autoRenew: boolean }[]> {
  const url = buildUrl('namecheap.domains.getList')
  const res = await fetch(url)
  const xml = await res.text()
  
  const err = isApiError(xml)
  if (err) throw new Error(`Namecheap list: ${err}`)
  
  return parseXmlAttrs(xml, 'Domain').map(d => ({
    domain: d.Name || '',
    expires: d.Expires || '',
    autoRenew: d.AutoRenew === 'true',
  }))
}
