import { flow, pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";

import * as azure from "handler-kit-legacy/lib/azure";
import { createHandler } from "handler-kit-legacy";

import { Database } from "@azure/cosmos";

import { PdvTokenizerClientWithApiKey } from "@io-sign/io-sign/infra/pdv-tokenizer/client";
import { makeGetSignerByFiscalCode } from "@io-sign/io-sign/infra/pdv-tokenizer/signer";
import { error, success } from "@io-sign/io-sign/infra/http/response";

import { makeGetSignatureRequest } from "../cosmos/signature-request";
import { makeRequireSignatureRequestByFiscalCode } from "../../http/decoders/signature-request";
import { SignatureRequestToThirdPartyMessage } from "../../http/encoders/signature-request";
import { ThirdPartyMessage } from "../../http/models/ThirdPartyMessage";
import { signedNoMoreThan90DaysAgo } from "../../../signature-request";

const makeGetThirdPartyMessageDetailsHandler = (
  pdvTokenizerClientWithApiKey: PdvTokenizerClientWithApiKey,
  db: Database
) => {
  const getSignerByFiscalCode = makeGetSignerByFiscalCode(
    pdvTokenizerClientWithApiKey
  );

  const getSignatureRequest = makeGetSignatureRequest(db);

  const requireSignatureRequestByFiscalCode =
    makeRequireSignatureRequestByFiscalCode(
      getSignatureRequest,
      getSignerByFiscalCode
    );

  const decodeHttpRequest = flow(
    azure.fromHttpRequest,
    TE.fromEither,
    TE.chain(requireSignatureRequestByFiscalCode)
  );

  const encodeHttpSuccessResponse = flow(
    SignatureRequestToThirdPartyMessage.encode,
    success(ThirdPartyMessage)
  );

  return createHandler(
    decodeHttpRequest,
    (request) => pipe(request, signedNoMoreThan90DaysAgo, TE.fromEither),
    error,
    encodeHttpSuccessResponse
  );
};

export const makeGetThirdPartyMessageDetailsFunction = flow(
  makeGetThirdPartyMessageDetailsHandler,
  azure.unsafeRun
);
