import moment from 'moment'

export const useGachaVerification = () => {
  const { encryptData, decryptData } = useEncryption()

  /**
   * Securely mark a gacha slug as verified via scan.
   * Stores an encrypted ticket in sessionStorage.
   */
  const setScanVerified = (slug: string) => {
    if (!slug) return
    
    const ticket = {
      slug: slug.toLowerCase(),
      timestamp: Date.now(),
      // Add a session-bound salt if needed, but for now this is robust enough
    }
    
    const encryptedTicket = encryptData(ticket)
    sessionStorage.setItem(`GACHA_SCAN_TICKET_${slug.toLowerCase()}`, encryptedTicket)
  }

  /**
   * Check if a gacha slug has been verified via scan in the current session.
   * Returns true if valid, false otherwise.
   */
  const isScanVerified = (slug: string): boolean => {
    if (!slug) return false
    
    // 1. Check for slug-specific secure ticket first
    const slugUpper = slug.toUpperCase()
    const encryptedTicket = sessionStorage.getItem(`GACHA_SCAN_TICKET_${slugUpper}`) || sessionStorage.getItem(`GACHA_SCAN_TICKET_${slug.toLowerCase()}`)
    
    if (encryptedTicket) {
      try {
        const ticket = decryptData(encryptedTicket)
        // Verify slug matches if it's a secure ticket
        if (ticket?.slug && ticket.slug.toLowerCase() === slug.toLowerCase()) {
          // Verify ticket hasn't expired (30 mins)
          if (Date.now() - ticket.timestamp < 30 * 60 * 1000) {
            return true
          } else {
            clearScanVerified(slug)
          }
        }
      } catch (e) {
        // Fall through if not a valid encrypted ticket
      }
    }

    // 2. Check for simple global scan ticket (set by camera page)
    const globalTicket = sessionStorage.getItem('GACHA_SCAN_TICKET_')
    if (globalTicket) {
      if (globalTicket === 'true') return true // Legacy fallback
      
      try {
        const ticket = decryptData(globalTicket)
        // Check if it's a valid global ticket object
        if (ticket?.verified === true && ticket.timestamp) {
          // Verify ticket hasn't expired (30 mins)
          if (Date.now() - ticket.timestamp < 30 * 60 * 1000) {
            return true
          }
        }
      } catch (e) {
        // Not a valid encrypted ticket
      }
    }
    
    return false
  }

  /**
   * Clear the verification for a specific gacha slug.
   * Should be called after a successful spin.
   */
  const clearScanVerified = (slug: string) => {
    if (!slug) return
    sessionStorage.removeItem(`GACHA_SCAN_TICKET_${slug.toLowerCase()}`)
    sessionStorage.removeItem(`GACHA_SCAN_TICKET_${slug.toUpperCase()}`)
    sessionStorage.removeItem('GACHA_SCAN_TICKET_')
  }

  return {
    setScanVerified,
    isScanVerified,
    clearScanVerified,
  }
}
