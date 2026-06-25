import { loadSettings } from "./settings";
import { panel } from "./panel";
import { startScanner } from "./scanner";
import "../sites/skyscanner";
import "../sites/google";
import "../sites/kayak";
import "../sites/expedia";
import "../sites/trip";
import "../sites/kiwi";

loadSettings(function () {
  panel.refresh();
});

startScanner();
