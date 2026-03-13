import { NextResponse } from 'next/server';

export function jsonOk<T>(data: T): NextResponse {
  return NextResponse.json(data, { status: 200 });
}

export function jsonError(status: number, error: string): NextResponse {
  return NextResponse.json({ error }, { status });
}
