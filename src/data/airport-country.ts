/*
 * GetStopover — airport -> ISO country, used to tell an INTERNATIONAL connection
 * (security re-screen, longer walks, earlier international boarding close) from a
 * domestic one in the connection-fit estimate. US/CA come from airports-na; this
 * adds the major non-NA hubs. Facts (an airport's country), not thresholds. An
 * unknown code returns null and the fit check falls back conservatively.
 */
import { naAirport } from "./airports-na";

var intl: Record<string, string> = {
  // United Kingdom / Ireland
  LHR:"GB", LGW:"GB", STN:"GB", LTN:"GB", MAN:"GB", EDI:"GB", BHX:"GB", GLA:"GB", BRS:"GB", NCL:"GB", DUB:"IE",
  // Western / Central Europe
  CDG:"FR", ORY:"FR", NCE:"FR", LYS:"FR", MRS:"FR",
  FRA:"DE", MUC:"DE", DUS:"DE", BER:"DE", HAM:"DE", STR:"DE", CGN:"DE",
  AMS:"NL", BRU:"BE", LUX:"LU", ZRH:"CH", GVA:"CH", BSL:"CH", VIE:"AT",
  // Southern Europe
  MAD:"ES", BCN:"ES", AGP:"ES", PMI:"ES", VLC:"ES", SVQ:"ES", ALC:"ES",
  FCO:"IT", MXP:"IT", LIN:"IT", BGY:"IT", VCE:"IT", NAP:"IT", BLQ:"IT", CTA:"IT",
  LIS:"PT", OPO:"PT", ATH:"GR", SKG:"GR",
  // Northern / Eastern Europe
  CPH:"DK", ARN:"SE", GOT:"SE", OSL:"NO", BGO:"NO", HEL:"FI",
  WAW:"PL", KRK:"PL", PRG:"CZ", BUD:"HU", OTP:"RO", ZAG:"HR", BEG:"RS", SOF:"BG",
  SVO:"RU", DME:"RU", LED:"RU", KBP:"UA",
  // Turkey / Middle East
  IST:"TR", SAW:"TR", AYT:"TR", ESB:"TR", ADB:"TR",
  DXB:"AE", AUH:"AE", SHJ:"AE", DOH:"QA", JED:"SA", RUH:"SA", DMM:"SA",
  KWI:"KW", BAH:"BH", MCT:"OM", TLV:"IL", AMM:"JO", BEY:"LB",
  // Africa
  CAI:"EG", HRG:"EG", SSH:"EG", CMN:"MA", RAK:"MA", TUN:"TN",
  JNB:"ZA", CPT:"ZA", DUR:"ZA", NBO:"KE", ADD:"ET", LOS:"NG", ABV:"NG", ACC:"GH", DAR:"TZ", MRU:"MU",
  // South Asia
  DEL:"IN", BOM:"IN", BLR:"IN", MAA:"IN", HYD:"IN", CCU:"IN", COK:"IN", AMD:"IN", GOI:"IN", PNQ:"IN",
  KHI:"PK", LHE:"PK", ISB:"PK", DAC:"BD", CMB:"LK", KTM:"NP", MLE:"MV",
  // East Asia
  PEK:"CN", PKX:"CN", PVG:"CN", SHA:"CN", CAN:"CN", SZX:"CN", CTU:"CN", CKG:"CN", KMG:"CN", XIY:"CN",
  HGH:"CN", WUH:"CN", CSX:"CN", NKG:"CN", TAO:"CN", XMN:"CN", HAK:"CN",
  HKG:"HK", TPE:"TW", KHH:"TW",
  NRT:"JP", HND:"JP", KIX:"JP", NGO:"JP", FUK:"JP", CTS:"JP", OKA:"JP",
  ICN:"KR", GMP:"KR", PUS:"KR", CJU:"KR",
  // Southeast Asia / Oceania
  SIN:"SG", KUL:"MY", PEN:"MY", BKI:"MY", BKK:"TH", DMK:"TH", HKT:"TH", CNX:"TH",
  CGK:"ID", DPS:"ID", SUB:"ID", MNL:"PH", CEB:"PH", SGN:"VN", HAN:"VN", DAD:"VN", PNH:"KH", RGN:"MM",
  SYD:"AU", MEL:"AU", BNE:"AU", PER:"AU", ADL:"AU", OOL:"AU", CNS:"AU", AKL:"NZ", CHC:"NZ", WLG:"NZ", NAN:"FJ",
  // Latin America / Caribbean
  GRU:"BR", GIG:"BR", BSB:"BR", CNF:"BR", REC:"BR", SSA:"BR", POA:"BR", CWB:"BR", FOR:"BR",
  EZE:"AR", AEP:"AR", COR:"AR", SCL:"CL", BOG:"CO", MDE:"CO", CTG:"CO", CLO:"CO", LIM:"PE", UIO:"EC", GYE:"EC",
  MEX:"MX", CUN:"MX", GDL:"MX", MTY:"MX", TIJ:"MX", SJD:"MX", PVR:"MX",
  PTY:"PA", SJO:"CR", SAL:"SV", GUA:"GT", SDQ:"DO", PUJ:"DO", KIN:"JM", MBJ:"JM", HAV:"CU", NAS:"BS",
};

export function country(code: string | null | undefined): string | null {
  if (!code) return null;
  var na = naAirport[code];
  if (na) return na.c;
  return intl[code] || null;
}
