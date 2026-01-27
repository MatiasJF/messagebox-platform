/**
 * Type definitions for the MessageBox Certifier Platform
 */

export interface CertifiedUser {
  identityKey: string
  alias?: string
  certificationDate: Date
  certificationTxid: string
  host: string
}

export interface CertifyRequest {
  alias?: string
}

export interface CertifyResponse {
  success: boolean
  identityKey: string
  txid: string
  alias?: string
  message: string
}

export interface ListCertifiedUsersResponse {
  success: boolean
  users: Array<{
    identityKey: string
    alias?: string
    certificationDate: string
    host: string
  }>
}

export interface InitiatePaymentRequest {
  recipient: string
  amount: number
}

export interface InitiatePaymentResponse {
  success: boolean
  messageId?: string
  error?: string
}
