import { z } from "zod";

const parse = z.number().int().positive();
const res = parse.safeParse(-123);

if (res.success !== true) {
  const { _errors } = res.error.format();
  for (const error of _errors) {
    console.log(`[zod::error] ${error}`);
  }
} else {
  console.log(`[zod::success] Test passed!`);
}
