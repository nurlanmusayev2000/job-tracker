// Adds readable matchers such as toBeVisible() and toHaveTextContent().
import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Remove what each test rendered, so tests cannot affect each other.
afterEach(() => {
  cleanup();
});

// jsdom, the browser the tests run in, does not support <dialog> yet. These
// two methods do the part the app relies on: open and close it. Real
// browsers have their own versions, so this file is only used in tests.
if (typeof HTMLDialogElement.prototype.showModal !== "function") {
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function close() {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  };
}
