import { EntityNotFoundError } from "@io-sign/io-sign/error";
import { createBillingEvent, SendBillingEvent } from "@io-sign/io-sign/event";
import { SubmitNotificationForUser } from "@io-sign/io-sign/notification";

import { SignatureRequestSigned } from "@io-sign/io-sign/signature-request";
import { GetFiscalCodeBySignerId } from "@io-sign/io-sign/signer";

import { pipe } from "fp-ts/lib/function";

import * as TE from "fp-ts/lib/TaskEither";
import { Dossier, GetDossier } from "../../dossier";

import {
  UpsertSignatureRequest,
  markAsSigned,
  GetSignatureRequest,
  SignatureRequest,
} from "../../signature-request";
import {
  MakeMessageContent,
  makeSendSignatureRequestNotification,
} from "../../signature-request-notification";

const signedMessage: MakeMessageContent =
  (dossier: Dossier) => (signatureRequest: SignatureRequest) => ({
    content: {
      subject: `${signatureRequest.issuerDescription} - ${dossier.title} - Documenti firmati`,
      markdown: `---\nit:\n    cta_1: \n        text: "Vedi documenti"\n        action: "ioit://FCI_MAIN?signatureRequestId=${signatureRequest.id}"\nen:\n    cta_1: \n        text: See documents"\n        action: "ioit://FCI_MAIN?signatureRequestId=${signatureRequest.id}"\n---\nI documenti che hai firmato sono pronti!\n\n\nHai **90 giorni** dalla ricezione di questo messaggio per visualizzarli e salvarli sul tuo dispositivo.\n`,
    },
  });

export const makeMarkRequestAsSigned =
  (
    getDossier: GetDossier,
    getSignatureRequest: GetSignatureRequest,
    upsertSignatureRequest: UpsertSignatureRequest,
    submitNotification: SubmitNotificationForUser,
    getFiscalCodeBySignerId: GetFiscalCodeBySignerId,
    sendBillingEvent: SendBillingEvent
  ) =>
  (request: SignatureRequestSigned) => {
    const sendSignedNotification = makeSendSignatureRequestNotification(
      submitNotification,
      getFiscalCodeBySignerId,
      getDossier,
      signedMessage
    );
    return pipe(
      pipe(request.issuerId, getSignatureRequest(request.id)),
      TE.chain(
        TE.fromOption(
          () => new EntityNotFoundError("Signature Request not found.")
        )
      ),
      TE.chainEitherK(markAsSigned),
      TE.chain(upsertSignatureRequest),
      TE.chainW(() =>
        pipe(
          request,
          sendSignedNotification,
          // This is a fire-and-forget operation
          TE.altW(() => TE.right(request))
        )
      ),
      TE.chain(() => pipe(request, createBillingEvent, sendBillingEvent))
    );
  };