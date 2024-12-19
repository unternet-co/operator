export function isElectron() {
  console.log(typeof navigator);
  console.log(navigator.userAgent);
  return (
    typeof navigator !== 'undefined' &&
    navigator.userAgent.toLowerCase().includes('electron')
  );
}
