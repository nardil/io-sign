import { ValidationProblem } from "@/lib/api/responses";
import { replaceSupportEmail } from "@/lib/issuers/cosmos";
import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";

const pathSchema = z.object({
  institution: z.string().uuid(),
  issuer: z.string().nonempty(),
});

type Params = z.infer<typeof pathSchema>;

const bodySchema = z
  .object({
    op: z.literal("replace"),
    path: z.literal("/supportEmail"),
    value: z.string().email(),
  })
  .array()
  .length(1);

export async function PATCH(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    pathSchema.parse(params);
  } catch (e) {
    return NextResponse.json(
      {
        title: "Bad request",
        status: 400,
      },
      {
        status: 400,
        headers: {
          "Content-Type": "application/problem+json",
        },
      }
    );
  }
  try {
    const body = await request.json();
    const {
      0: { value: newSupportEmail },
    } = bodySchema.parse(body);
    await replaceSupportEmail(
      { id: params.issuer, institutionId: params.institution },
      newSupportEmail
    );
    return new Response(null, { status: 204 });
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json(ValidationProblem(e), {
        status: 422,
        headers: {
          "Content-Type": "application/problem+json",
        },
      });
    }
    return NextResponse.json(
      {
        title: "Internal Server Error",
        detail: e instanceof Error ? e.message : "Something went wrong.",
      },
      {
        status: 500,
        headers: { "Content-Type": "application/problem+json" },
      }
    );
  }
}
