import { assert } from "conditional-type-checks";
import { Err, Ok, Result } from "../src";
import { eq, expect_never } from "./util";
import { ErrImpl } from "../src/result";

test("Constructable & Callable", () => {
  const a = new Err(3);
  expect(a).toBeInstanceOf(ErrImpl);
  eq<typeof a, Err<number>>(true);

  const b = Result.Err(3);
  expect(b).toBeInstanceOf(ErrImpl);
  eq<typeof b, Err<number>>(true);

  function mapper<T>(fn: (val: string) => T): T {
    return fn("hi");
  }
  const mapped = mapper(Result.Err);
  expect(mapped).toMatchResult(new Err("hi"));

  // TODO: This should work!
  eq<typeof mapped, Err<string>>(true);

  // @ts-expect-error Err<string> is not assignable to Err<number>
  mapper<Err<number>>(Result.Err);
});

test("ok, err, and val", () => {
  const err = new Err(32);
  expect(err.err).toBe(true);
  assert<typeof err.err>(true);

  expect(err.ok).toBe(false);
  assert<typeof err.ok>(false);

  expect(err.val).toBe(32);
  eq<typeof err.val, number>(true);
});

test("static EMPTY", () => {
  expect(Err.EMPTY).toBeInstanceOf(ErrImpl);
  expect(Err.EMPTY.val).toBe(undefined);
  eq<typeof Err.EMPTY, Err<void>>(true);
});

test("unwrapOr", () => {
  const e2 = Result.Err(3).unwrapOr(false);
  expect(e2).toBe(false);
  eq<false, typeof e2>(true);
});

test("expect", () => {
  expect(() => {
    const err = Result.Err(true).expect("should fail!");
    expect_never(err, true);
  }).toThrowError("should fail!");
});

test("expectErr", () => {
  const err = Result.Err({ message: "error" }).expectErr("");
  expect(err).toMatchObject({ message: "error" });
});

test("unwrap", () => {
  expect(() => {
    const err = Result.Err({ message: "bad error" }).unwrap();
    expect_never(err, true);
  }).toThrowError('{"message":"bad error"}');
});

test("map", () => {
  const err = Result.Err(3).map((x: any) => Symbol());
  expect(err).toMatchResult(Result.Err(3));
  eq<typeof err, Err<number>>(true);
});

test("andThen", () => {
  const err = new Err("Err").andThen(() => new Ok(3));
  expect(err).toMatchResult(Result.Err("Err"));
  eq<typeof err, Err<string>>(true);
});

test("mapErr", () => {
  const err = Result.Err("32").mapErr((x) => +x);
  expect(err).toMatchResult(Result.Err(32));
  eq<typeof err, Err<number>>(true);
});

test("iterable", () => {
  for (const item of Result.Err([123])) {
    expect_never(item, true);
    throw new Error(
      "Unreachable, Err@@iterator should emit no value and return",
    );
  }
});

test("to string", () => {
  expect(`${Result.Err(1)}`).toEqual("Err(1)");
  expect(`${Result.Err({ name: "George" })}`).toEqual('Err({"name":"George"})');
});

test("stack trace", () => {
  function first(): Err<number> {
    return second();
  }

  function second(): Err<number> {
    return Result.Err(1);
  }

  const err = first();
  expect(err.stack).toMatch(/at second/);
  expect(err.stack).toMatch(/at first/);
  expect(err.stack).toMatch(/err\.test\.ts/);
  expect(err.stack).toMatch(/Err\(1\)/);
  expect(err.stack).not.toMatch(/ErrImpl/);

  const err2 = Result.Err(new Error("inner error"));
  expect(err2.stack).toMatch(/Err\(Error: inner error\)/);
});
