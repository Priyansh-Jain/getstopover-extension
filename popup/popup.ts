/*
 * GetStopover popup — nationality (per-passport visa) + "confident traveller".
 * Both persist to chrome.storage.local; content scripts react via
 * storage.onChanged and re-render live. Nationality is used only for the visa lookup.
 */
if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
  const box = document.getElementById("confident") as HTMLInputElement | null;
  const nat = document.getElementById("passport") as HTMLSelectElement | null;

  chrome.storage.local.get(["confidentTraveler", "passport"], function (res: Record<string, any>) {
    if (box) box.checked = !!(res && res.confidentTraveler);
    if (nat && res && res.passport) nat.value = res.passport;
  });

  if (box) box.addEventListener("change", function () {
    chrome.storage.local.set({ confidentTraveler: box!.checked });
  });
  if (nat) nat.addEventListener("change", function () {
    chrome.storage.local.set({ passport: nat!.value || null });
  });
}
