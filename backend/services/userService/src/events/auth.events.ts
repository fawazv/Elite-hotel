export enum AuthEventType {
    AUTH_REGISTERED = 'auth.registered',
    AUTH_VERIFIED = 'auth.verified',
    AUTH_LOGIN = 'auth.login'
}

export interface AuthRegisteredEvent {
    eventType: AuthEventType.AUTH_REGISTERED
    authId: string
    email: string
    phoneNumber: string
    fullName: string
    role: string
    isVerified: boolean
    timestamp: Date
}

export interface AuthVerifiedEvent {
    eventType: AuthEventType.AUTH_VERIFIED
    authId: string
    email: string
    isVerified: boolean
    timestamp: Date
}
