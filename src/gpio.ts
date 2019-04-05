import rpio from "rpio";
import { debounce } from "./utils/debounce";

export function setupGpio(buttonMap: Map<number, () => void>) {
  try {
    buttonMap.forEach((action, pin) => {
      rpio.open(pin, rpio.INPUT, rpio.PULL_UP);
      rpio.poll(
        pin,
        debounce(() => {
          if (rpio.read(pin) === 0) {
            action();
          }
        }),
        rpio.POLL_LOW
      );
    });
  } catch (e) {
    console.error(e);
  } finally {
    buttonMap.forEach((_, pin) => rpio.close(pin));
  }
}
