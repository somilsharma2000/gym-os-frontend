export function getWidgetParams() {
  let searchStr = window.location.search
  if (window.location.hash && window.location.hash.includes('?')) {
    const hashQuery = window.location.hash.substring(window.location.hash.indexOf('?'))
    if (hashQuery) searchStr = hashQuery
  }
  const params = new URLSearchParams(searchStr)
  const gymId = params.get('gym') || params.get('gym_id') || localStorage.getItem('gym_os_gym_id') || ''
  const theme = params.get('theme') || 'dark'
  return {
    gymId,
    theme,
    isLight: theme === 'light'
  }
}
