import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { isSuccessful } from "@io-sign/io-sign/infra/client-utils";
import { Agent } from "undici";

export type SendMessage = {
  sendMessage: (message: string) => TE.TaskEither<Error, void>;
};

export const sendMessage = (webhookUrl: string) => (message: string) =>
  pipe(
    TE.tryCatch(
      () =>
        fetch(webhookUrl, {
          method: "POST",
          body: JSON.stringify({
            text: message,
          }),
          dispatcher: new Agent({
            keepAliveTimeout: 10,
            keepAliveMaxTimeout: 10,
          }),
        }),
      E.toError
    ),
    TE.filterOrElse(
      isSuccessful,
      () => new Error("The attempt to post message on slack failed.")
    ),
    TE.map(() => undefined)
  );
