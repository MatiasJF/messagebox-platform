/**
 * Shared JavaScript functionality for the MessageBox Certifier Platform
 */

// API base URL - can be configured via environment variable in production
const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3000'
  : '' // Use relative URLs in production

/**
 * Make an API request with error handling
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`)
    }

    return data
  } catch (error) {
    console.error('API request failed:', error)
    throw error
  }
}

/**
 * Format a date to a readable string
 */
function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Truncate a long string (like identity keys)
 */
function truncateString(str, maxLength = 20) {
  if (str.length <= maxLength) return str
  return str.substring(0, maxLength) + '...'
}

/**
 * Format satoshis to BSV
 */
function satoshisToBSV(satoshis) {
  return (satoshis / 100000000).toFixed(8) + ' BSV'
}

/**
 * Copy text to clipboard
 */
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    showNotification('Copied to clipboard!', 'success')
  } catch (err) {
    console.error('Failed to copy:', err)
    showNotification('Failed to copy to clipboard', 'error')
  }
}

/**
 * Show a temporary notification
 */
function showNotification(message, type = 'info') {
  const notification = document.createElement('div')
  notification.className = `notification notification-${type}`
  notification.textContent = message
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    background-color: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#2563eb'};
    color: white;
    border-radius: 8px;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    animation: slideIn 0.3s ease-out;
  `

  document.body.appendChild(notification)

  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-out'
    setTimeout(() => {
      document.body.removeChild(notification)
    }, 300)
  }, 3000)
}

// Add animations
const style = document.createElement('style')
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`
document.head.appendChild(style)

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    apiRequest,
    formatDate,
    truncateString,
    satoshisToBSV,
    copyToClipboard,
    showNotification
  }
}
