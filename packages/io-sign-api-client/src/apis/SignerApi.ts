/* tslint:disable */
/* eslint-disable */
/**
 * Firma con IO - Issuer API
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 1.2.1
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


import * as runtime from '../runtime';
import type {
  GetSignerByFiscalCodeBody,
  ProblemDetail,
  SignerDetailView,
} from '../models';
import {
    GetSignerByFiscalCodeBodyFromJSON,
    GetSignerByFiscalCodeBodyToJSON,
    ProblemDetailFromJSON,
    ProblemDetailToJSON,
    SignerDetailViewFromJSON,
    SignerDetailViewToJSON,
} from '../models';

export interface GetSignerByFiscalCodeRequest {
    getSignerByFiscalCodeBody: GetSignerByFiscalCodeBody;
}

/**
 * 
 */
export class SignerApi extends runtime.BaseAPI {

    /**
     * Get Signer By Fiscal COde
     */
    async getSignerByFiscalCodeRaw(requestParameters: GetSignerByFiscalCodeRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<SignerDetailView>> {
        if (requestParameters.getSignerByFiscalCodeBody === null || requestParameters.getSignerByFiscalCodeBody === undefined) {
            throw new runtime.RequiredError('getSignerByFiscalCodeBody','Required parameter requestParameters.getSignerByFiscalCodeBody was null or undefined when calling getSignerByFiscalCode.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["Ocp-Apim-Subscription-Key"] = this.configuration.apiKey("Ocp-Apim-Subscription-Key"); // SubscriptionKey authentication
        }

        const response = await this.request({
            path: `/signers`,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: GetSignerByFiscalCodeBodyToJSON(requestParameters.getSignerByFiscalCodeBody),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => SignerDetailViewFromJSON(jsonValue));
    }

    /**
     * Get Signer By Fiscal COde
     */
    async getSignerByFiscalCode(requestParameters: GetSignerByFiscalCodeRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<SignerDetailView> {
        const response = await this.getSignerByFiscalCodeRaw(requestParameters, initOverrides);
        return await response.value();
    }

}