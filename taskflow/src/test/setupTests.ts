import "@testing-library/jest-dom"
import { TextDecoder, TextEncoder } from "util"

if (!global.TextEncoder) {
  Object.assign(global, { TextEncoder })
}

if (!global.TextDecoder) {
  Object.assign(global, { TextDecoder })
}
