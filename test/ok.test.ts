import { assert } from "conditional-type-checks";
import { Err, Ok, Result } from "../src";
import { eq, expect_never, expect_string } from "./util";
import { OkImpl } from "../src/result";

test("Constructable & Callable", () => {
  const a = new Ok(3);
  expect(a).toBeInstanceOf(OkImpl);
  eq<typeof a, Ok<number>>(true);

  const b = Result.Ok(3);
  expect(b).toBeInstanceOf(OkImpl);
  eq<typeof b, Ok<number>>(true);

  function mapper<T>(fn: (val: string) => T): T {
    return fn("hi");
  }

  const mapped = mapper(Result.Ok);
  expect(mapped).toMatchResult(new Ok("hi"));

  // TODO: This should work!
  // eq<typeof mapped, Ok<string>>(true);

  // @ts-expect-error Ok<string> is not assignable to Ok<number>
  mapper<Ok<number>>(Result.Ok);
});

test("ok, err, and val", () => {
  const err = new Ok(32);
  expect(err.err).toBe(false);
  assert<typeof err.err>(false);

  expect(err.ok).toBe(true);
  assert<typeof err.ok>(true);

  expect(err.val).toBe(32);
  eq<typeof err.val, number>(true);
});

test("static EMPTY", () => {
  expect(Ok.EMPTY).toBeInstanceOf(OkImpl);
  expect(Ok.EMPTY.val).toBe(undefined);
  eq<typeof Ok.EMPTY, Ok<void>>(true);
});

test("unwrapOr", () => {
  const e2 = Result.Ok(3).unwrapOr(false);
  expect(e2).toBe(3);
  eq<number, typeof e2>(true);
});

test("expect", () => {
  const val = Result.Ok(true).expect("should not fail!");
  expect(val).toBe(true);
  eq<boolean, typeof val>(true);
});

test("expectErr", () => {
  expect(() => {
    const err = Result.Ok(true).expectErr("should fail!");
    expect_never(err, true);
  }).toThrowError("should fail!");
});

test("unwrap", () => {
  const val = Result.Ok(true).unwrap();
  expect(val).toBe(true);
  eq<boolean, typeof val>(true);
});

test("map", () => {
  const mapped = Result.Ok(3).map((x) => x.toString(10));
  expect(mapped).toMatchResult(Result.Ok("3"));
  eq<typeof mapped, Ok<string>>(true);
});

test("andThen", () => {
  const ok = new Ok("Ok").andThen(() => new Ok(3));
  expect(ok).toMatchResult(Result.Ok(3));
  eq<typeof ok, Ok<number>>(true);

  const err = new Ok("Ok").andThen(() => new Err(false));
  expect(err).toMatchResult(Result.Err(false));
  eq<typeof err, Result<string, boolean>>(true);
});

test("mapErr", () => {
  const ok = Result.Ok("32").mapErr((x: any) => +x);
  expect(ok).toMatchResult(Result.Ok("32"));
  eq<typeof ok, Ok<string>>(true);
});

test("iterable", () => {
  let i = 0;
  for (const char of Result.Ok("hello")) {
    expect("hello"[i]).toBe(char);
    expect_string(char, true);
    i++;
  }

  i = 0;
  for (const item of Result.Ok([1, 2, 3])) {
    expect([1, 2, 3][i]).toBe(item);
    eq<number, typeof item>(true);
    i++;
  }

  for (const item of Result.Ok(1)) {
    expect_never(item, true);

    throw new Error(
      "Unreachable, Err@@iterator should emit no value and return",
    );
  }
});

test("to string", () => {
  expect(`${Result.Ok(1)}`).toEqual("Ok(1)");
  expect(`${Result.Ok({ name: "George" })}`).toEqual('Ok({"name":"George"})');
});
